"""Exercise the bootstrap against a fake Docker/OpenSearch API; no live writes."""

import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest


PROJECT_DIR = Path(__file__).resolve().parents[2]
TRUST_KEY = "plugins.ml_commons.trusted_connector_endpoints_regex"
PRIVATE_KEY = "plugins.ml_commons.trusted_connector_private_endpoints_regex"
PRIVATE_ENABLED = "plugins.ml_commons.connector.private_ip_enabled"

FAKE_DOCKER = r'''#!/usr/bin/env python3
import json
import os
from pathlib import Path
import sys
from urllib.parse import urlsplit

state_path = Path(os.environ["FAKE_DOCKER_STATE"])
state = json.loads(state_path.read_text())
args = sys.argv[1:]
state["calls"].append(args)

def reply(body=None, status=200, exit_code=0):
    state_path.write_text(json.dumps(state))
    if body is not None:
        print(json.dumps(body))
    if "--write-out" in args:
        print(status)
    sys.exit(exit_code)

if args[0] == "inspect":
    state_path.write_text(json.dumps(state))
    print("true")
    sys.exit(0)
if "ollama" in args:
    reply()
if "curl" not in args:
    raise RuntimeError(args)
url = args[-1]
method = args[args.index("--request") + 1] if "--request" in args else "GET"
body = json.load(sys.stdin) if "--data-binary" in args else None
state["requests"].append({"method": method, "url": url, "body": body})
path = urlsplit(url).path
if path.endswith("/v1/models"):
    reply(json.loads(os.environ.get("FAKE_MODELS", '{"data":[{"id":"test-model"}]}')),
          exit_code=int(os.environ.get("FAKE_MODEL_EXIT", "0")))
if path == "/_cluster/health":
    reply({"status": "yellow"})
if path == "/_cluster/settings":
    if method == "GET":
        reply(state["settings"])
    for scope, values in body.items():
        state["settings"].setdefault(scope, {}).update(values)
    reply({"acknowledged": True})
if path.startswith("/.plugins-ml-config/_doc/"):
    state["configs"][path.rsplit("/", 1)[-1]] = body
    reply({"result": "updated"})
parts = path.strip("/").split("/")
if parts[:2] != ["_plugins", "_ml"]:
    raise RuntimeError(path)
resource, action = parts[2:4]
resources = state["resources"][resource]
if action == "_search":
    reply({"hits": {"hits": [{"_id": key, "_source": value}
                             for key, value in resources.items()]}})
if action in ("_create", "_register"):
    resource_id = f"{resource}-{state['next_id']}"
    state["next_id"] += 1
    resources[resource_id] = body
    reply({{"connectors": "connector_id", "models": "model_id", "agents": "agent_id"}[resource]: resource_id})
if len(parts) > 4:
    resources[action]["model_state"] = "DEPLOYED" if parts[4] == "_deploy" else "REGISTERED"
    reply({"status": "COMPLETED"})
if method == "GET":
    reply(resources[action])
resources[action].update(body)
reply({"result": "updated"})
'''


