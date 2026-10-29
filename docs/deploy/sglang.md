# OpenSearch AI with a locally hosted SGLang server

Configure `deploy/sglang.env` to connect the existing OpenSearch Dashboards AI
features to an already running SGLang server. No SGLang container or Python
environment is created by these commands.

Run these commands from the repository's `deploy/` directory:

```bash
# Defaults to http://host.docker.internal:30000/v1 and discovers a single model.
make opensearch-ai-init-sglang

# Override the URL/model for a different port, host, or served model alias.
SGLANG_BASE_URL=http://host.docker.internal:8000/v1 \
SGLANG_MODEL=my-served-model \
make opensearch-ai-init-sglang
```

Use the exact model ID returned by `GET /v1/models`, including any alias set by
SGLang's `--served-model-name`. If the server exposes multiple models, specify
`SGLANG_MODEL`. Export `SGLANG_API_KEY` when the server uses `--api-key`; it is
stored as an OpenSearch connector credential and sent as a Bearer token.

For a server on the Docker host, use `host.docker.internal`, since `localhost`
inside OpenSearch refers to its container. Docker Desktop and Colima provide
this hostname. On Linux Docker Engine, add
`"host.docker.internal:host-gateway"` to the OpenSearch containers' `extra_hosts`
(the `x-common-hosts` anchor in `deploy/services.yml`) and recreate them, or use the
host's reachable IP in `SGLANG_BASE_URL`. For a server on another machine, use
its reachable LAN hostname or IP instead.
Bind SGLang to an interface reachable from Docker, for example `--host 0.0.0.0`.

Setup checks `/v1/models` from inside OpenSearch before writing configuration.
It adds the exact inference URL to both ML Commons connector allowlists while
preserving existing entries. This uses OpenSearch 3.7+ private connector
settings already enabled in this repository; no OpenSearch restart is needed
for these allowlist updates.

All six connectors use SGLang: chat, PPL, time-range parsing, Dashboards utility
features, anomaly suggestions, and visualization summaries. Resource names
default to SGLang-specific names. Existing `OPENSEARCH_AI_*_NAME` settings in
`deploy/elasticsearch.env` override those defaults, so pinned Ollama names cause those
same connectors, models, and agents to be updated to use SGLang. Set distinct
resource names if you want both sets to coexist. Setup activates the selected
provider by updating the Dashboards ML configuration documents. Rerunning it
updates existing connectors and agents.

Choose a chat model and enable the appropriate SGLang tool-call parser for its
model family to use the conversational agent. Anomaly suggestions require
structured JSON output; visualization summaries require a vision model.
SGLang uses its server defaults for reasoning unless
`OPENSEARCH_AI_REASONING_EFFORT` is supplied. Configure model-specific thinking
controls on the server; thinking models may need higher
`OPENSEARCH_AI_MAX_TOKENS` and `OPENSEARCH_AI_UTILITY_MAX_TOKENS` than the current
256/1024 defaults.

To select SGLang for the generic command, set `OPENSEARCH_AI_PROVIDER=sglang`
in `deploy/sglang.env`, or run:

```bash
OPENSEARCH_AI_PROVIDER=sglang make opensearch-ai-init
```

Ollama remains the default. Switch the active Dashboards features back with:

```bash
OPENSEARCH_AI_PROVIDER=ollama make opensearch-ai-init
```

The generic command starts the Ollama compatibility proxy only when Ollama is
selected. The SGLang path calls its OpenAI-compatible API directly.

References: [SGLang OpenAI-compatible API](https://docs.sglang.io/docs/basic_usage/openai_api_completions),
[SGLang server arguments](https://docs.sglang.io/docs/advanced_features/server_arguments),
[OpenSearch remote connectors](https://docs.opensearch.org/latest/ml-commons-plugin/remote-models/index/),
[Docker host networking](https://docs.docker.com/compose/how-tos/networking/).
