#!/usr/bin/env python3

"""Narrow compatibility proxy for OpenSearch conversational agents and Ollama."""

from __future__ import annotations

import http.client
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any


LISTEN_HOST = os.environ.get("PROXY_LISTEN_HOST", "0.0.0.0")
LISTEN_PORT = int(os.environ.get("PROXY_LISTEN_PORT", "11435"))
UPSTREAM_HOST = os.environ.get("OLLAMA_UPSTREAM_HOST", "ollama")
UPSTREAM_PORT = int(os.environ.get("OLLAMA_UPSTREAM_PORT", "11434"))
UPSTREAM_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_UPSTREAM_TIMEOUT_SECONDS", "360"))
MAX_REQUEST_BYTES = int(os.environ.get("PROXY_MAX_REQUEST_BYTES", str(8 * 1024 * 1024)))


def normalize_tool_call_indices(payload: Any) -> int:
    """Convert integral float indexes in assistant tool calls to JSON integers."""

    if not isinstance(payload, dict):
        return 0

    changes = 0
    messages = payload.get("messages")
    if not isinstance(messages, list):
        return changes

    for message in messages:
        if not isinstance(message, dict):
            continue
        tool_calls = message.get("tool_calls")
        if not isinstance(tool_calls, list):
            continue
        for tool_call in tool_calls:
            if not isinstance(tool_call, dict):
                continue
            changes += _normalize_index(tool_call)
            function = tool_call.get("function")
            if isinstance(function, dict):
                changes += _normalize_index(function)
    return changes


def _normalize_index(value: dict[str, Any]) -> int:
    index = value.get("index")
    if isinstance(index, float) and index.is_integer():
        value["index"] = int(index)
        return 1
    return 0


class ProxyHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        if self.path != "/healthz":
            self._send_json(404, {"error": "not found"})
            return

        try:
            connection = http.client.HTTPConnection(
                UPSTREAM_HOST, UPSTREAM_PORT, timeout=5
            )
            connection.request("GET", "/api/version")
            response = connection.getresponse()
            response.read()
            status = 200 if response.status == 200 else 503
        except OSError:
            status = 503
        finally:
            if "connection" in locals():
                connection.close()

        self._send_json(status, {"status": "ok" if status == 200 else "unavailable"})

    def do_POST(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        if self.path != "/v1/chat/completions":
            self._send_json(404, {"error": "only /v1/chat/completions is allowed"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "invalid content length"})
            return

        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self._send_json(413, {"error": "request body is empty or too large"})
            return

        try:
            payload = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "request body must be valid JSON"})
            return

        changes = normalize_tool_call_indices(payload)
        request_body = json.dumps(payload, separators=(",", ":")).encode()

        try:
            connection = http.client.HTTPConnection(
                UPSTREAM_HOST,
                UPSTREAM_PORT,
                timeout=UPSTREAM_TIMEOUT_SECONDS,
            )
            connection.request(
                "POST",
                "/v1/chat/completions",
                body=request_body,
                headers={
                    "Accept": self.headers.get("Accept", "application/json"),
                    "Content-Type": "application/json",
                    "X-OpenSearch-Tool-Indexes-Normalized": str(changes),
                },
            )
            response = connection.getresponse()
            response_body = response.read()
            response_headers = response.getheaders()
        except (OSError, TimeoutError) as error:
            self._send_json(502, {"error": f"Ollama upstream request failed: {error}"})
            return
        finally:
            if "connection" in locals():
                connection.close()

        self.send_response(response.status)
        for name, value in response_headers:
            if name.lower() not in {
                "connection",
                "content-length",
                "keep-alive",
                "transfer-encoding",
            }:
                self.send_header(name, value)
        self.send_header("Content-Length", str(len(response_body)))
        self.end_headers()
        self.wfile.write(response_body)

    def log_message(self, message_format: str, *args: object) -> None:
        print(f"[ollama-openai-proxy] {self.address_string()} {message_format % args}")

    def _send_json(self, status: int, payload: dict[str, str]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer((LISTEN_HOST, LISTEN_PORT), ProxyHandler)
    print(
        f"[ollama-openai-proxy] listening on {LISTEN_HOST}:{LISTEN_PORT}; "
        f"upstream={UPSTREAM_HOST}:{UPSTREAM_PORT}"
    )
    server.serve_forever()