@unittest.skipUnless(shutil.which("jq"), "jq is required")
class OpenSearchAIInitTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "scripts").mkdir()
        (self.root / "deploy").mkdir()
        self.script = self.root / "scripts/opensearch-ai-init.sh"
        shutil.copy(PROJECT_DIR / "scripts/opensearch-ai-init.sh", self.script)
        (self.root / "deploy/ollama.env").write_text(
            "OLLAMA_MODEL=file-model\nOPENSEARCH_AI_CHAT_ENDPOINT=ollama-openai-proxy:11435\n"
        )
        shutil.copy(PROJECT_DIR / "deploy/sglang.env", self.root / "deploy/sglang.env")
        docker = self.root / "docker"
        docker.write_text(FAKE_DOCKER)
        docker.chmod(0o755)
        self.state_path = self.root / "state.json"
        self.state_path.write_text(json.dumps({
            "calls": [], "requests": [], "configs": {}, "next_id": 1,
            "resources": {"connectors": {}, "models": {}, "agents": {}},
            "settings": {
                "persistent": {TRUST_KEY: ["^https://existing.example/.*$"]},
                "transient": {TRUST_KEY: ["^https://transient.example/.*$"], PRIVATE_ENABLED: "false"},
                "defaults": {PRIVATE_KEY: ["^http://ollama:11434/.*$"]},
            },
        }))
        self.env = {
            key: value for key, value in os.environ.items()
            if not key.startswith(("OPENSEARCH_AI_", "SGLANG_", "OLLAMA_"))
        }
        self.env.update({
            "PATH": f"{self.root}:{os.environ['PATH']}",
            "FAKE_DOCKER_STATE": str(self.state_path),
            "OPENSEARCH_AI_OPENSEARCH_PASSWORD": "test-password",
            "OPENSEARCH_AI_PROVIDER": "sglang",
        })

    def run_init(self, **overrides):
        return subprocess.run(
            ["bash", str(self.script)], env={**self.env, **overrides},
            text=True, capture_output=True, timeout=45,
        )

    def state(self):
        return json.loads(self.state_path.read_text())

    def assert_success(self, result):
        self.assertEqual(result.returncode, 0, result.stderr)

    def request_body(self, connector):
        body = connector["actions"][0]["request_body"]
        # Substitute ML Commons placeholders to validate the emitted JSON too.
        body = re.sub(
            r"\$\{parameters\.([^}:]+)(?::-)?\}",
            lambda match: "" if match[1] in ("_chat_history", "_interactions", "tool_configs") else "example",
            body,
        )
        return json.loads(body)

    def test_sglang_routes_every_feature_and_discovers_model(self):
        self.assert_success(self.run_init())
        state = self.state()
        connectors = list(state["resources"]["connectors"].values())
        self.assertEqual(len(connectors), 6)
        self.assertEqual(len(state["configs"]), 14)
        for connector in connectors:
            self.assertTrue(connector["name"].startswith("SGLang"))
            self.assertEqual(connector["parameters"]["model"], "test-model")
            self.assertEqual(connector["parameters"]["base_url"], "http://host.docker.internal:30000/v1")
            self.assertNotIn("Authorization", connector["actions"][0]["headers"])
            self.assertNotIn("reasoning_effort", self.request_body(connector))
        self.assertTrue(all(a["name"].startswith("SGLang") for a in state["resources"]["agents"].values()))
        self.assertFalse(any("cogstack-ollama" in " ".join(call) for call in state["calls"]))

    def test_exact_trust_preserves_persistent_defaults_and_transient(self):
        self.assert_success(self.run_init(SGLANG_BASE_URL="https://inference.example:8443/team/v1/"))
        settings = self.state()["settings"]
        pattern = r"^\Qhttps://inference.example:8443/team/v1/chat/completions\E$"
        self.assertEqual(settings["persistent"][TRUST_KEY], sorted(["^https://existing.example/.*$", pattern]))
        self.assertEqual(settings["persistent"][PRIVATE_KEY], sorted(["^http://ollama:11434/.*$", pattern]))
        self.assertEqual(settings["transient"][TRUST_KEY], sorted(["^https://transient.example/.*$", pattern]))
        self.assertIs(settings["persistent"][PRIVATE_ENABLED], True)
        self.assertIs(settings["transient"][PRIVATE_ENABLED], True)

    def test_authenticated_model_and_caller_overrides(self):
        (self.root / "deploy/sglang.env").write_text(
            "OPENSEARCH_AI_PROVIDER=ollama\nSGLANG_BASE_URL=http://file-host:1/v1\n"
            "SGLANG_MODEL=file-model\nSGLANG_API_KEY=file-key\n"
        )
        self.assert_success(self.run_init(
            SGLANG_BASE_URL="http://lan-host:8000/v1", SGLANG_MODEL="test-model",
            SGLANG_API_KEY="test-token", OPENSEARCH_AI_REASONING_EFFORT="low",
            OPENSEARCH_AI_MAX_TOKENS="2048",
        ))
        state = self.state()
        for connector in state["resources"]["connectors"].values():
            self.assertEqual(connector["parameters"]["base_url"], "http://lan-host:8000/v1")
            self.assertEqual(connector["credential"], {"api_key": "test-token"})
            self.assertEqual(connector["actions"][0]["headers"]["Authorization"], "Bearer ${credential.api_key}")
            self.assertEqual(self.request_body(connector)["reasoning_effort"], "low")
        probe = next(call for call in state["calls"] if call[-1].endswith("/v1/models"))
        self.assertIn("Authorization: Bearer test-token", probe)
        chat = next(c for c in state["resources"]["connectors"].values() if c["name"] == "SGLang Agent Connector")
        self.assertEqual(self.request_body(chat)["max_tokens"], 2048)

    def test_rerun_updates_resources_and_switches_endpoint(self):
        self.assert_success(self.run_init())
        before = self.state()
        self.assert_success(self.run_init(SGLANG_BASE_URL="http://new-host:8000/v1"))
        after = self.state()
        self.assertEqual(after["next_id"], before["next_id"])
        self.assertEqual(after["configs"], before["configs"])
        for connector in after["resources"]["connectors"].values():
            self.assertEqual(connector["parameters"]["base_url"], "http://new-host:8000/v1")
        self.assertTrue(all(m["model_state"] == "DEPLOYED" for m in after["resources"]["models"].values()))

    def test_ollama_defaults_and_proxy_are_preserved(self):
        self.assert_success(self.run_init(OPENSEARCH_AI_PROVIDER="ollama", OLLAMA_MODEL="caller-model"))
        state = self.state()
        for connector in state["resources"]["connectors"].values():
            self.assertEqual(connector["parameters"]["model"], "caller-model")
            self.assertEqual(self.request_body(connector)["reasoning_effort"], "none")
            expected = "http://ollama-openai-proxy:11435/v1" if connector["name"] == "Ollama Qwen Agent Connector" else "http://ollama:11434/v1"
            self.assertEqual(connector["parameters"]["base_url"], expected)
        self.assertTrue(all(a["name"].startswith("Qwen") for a in state["resources"]["agents"].values()))
        self.assertFalse(any(r["method"] == "PUT" and r["url"].endswith("/_cluster/settings") for r in state["requests"]))

    def test_invalid_configuration_fails_before_writes(self):
        cases = [
            {"SGLANG_MODEL": "missing"},
            {"FAKE_MODELS": '{"data":[{"id":"a"},{"id":"b"}]}'},
            {"FAKE_MODELS": '{"data":[]}'},
            {"FAKE_MODEL_EXIT": "22"},
            {"SGLANG_BASE_URL": "http://host:30000"},
            {"SGLANG_BASE_URL": "http://user:pass@host:30000/v1"},
            {"OPENSEARCH_AI_PROVIDER": "invalid"},
        ]
        for case in cases:
            with self.subTest(case=case):
                result = self.run_init(**case)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(self.state()["resources"]["connectors"], {})
                self.assertFalse(any(r["method"] in ("PUT", "POST") for r in self.state()["requests"]))


if __name__ == "__main__":
    unittest.main()
