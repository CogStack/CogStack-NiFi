#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log() {
  printf '[opensearch-ai-init] %s\n' "$*" >&2
}

die() {
  printf '[opensearch-ai-init] ERROR: %s\n' "$*" >&2
  exit 1
}

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

# Make exports these variables already. Loading the files here also makes the
# script convenient to run directly from the repository root. Preserve values
# supplied by the caller so one-off command-line overrides take precedence.
ENV_OVERRIDE_NAMES=(
  ELASTIC_USER
  ELASTIC_PASSWORD
  OLLAMA_CONTAINER_NAME
  OLLAMA_MODEL
  OLLAMA_OPENAI_PROXY_CONTAINER_NAME
  OPENSEARCH_AI_CHAT_ENDPOINT
  OPENSEARCH_AI_OPENSEARCH_CONTAINER
  OPENSEARCH_AI_OPENSEARCH_USER
  OPENSEARCH_AI_OPENSEARCH_PASSWORD
  OPENSEARCH_AI_CONNECTION_TIMEOUT_SECONDS
  OPENSEARCH_AI_READ_TIMEOUT_SECONDS
  OPENSEARCH_AI_DEPLOY_TIMEOUT_SECONDS
  OPENSEARCH_AI_MAX_TOKENS
  OPENSEARCH_AI_UTILITY_MAX_TOKENS
  OPENSEARCH_AI_REASONING_EFFORT
  OPENSEARCH_AI_CHAT_MAX_ITERATIONS
  OPENSEARCH_AI_PPL_RESULT_LIMIT
  OPENSEARCH_AI_CHAT_CONNECTOR_NAME
  OPENSEARCH_AI_CHAT_MODEL_NAME
  OPENSEARCH_AI_CHAT_AGENT_NAME
  OPENSEARCH_AI_ROOT_AGENT_NAME
  OPENSEARCH_AI_PPL_CONNECTOR_NAME
  OPENSEARCH_AI_PPL_MODEL_NAME
  OPENSEARCH_AI_PPL_AGENT_NAME
  OPENSEARCH_AI_TIME_RANGE_CONNECTOR_NAME
  OPENSEARCH_AI_TIME_RANGE_MODEL_NAME
  OPENSEARCH_AI_TIME_RANGE_AGENT_NAME
  OPENSEARCH_AI_UTILITY_CONNECTOR_NAME
  OPENSEARCH_AI_UTILITY_MODEL_NAME
  OPENSEARCH_AI_AD_CONNECTOR_NAME
  OPENSEARCH_AI_AD_MODEL_NAME
  OPENSEARCH_AI_VISUAL_CONNECTOR_NAME
  OPENSEARCH_AI_VISUAL_MODEL_NAME
)
ENV_OVERRIDES=()
for variable_name in "${ENV_OVERRIDE_NAMES[@]}"; do
  if [[ -n "${!variable_name+x}" ]]; then
    ENV_OVERRIDES+=("$variable_name=${!variable_name}")
  fi
done
load_env_file "$PROJECT_DIR/security/env/users_elasticsearch.env"
load_env_file "$PROJECT_DIR/deploy/elasticsearch.env"
load_env_file "$PROJECT_DIR/deploy/ollama.env"
for variable_assignment in "${ENV_OVERRIDES[@]}"; do
  variable_name="${variable_assignment%%=*}"
  printf -v "$variable_name" '%s' "${variable_assignment#*=}"
  export "${variable_name?}"
done

OPENSEARCH_CONTAINER="${OPENSEARCH_AI_OPENSEARCH_CONTAINER:-elasticsearch-1}"
OPENSEARCH_USER="${OPENSEARCH_AI_OPENSEARCH_USER:-${ELASTIC_USER:-admin}}"
OPENSEARCH_PASSWORD="${OPENSEARCH_AI_OPENSEARCH_PASSWORD:-${ELASTIC_PASSWORD:-}}"
OLLAMA_CONTAINER="${OLLAMA_CONTAINER_NAME:-cogstack-ollama}"
OLLAMA_OPENAI_PROXY_CONTAINER="${OLLAMA_OPENAI_PROXY_CONTAINER_NAME:-cogstack-ollama-openai-proxy}"
OLLAMA_MODEL_NAME="${OLLAMA_MODEL:-qwen3.5:9b-q4_K_M}"
CHAT_ENDPOINT="${OPENSEARCH_AI_CHAT_ENDPOINT:-ollama-openai-proxy:11435}"

CONNECTION_TIMEOUT="${OPENSEARCH_AI_CONNECTION_TIMEOUT_SECONDS:-120}"
READ_TIMEOUT="${OPENSEARCH_AI_READ_TIMEOUT_SECONDS:-360}"
DEPLOY_TIMEOUT="${OPENSEARCH_AI_DEPLOY_TIMEOUT_SECONDS:-300}"
MAX_TOKENS="${OPENSEARCH_AI_MAX_TOKENS:-256}"
UTILITY_MAX_TOKENS="${OPENSEARCH_AI_UTILITY_MAX_TOKENS:-1024}"
REASONING_EFFORT="${OPENSEARCH_AI_REASONING_EFFORT:-none}"
CHAT_MAX_ITERATIONS="${OPENSEARCH_AI_CHAT_MAX_ITERATIONS:-8}"
PPL_RESULT_LIMIT="${OPENSEARCH_AI_PPL_RESULT_LIMIT:-100}"

CHAT_CONNECTOR_NAME="${OPENSEARCH_AI_CHAT_CONNECTOR_NAME:-Ollama Qwen Agent Connector}"
CHAT_MODEL_NAME="${OPENSEARCH_AI_CHAT_MODEL_NAME:-Qwen 3.5 Ollama Agent Model}"
CHAT_AGENT_NAME="${OPENSEARCH_AI_CHAT_AGENT_NAME:-Qwen 3.5 Conversational Agent v2}"
ROOT_AGENT_NAME="${OPENSEARCH_AI_ROOT_AGENT_NAME:-Qwen Dashboards Root Agent}"
PPL_CONNECTOR_NAME="${OPENSEARCH_AI_PPL_CONNECTOR_NAME:-Ollama Qwen PPL Connector}"
PPL_MODEL_NAME="${OPENSEARCH_AI_PPL_MODEL_NAME:-Qwen 3.5 Ollama PPL Model}"
PPL_AGENT_NAME="${OPENSEARCH_AI_PPL_AGENT_NAME:-Qwen PPL Query Assist Agent}"
TIME_RANGE_CONNECTOR_NAME="${OPENSEARCH_AI_TIME_RANGE_CONNECTOR_NAME:-Ollama Qwen Time Range Connector}"
TIME_RANGE_MODEL_NAME="${OPENSEARCH_AI_TIME_RANGE_MODEL_NAME:-Qwen 3.5 Ollama Time Range Model}"
TIME_RANGE_AGENT_NAME="${OPENSEARCH_AI_TIME_RANGE_AGENT_NAME:-Qwen Query Time Range Parser Agent}"
UTILITY_CONNECTOR_NAME="${OPENSEARCH_AI_UTILITY_CONNECTOR_NAME:-Ollama Qwen Dashboards Utility Connector}"
UTILITY_MODEL_NAME="${OPENSEARCH_AI_UTILITY_MODEL_NAME:-Qwen 3.5 Dashboards Utility Model}"
AD_CONNECTOR_NAME="${OPENSEARCH_AI_AD_CONNECTOR_NAME:-Ollama Qwen Anomaly Suggestion Connector}"
AD_MODEL_NAME="${OPENSEARCH_AI_AD_MODEL_NAME:-Qwen 3.5 Anomaly Suggestion Model}"
VISUAL_CONNECTOR_NAME="${OPENSEARCH_AI_VISUAL_CONNECTOR_NAME:-Ollama Qwen Visualization Connector}"
VISUAL_MODEL_NAME="${OPENSEARCH_AI_VISUAL_MODEL_NAME:-Qwen 3.5 Visualization Model}"

OPENSEARCH_URL="https://localhost:9200"
OPENSEARCH_CA="/usr/share/opensearch/config/root-ca.crt"

[[ -n "$OPENSEARCH_PASSWORD" ]] \
  || die "set OPENSEARCH_AI_OPENSEARCH_PASSWORD or ELASTIC_PASSWORD"

for command_name in docker jq; do
  command -v "$command_name" >/dev/null 2>&1 || die "$command_name is required"
done

for integer_value in "$CONNECTION_TIMEOUT" "$READ_TIMEOUT" "$DEPLOY_TIMEOUT" "$MAX_TOKENS" "$UTILITY_MAX_TOKENS" "$CHAT_MAX_ITERATIONS" "$PPL_RESULT_LIMIT"; do
  [[ "$integer_value" =~ ^[1-9][0-9]*$ ]] || die "timeout and token settings must be positive integers"
done

[[ "$(docker inspect --format '{{.State.Running}}' "$OPENSEARCH_CONTAINER" 2>/dev/null)" == "true" ]] \
  || die "OpenSearch container '$OPENSEARCH_CONTAINER' is not running"
[[ "$(docker inspect --format '{{.State.Running}}' "$OLLAMA_CONTAINER" 2>/dev/null)" == "true" ]] \
  || die "Ollama container '$OLLAMA_CONTAINER' is not running"
[[ "$(docker inspect --format '{{.State.Running}}' "$OLLAMA_OPENAI_PROXY_CONTAINER" 2>/dev/null)" == "true" ]] \
  || die "Ollama OpenAI compatibility proxy '$OLLAMA_OPENAI_PROXY_CONTAINER' is not running"

os_request() {
  local method="$1"
  local path="$2"
  local payload="${3-}"
  local response body status
  local curl_args=(
    --silent
    --show-error
    --cacert "$OPENSEARCH_CA"
    --user "$OPENSEARCH_USER:$OPENSEARCH_PASSWORD"
    --request "$method"
    --header 'Content-Type: application/json'
    --write-out $'\n%{http_code}'
  )

  if [[ -n "$payload" ]]; then
    response="$(printf '%s' "$payload" | docker exec -i "$OPENSEARCH_CONTAINER" \
      curl "${curl_args[@]}" --data-binary @- "$OPENSEARCH_URL$path")" || return
  else
    response="$(docker exec "$OPENSEARCH_CONTAINER" \
      curl "${curl_args[@]}" "$OPENSEARCH_URL$path")" || return
  fi

  status="${response##*$'\n'}"
  body="${response%$'\n'*}"
  if [[ ! "$status" =~ ^2[0-9][0-9]$ ]]; then
    log "$method $path failed with HTTP $status"
    [[ -n "$body" ]] && printf '%s\n' "$body" >&2
    return 1
  fi
  printf '%s' "$body"
}

wait_for_opensearch() {
  local deadline=$((SECONDS + DEPLOY_TIMEOUT))
  local response
  log "Waiting for OpenSearch to reach yellow health"
  while (( SECONDS < deadline )); do
    if response="$(os_request GET '/_cluster/health?wait_for_status=yellow&timeout=5s' 2>/dev/null)" \
      && [[ "$(jq -r '.status // empty' <<<"$response")" =~ ^(yellow|green)$ ]]; then
      return 0
    fi
    sleep 5
  done
  die "OpenSearch did not reach yellow health within ${DEPLOY_TIMEOUT}s"
}

wait_for_ollama() {
  local deadline=$((SECONDS + DEPLOY_TIMEOUT))
  log "Waiting for Ollama and ensuring model '$OLLAMA_MODEL_NAME' is available"
  while (( SECONDS < deadline )); do
    if docker exec "$OLLAMA_CONTAINER" ollama list >/dev/null 2>&1; then
      if ! docker exec "$OLLAMA_CONTAINER" ollama show "$OLLAMA_MODEL_NAME" >/dev/null 2>&1; then
        docker exec "$OLLAMA_CONTAINER" ollama pull "$OLLAMA_MODEL_NAME"
      fi
      return 0
    fi
    sleep 5
  done
  die "Ollama did not become ready within ${DEPLOY_TIMEOUT}s"
}

search_resource_id() {
  local resource="$1"
  local name="$2"
  local response
  response="$(os_request POST "/_plugins/_ml/${resource}/_search" '{"query":{"match_all":{}},"size":1000}')"
  jq -r --arg name "$name" '.hits.hits[]? | select(._source.name == $name) | ._id' \
    <<<"$response" | head -n 1
}

models_for_connector() {
  local connector_id="$1"
  local response
  response="$(os_request POST '/_plugins/_ml/models/_search' '{"query":{"match_all":{}},"size":1000}')"
  jq -r --arg connector_id "$connector_id" \
    '.hits.hits[]? | select(._source.connector_id == $connector_id) | [._id, (._source.model_state // "")] | @tsv' \
    <<<"$response"
}

wait_for_model_state() {
  local model_id="$1"
  local deadline=$((SECONDS + DEPLOY_TIMEOUT))
  local response state
  while (( SECONDS < deadline )); do
    response="$(os_request GET "/_plugins/_ml/models/$model_id")"
    state="$(jq -r '.model_state // empty' <<<"$response")"
    case "$state" in
      DEPLOYED)
        return 0
        ;;
      DEPLOY_FAILED)
        die "model '$model_id' failed to deploy"
        ;;
    esac
    sleep 3
  done
  die "model '$model_id' did not deploy within ${DEPLOY_TIMEOUT}s"
}

wait_for_model_undeployed() {
  local model_id="$1"
  local deadline=$((SECONDS + DEPLOY_TIMEOUT))
  local response state
  while (( SECONDS < deadline )); do
    response="$(os_request GET "/_plugins/_ml/models/$model_id")"
    state="$(jq -r '.model_state // empty' <<<"$response")"
    if [[ "$state" != "DEPLOYED" && "$state" != "DEPLOYING" ]]; then
      return 0
    fi
    sleep 2
  done
  die "model '$model_id' did not undeploy within ${DEPLOY_TIMEOUT}s"
}

deploy_model() {
  local model_id="$1"
  local state
  state="$(os_request GET "/_plugins/_ml/models/$model_id" | jq -r '.model_state // empty')"
  if [[ "$state" != "DEPLOYED" ]]; then
    log "Deploying model $model_id"
    os_request POST "/_plugins/_ml/models/$model_id/_deploy" '{}' >/dev/null
  fi
  wait_for_model_state "$model_id"
}

undeploy_connector_models() {
  local connector_id="$1"
  local model_id state
  while IFS=$'\t' read -r model_id state; do
    [[ -n "$model_id" ]] || continue
    if [[ "$state" == "DEPLOYED" || "$state" == "DEPLOYING" ]]; then
      log "Undeploying model $model_id before updating connector $connector_id"
      os_request POST "/_plugins/_ml/models/$model_id/_undeploy" '{}' >/dev/null
      wait_for_model_undeployed "$model_id"
    fi
  done < <(models_for_connector "$connector_id")
}

redeploy_connector_models() {
  local connector_id="$1"
  local model_id state
  while IFS=$'\t' read -r model_id state; do
    [[ -n "$model_id" ]] || continue
    deploy_model "$model_id"
  done < <(models_for_connector "$connector_id")
}

upsert_connector() {
  local name="$1"
  local payload="$2"
  local connector_id
  connector_id="$(search_resource_id connectors "$name")"
  if [[ -n "$connector_id" ]]; then
    undeploy_connector_models "$connector_id"
    log "Updating connector '$name' ($connector_id)"
    os_request PUT "/_plugins/_ml/connectors/$connector_id" "$payload" >/dev/null
    redeploy_connector_models "$connector_id"
  else
    log "Creating connector '$name'"
    connector_id="$(os_request POST '/_plugins/_ml/connectors/_create' "$payload" | jq -r '.connector_id // empty')"
    [[ -n "$connector_id" ]] || die "connector '$name' was created without a connector_id"
  fi
  printf '%s\n' "$connector_id"
}

register_model() {
  local name="$1"
  local connector_id="$2"
  local payload response model_id task_id task_response task_state
  payload="$(jq -nc \
    --arg name "$name" \
    --arg connector_id "$connector_id" \
    '{name:$name, description:("Ollama remote model for " + $name), function_name:"remote", connector_id:$connector_id}')"
  response="$(os_request POST '/_plugins/_ml/models/_register' "$payload")"
  model_id="$(jq -r '.model_id // empty' <<<"$response")"
  task_id="$(jq -r '.task_id // empty' <<<"$response")"

  if [[ -z "$model_id" && -n "$task_id" ]]; then
    local deadline=$((SECONDS + DEPLOY_TIMEOUT))
    while (( SECONDS < deadline )); do
      task_response="$(os_request GET "/_plugins/_ml/tasks/$task_id")"
      task_state="$(jq -r '.state // empty' <<<"$task_response")"
      model_id="$(jq -r '.model_id // empty' <<<"$task_response")"
      [[ "$task_state" == "FAILED" ]] && die "model registration task '$task_id' failed"
      [[ "$task_state" == "COMPLETED" && -n "$model_id" ]] && break
      sleep 2
    done
  fi

  [[ -n "$model_id" ]] || die "model '$name' was registered without a model_id"
  printf '%s\n' "$model_id"
}

ensure_model() {
  local name="$1"
  local connector_id="$2"
  local model_id current_connector_id
  model_id="$(search_resource_id models "$name")"
  if [[ -n "$model_id" ]]; then
    current_connector_id="$(os_request GET "/_plugins/_ml/models/$model_id" | jq -r '.connector_id // empty')"
    if [[ "$current_connector_id" != "$connector_id" ]]; then
      die "model '$name' already exists with connector '$current_connector_id', expected '$connector_id'"
    fi
    log "Reusing model '$name' ($model_id)"
  else
    log "Registering model '$name'"
    model_id="$(register_model "$name" "$connector_id")"
  fi
  deploy_model "$model_id"
  printf '%s\n' "$model_id"
}

upsert_agent() {
  local name="$1"
  local payload="$2"
  local agent_id
  agent_id="$(search_resource_id agents "$name")"
  if [[ -n "$agent_id" ]]; then
    log "Updating agent '$name' ($agent_id)"
    # Agent type and top-level interface parameters are creation-time fields.
    # Existing agents retain them while supported mutable fields are refreshed.
    os_request PUT "/_plugins/_ml/agents/$agent_id" \
      "$(jq -c 'del(.type, .parameters)' <<<"$payload")" >/dev/null
  else
    log "Registering agent '$name'"
    agent_id="$(os_request POST '/_plugins/_ml/agents/_register' "$payload" | jq -r '.agent_id // empty')"
    [[ -n "$agent_id" ]] || die "agent '$name' was registered without an agent_id"
  fi
  printf '%s\n' "$agent_id"
}

write_ml_config() {
  local config_id="$1"
  local config_type="$2"
  local agent_id="$3"
  local payload
  payload="$(jq -nc --arg type "$config_type" --arg agent_id "$agent_id" \
    '{type:$type, configuration:{agent_id:$agent_id}}')"
  log "Writing ML config '$config_id' -> $agent_id"
  os_request PUT "/.plugins-ml-config/_doc/$config_id?refresh=true" "$payload" >/dev/null
}

ensure_utility_agent() {
  local name="$1"
  local description="$2"
  local app_type="$3"
  local prompt="$4"
  local payload
  payload="$(jq -nc \
    --arg name "$name" \
    --arg description "$description" \
    --arg app_type "$app_type" \
    --arg model_id "$UTILITY_MODEL_ID" \
    --arg prompt "$prompt" \
    '{name:$name, description:$description, type:"flow", app_type:$app_type, tools:[{type:"MLModelTool", name:"LLMResponseGenerator", include_output_in_agent_response:true, parameters:{model_id:$model_id, model_type:"OPENAI", prompt:$prompt, response_filter:"$.choices[0].message.content"}}]}')"
  upsert_agent "$name" "$payload"
}

wait_for_opensearch
wait_for_ollama

# The single quotes deliberately preserve ML Commons ${parameters.*}
# placeholders until connector inference time.
# shellcheck disable=SC2016
printf -v CHAT_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"${parameters.system_prompt}"},{"role":"user","content":"Join orders with customers on customer_id and return order_id and customer name, limited to 10 rows."},{"role":"assistant","content":"","tool_calls":[{"id":"join_example","index":0,"type":"function","function":{"name":"TransferQuestionToPPLAndExecuteTool","arguments":"{\\\"index\\\":\\\"orders\\\",\\\"question\\\":\\\"Join orders with customers on customer_id. Return order_id and customer name. Limit to 10 rows.\\\"}"}}]},{"role":"tool","tool_call_id":"join_example","name":"TransferQuestionToPPLAndExecuteTool","content":"PPL: source = orders | inner join left=l right=r on l.customer_id = r.customer_id customers | fields l.order_id, r.name | head 10. Result: order_id 1, name Alice. Total rows: 1."},{"role":"assistant","content":"The join returned one row: order 1 belongs to Alice."},${parameters._chat_history:-}{"role":"user","content":"${parameters.prompt}"}${parameters._interactions:-}], "stream": false, "temperature": 0, "max_tokens": %d, "reasoning_effort": "%s"${parameters.tool_configs:-} }' \
  "$MAX_TOKENS" "$REASONING_EFFORT"

# shellcheck disable=SC2016
printf -v PPL_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"Translate the request into exactly one valid, read-only OpenSearch PPL query and return only the query, with no Markdown or explanation. Never use SQL syntax such as SELECT, FROM, JOIN ... ON, LIMIT, or column AS aliases. For every two-index join, aliases MUST be exactly l for the left index and r for the right index. The condition MUST compare l.join_field = r.join_field; never compare the same alias on both sides. Prefix every projected left field with l and every projected right field with r. Preserve every requested output field in the fields command, including a join field when the user requests it as output. Put the right index immediately after the join condition. Use fields, never select, to project columns. Use head, never limit, to cap results. Filter each side before joining when filters are requested. Finish with head 100 unless the request asks for a smaller limit. Never target system indices whose names start with a dot."},{"role":"user","content":"Join orders with customers on customer_id and return customer_id, order_id, and customer name, limited to 10 rows."},{"role":"assistant","content":"source = orders | inner join left=l right=r on l.customer_id = r.customer_id customers | fields l.customer_id, l.order_id, r.name | head 10"},{"role":"user","content":"${parameters.prompt}"}], "stream": false, "temperature": 0, "max_tokens": %d, "reasoning_effort": "%s" }' \
  "$MAX_TOKENS" "$REASONING_EFFORT"

# shellcheck disable=SC2016
printf -v TIME_RANGE_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"Parse time constraints for an OpenSearch date picker. Follow the requested XML output format exactly and return no explanation."},{"role":"user","content":"${parameters.prompt}"}], "stream": false, "max_tokens": %d, "reasoning_effort": "%s" }' \
  "$MAX_TOKENS" "$REASONING_EFFORT"

# General-purpose strict-output connector used by the feature-specific agents
# below. Their MLModelTool prompts define the exact response contract expected
# by each OpenSearch Dashboards route.
# shellcheck disable=SC2016
printf -v UTILITY_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"Follow the requested output format exactly. Do not add Markdown fences or commentary outside that format."},{"role":"user","content":"${parameters.prompt}"}], "stream": false, "max_tokens": %d, "reasoning_effort": "%s" }' \
  "$UTILITY_MAX_TOKENS" "$REASONING_EFFORT"

# The anomaly detector UI calls String.split on every multi-value property.
# Enforce strings at the Ollama decoder so the UI never receives JSON arrays.
# shellcheck disable=SC2016
printf -v AD_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"Suggest anomaly detector parameters from the supplied index mapping. Follow the JSON schema exactly."},{"role":"user","content":"${parameters.prompt}"}], "stream": false, "max_tokens": %d, "reasoning_effort": "%s", "response_format":{"type":"json_schema","json_schema":{"name":"anomaly_detector_parameters","strict":true,"schema":{"type":"object","properties":{"categoryField":{"type":"string"},"aggregationField":{"type":"string"},"aggregationMethod":{"type":"string"},"dateFields":{"type":"string"}},"required":["categoryField","aggregationField","aggregationMethod","dateFields"],"additionalProperties":false}}} }' \
  "$UTILITY_MAX_TOKENS" "$REASONING_EFFORT"

# Qwen 3.5 is multimodal. Send notebook visualization screenshots through the
# OpenAI-compatible image_url message format and make the model emit the nested
# JSON shape expected by the Dashboards investigation plugin.
# shellcheck disable=SC2016
printf -v VISUAL_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"Summarize the supplied OpenSearch visualization. Return only JSON shaped as {\\"output\\":{\\"message\\":{\\"content\\":[{\\"text\\":\\"concise summary\\"}]}}}."},{"role":"user","content":[{"type":"text","text":"Explain the notable trends, outliers, and operational meaning. Local timezone offset in minutes: ${parameters.local_time_offset}"},{"type":"image_url","image_url":{"url":"data:image/jpeg;base64,${parameters.image_base64}"}}]}], "stream": false, "max_tokens": %d, "reasoning_effort": "%s" }' \
  "$UTILITY_MAX_TOKENS" "$REASONING_EFFORT"

CLIENT_CONFIG="$(jq -nc \
  --argjson connection_timeout "$CONNECTION_TIMEOUT" \
  --argjson read_timeout "$READ_TIMEOUT" \
  '{max_connection:10, connection_timeout:$connection_timeout, read_timeout:$read_timeout, max_retry_times:0}')"

CHAT_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$CHAT_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg endpoint "$CHAT_ENDPOINT" \
  --arg request_body "$CHAT_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"OpenAI-compatible Ollama connector for OpenSearch conversational agents", version:"1", protocol:"http", parameters:{endpoint:$endpoint, model:$model}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

PPL_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$PPL_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$PPL_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"Prompt-compatible Ollama connector for OpenSearch PPL query assist", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model, response_filter:"$.choices[0].message.content"}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

TIME_RANGE_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$TIME_RANGE_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$TIME_RANGE_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"Ollama connector for OpenSearch query time-range parsing", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model, response_filter:"$.choices[0].message.content"}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

UTILITY_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$UTILITY_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$UTILITY_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"Ollama connector for OpenSearch Dashboards feature agents", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model, response_filter:"$.choices[0].message.content"}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

AD_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$AD_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$AD_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"Structured-output Ollama connector for anomaly detector suggestions", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model, response_filter:"$.choices[0].message.content"}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

VISUAL_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$VISUAL_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$VISUAL_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"OpenAI-compatible Ollama connector for visualization screenshots", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model, response_filter:"$.choices[0].message.content"}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

CHAT_CONNECTOR_ID="$(upsert_connector "$CHAT_CONNECTOR_NAME" "$CHAT_CONNECTOR_PAYLOAD")"
CHAT_MODEL_ID="$(ensure_model "$CHAT_MODEL_NAME" "$CHAT_CONNECTOR_ID")"

PPL_CONNECTOR_ID="$(upsert_connector "$PPL_CONNECTOR_NAME" "$PPL_CONNECTOR_PAYLOAD")"
PPL_MODEL_ID="$(ensure_model "$PPL_MODEL_NAME" "$PPL_CONNECTOR_ID")"

CHAT_SYSTEM_PROMPT='You are a read-only OpenSearch assistant. Use the available tools to discover permitted indices, inspect mappings, search documents, and run PPL analytics. Use the PPL tool for every join between indices. If the user already supplied both index names and the join field, call the PPL tool immediately and exactly once; do not list indices or inspect mappings first. Pass the PPL tool a concise, self-contained natural-language request containing the index names, join type and field, requested output fields, filters, and result limit. Do not add SQL or a proposed query to that request. Inspect mappings only when an index, join field, or field type is missing or an execution error indicates a mapping problem. After a tool returns rows, stop calling tools and answer from those rows. Never repeat a successful tool call. If PPL execution fails with a syntax error, retry it at most once and include the error plus this canonical grammar in the natural-language request: source = left_index | inner join left=l right=r on l.key = r.key right_index | fields l.field, r.field | head 5. For ListIndexTool, pass indices as a comma-delimited string and use * to list all permitted indices. Never target system indices, perform writes, change mappings or settings, or claim an operation succeeded unless a tool result confirms it.'

CHAT_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$CHAT_AGENT_NAME" \
  --arg model_id "$CHAT_MODEL_ID" \
  --arg ppl_model_id "$PPL_MODEL_ID" \
  --arg max_iteration "$CHAT_MAX_ITERATIONS" \
  --arg system_prompt "$CHAT_SYSTEM_PROMPT" \
  --argjson ppl_result_limit "$PPL_RESULT_LIMIT" \
  '{name:$name, description:"Read-only OpenSearch assistant with index discovery, search, and PPL join support", type:"conversational", app_type:"os_chat", memory:{type:"conversation_index"}, llm:{model_id:$model_id, parameters:{max_iteration:$max_iteration, response_filter:"$.response", system_prompt:$system_prompt, prompt:"${parameters.question}", message_history_limit:"5"}}, parameters:{_llm_interface:"openai/v1/chat/completions"}, tools:[{type:"ListIndexTool", name:"ListIndexTool", description:"List visible OpenSearch indices. Always pass indices as a comma-delimited string; use * to list all permitted indices."},{type:"IndexMappingTool", name:"IndexMappingTool", description:"Inspect mappings and settings only when field information needed for a search or join is missing."},{type:"SearchIndexTool", name:"SearchIndexTool", description:"Run a read-only OpenSearch Query DSL search against an allowed index."},{type:"PPLTool", name:"TransferQuestionToPPLAndExecuteTool", description:"Generate and execute one read-only PPL analytics or join query. When index names and a join field are known, call this tool directly with only a self-contained natural-language request; never include SQL or a proposed query.", parameters:{model_id:$ppl_model_id, model_type:"OPENAI", response_filter:"$.choices[0].message.content", execute:true, head:$ppl_result_limit}, attributes:{input_schema:{type:"object", properties:{index:{type:"string", description:"Primary OpenSearch index for the PPL query. Put additional join index names in question."}, question:{type:"string", description:"Natural language only: include index names, join type and field, desired fields, filters, and result limit. Do not include SQL or a proposed PPL query."}}, required:["index","question"], additionalProperties:false}}}]}')"
CHAT_AGENT_ID="$(upsert_agent "$CHAT_AGENT_NAME" "$CHAT_AGENT_PAYLOAD")"

ROOT_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$ROOT_AGENT_NAME" \
  --arg agent_id "$CHAT_AGENT_ID" \
  '{name:$name, description:"Root agent for OpenSearch Assistant", type:"flow", app_type:"os_chat", tools:[{type:"AgentTool", name:"LLMResponseGenerator", include_output_in_agent_response:true, parameters:{agent_id:$agent_id}}]}')"
ROOT_AGENT_ID="$(upsert_agent "$ROOT_AGENT_NAME" "$ROOT_AGENT_PAYLOAD")"

PPL_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$PPL_AGENT_NAME" \
  --arg model_id "$PPL_MODEL_ID" \
  '{name:$name, description:"Generate PPL queries from natural-language questions", type:"flow", app_type:"query_assist", tools:[{type:"PPLTool", name:"TransferQuestionToPPLAndExecuteTool", description:"Translate a natural-language question into an OpenSearch PPL query for the supplied index. Inputs: {index:IndexName, question:UserQuestion}.", include_output_in_agent_response:true, parameters:{model_id:$model_id, model_type:"OPENAI", response_filter:"$.choices[0].message.content", execute:false}}]}')"
PPL_AGENT_ID="$(upsert_agent "$PPL_AGENT_NAME" "$PPL_AGENT_PAYLOAD")"

TIME_RANGE_CONNECTOR_ID="$(upsert_connector "$TIME_RANGE_CONNECTOR_NAME" "$TIME_RANGE_CONNECTOR_PAYLOAD")"
TIME_RANGE_MODEL_ID="$(ensure_model "$TIME_RANGE_MODEL_NAME" "$TIME_RANGE_CONNECTOR_ID")"

# OpenSearch Dashboards accepts these timestamp formats without a timezone
# suffix and leaves the existing date picker unchanged if no tags are returned.
# shellcheck disable=SC2016
TIME_RANGE_TOOL_PROMPT='Analyze whether the question contains a time constraint that applies to the selected time field.
Current time (ISO 8601): ${parameters.current_time_iso}
Selected time field: ${parameters.time_field}
Other time fields in the index: ${parameters.other_time_fields}
Question: ${parameters.question}

Resolve relative expressions such as "last 24 hours" using the current time. If a time constraint applies to the selected time field, return exactly:
<start>YYYY-MM-DD HH:mm:ss</start>
<end>YYYY-MM-DD HH:mm:ss</end>
The start must not be after the end. Do not include a timezone suffix, Markdown, or explanation. If the question has no applicable time constraint, or explicitly applies it to one of the other time fields, return an empty response.'

TIME_RANGE_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$TIME_RANGE_AGENT_NAME" \
  --arg model_id "$TIME_RANGE_MODEL_ID" \
  --arg prompt "$TIME_RANGE_TOOL_PROMPT" \
  '{name:$name, description:"Parse natural-language time constraints for the Discover date picker", type:"flow", app_type:"query_assist", tools:[{type:"MLModelTool", name:"QueryTimeRangeParserTool", description:"Extract an absolute start and end time for the selected OpenSearch time field.", include_output_in_agent_response:true, parameters:{model_id:$model_id, model_type:"OPENAI", prompt:$prompt, response_filter:"$.choices[0].message.content"}}]}')"
TIME_RANGE_AGENT_ID="$(upsert_agent "$TIME_RANGE_AGENT_NAME" "$TIME_RANGE_AGENT_PAYLOAD")"

UTILITY_CONNECTOR_ID="$(upsert_connector "$UTILITY_CONNECTOR_NAME" "$UTILITY_CONNECTOR_PAYLOAD")"
UTILITY_MODEL_ID="$(ensure_model "$UTILITY_MODEL_NAME" "$UTILITY_CONNECTOR_ID")"

# Keep the placeholders literal so ML Commons substitutes request parameters
# when each agent executes.
# shellcheck disable=SC2016
DATA2SUMMARY_PROMPT='Summarize these OpenSearch results for the user.
Question: ${parameters.question}
PPL query: ${parameters.ppl}
Sample count: ${parameters.sample_count}
Total count: ${parameters.total_count}
Sample data: ${parameters.sample_data}
Highlight the most useful findings and uncertainty. Return plain text.'

# shellcheck disable=SC2016
LOG_DATA2SUMMARY_PROMPT='Summarize these OpenSearch log results.
Question: ${parameters.question}
PPL query: ${parameters.ppl}
Sample count: ${parameters.sample_count}
Total count: ${parameters.total_count}
Sample data: ${parameters.sample_data}
Emphasize recurring log patterns, error signals, unusual values, and likely operational impact. Return plain text.'

# shellcheck disable=SC2016
INDEX_TYPE_PROMPT='Decide whether the index contains logs, events, traces, audit records, or other timestamped operational records.
Mapping: ${parameters.schema}
Sample documents: ${parameters.sampleData}
Return only valid JSON in this exact shape: {"isRelated":true,"reason":"short reason"}. Use false when the data is primarily business entities or reference data.'

# shellcheck disable=SC2016
QUERY_RESPONSE_SUMMARY_PROMPT='Explain the result of an OpenSearch PPL query.
Index: ${parameters.index}
Question: ${parameters.question}
PPL: ${parameters.query}
Response: ${parameters.response}
Give a concise factual answer, mention important totals or trends, and do not invent missing values.'

# shellcheck disable=SC2016
QUERY_ERROR_SUMMARY_PROMPT='Explain why this OpenSearch PPL query failed and suggest a corrected query.
Index: ${parameters.index}
Question: ${parameters.question}
PPL: ${parameters.query}
Error response: ${parameters.response}
Available fields: ${parameters.fields}
Return a concise explanation followed by one corrected PPL query.'

# shellcheck disable=SC2016
ALERT_SUMMARY_PROMPT='Summarize this OpenSearch alert context.
Question: ${parameters.question}
Index: ${parameters.index}
Query input: ${parameters.input}
Context: ${parameters.context}
Return the response as <summarization>concise evidence-based summary</summarization><final insights>recommended next checks</final insights>.'

# shellcheck disable=SC2016
LOG_ALERT_SUMMARY_PROMPT='Summarize this OpenSearch log alert context.
Question: ${parameters.question}
Index: ${parameters.index}
Query input: ${parameters.input}
Context: ${parameters.context}
Top log patterns: ${parameters.topNLogPatternData}
Return the response as <summarization>concise evidence-based summary</summarization><final insights>notable patterns and recommended next checks</final insights>.'

# shellcheck disable=SC2016
TEXT2VEGA_PROMPT='Create a Vega-Lite v5 specification for these OpenSearch query results.
Question: ${parameters.input_question}
PPL: ${parameters.ppl}
Data schema: ${parameters.dataSchema}
Sample data: ${parameters.sampleData}
Use field names that exist in the supplied data. Return only one valid JSON object. Do not include width, height, or inline data.'

# shellcheck disable=SC2016
TEXT2VEGA_INSTRUCTIONS_PROMPT='Modify or create a Vega-Lite v5 specification for these OpenSearch query results.
Question: ${parameters.input_question}
Requested visualization change: ${parameters.input_instruction}
PPL: ${parameters.ppl}
Data schema: ${parameters.dataSchema}
Sample data: ${parameters.sampleData}
Use field names that exist in the supplied data. Return only one valid JSON object. Do not include width, height, or inline data.'

DATA2SUMMARY_AGENT_ID="$(ensure_utility_agent "Qwen Data Summary Agent" "Summarize Discover result samples" "os_data2summary" "$DATA2SUMMARY_PROMPT")"
LOG_DATA2SUMMARY_AGENT_ID="$(ensure_utility_agent "Qwen Log Data Summary Agent" "Summarize Discover log result samples" "os_data2summary" "$LOG_DATA2SUMMARY_PROMPT")"
INDEX_TYPE_AGENT_ID="$(ensure_utility_agent "Qwen Index Type Detection Agent" "Classify whether an index contains operational log data" "os_index_type_detect" "$INDEX_TYPE_PROMPT")"
QUERY_RESPONSE_SUMMARY_AGENT_ID="$(ensure_utility_agent "Qwen Query Response Summary Agent" "Summarize successful PPL query results" "query_assist" "$QUERY_RESPONSE_SUMMARY_PROMPT")"
QUERY_ERROR_SUMMARY_AGENT_ID="$(ensure_utility_agent "Qwen Query Error Summary Agent" "Explain failed PPL queries" "query_assist" "$QUERY_ERROR_SUMMARY_PROMPT")"
ALERT_SUMMARY_AGENT_ID="$(ensure_utility_agent "Qwen Alert Summary Agent" "Summarize alert context" "os_summary" "$ALERT_SUMMARY_PROMPT")"
LOG_ALERT_SUMMARY_AGENT_ID="$(ensure_utility_agent "Qwen Log Alert Summary Agent" "Summarize log alert context" "os_summary" "$LOG_ALERT_SUMMARY_PROMPT")"
TEXT2VEGA_AGENT_ID="$(ensure_utility_agent "Qwen Text to Vega Agent" "Create Vega-Lite specifications from query results" "os_text2vega" "$TEXT2VEGA_PROMPT")"
TEXT2VEGA_INSTRUCTIONS_AGENT_ID="$(ensure_utility_agent "Qwen Text to Vega Instructions Agent" "Modify Vega-Lite specifications using user instructions" "os_text2vega" "$TEXT2VEGA_INSTRUCTIONS_PROMPT")"

AD_CONNECTOR_ID="$(upsert_connector "$AD_CONNECTOR_NAME" "$AD_CONNECTOR_PAYLOAD")"
AD_MODEL_ID="$(ensure_model "$AD_MODEL_NAME" "$AD_CONNECTOR_ID")"

# The anomaly detector UI supplies only an index name. Fetch its mapping first,
# then ask the model for the exact comma-delimited JSON fields consumed by the
# UI form.
# shellcheck disable=SC2016
SUGGEST_AD_PROMPT='Suggest OpenSearch anomaly detector fields using this index mapping.
Index: ${parameters.index}
Mapping and settings: ${parameters.IndexMappingTool.output}
Choose one to three suitable numeric or countable aggregation fields, matching aggregation methods such as avg, sum, min, max, or count, all date fields, and at most one keyword category field.
Return only valid JSON in this exact shape: {"categoryField":"service.keyword","aggregationField":"latency,error_count","aggregationMethod":"avg,sum","dateFields":"@timestamp"}. Every property value must be a JSON string, never an array. Represent multiple fields or methods inside one comma-delimited string. Use an empty categoryField when none is suitable. The aggregationField and aggregationMethod comma-delimited lists must have equal lengths.'

SUGGEST_AD_AGENT_PAYLOAD="$(jq -nc \
  --arg model_id "$AD_MODEL_ID" \
  --arg prompt "$SUGGEST_AD_PROMPT" \
  '{name:"Qwen Anomaly Detector Suggestion Agent", description:"Suggest anomaly detector fields from an index mapping", type:"flow", app_type:"os_suggest_ad", tools:[{type:"IndexMappingTool", name:"IndexMappingTool", include_output_in_agent_response:false, parameters:{index:"${parameters.index}"}},{type:"MLModelTool", name:"SuggestAnomalyDetectorTool", include_output_in_agent_response:true, parameters:{model_id:$model_id, model_type:"OPENAI", prompt:$prompt, response_filter:"$.choices[0].message.content"}}]}')"
SUGGEST_AD_AGENT_ID="$(upsert_agent "Qwen Anomaly Detector Suggestion Agent" "$SUGGEST_AD_AGENT_PAYLOAD")"

VISUAL_CONNECTOR_ID="$(upsert_connector "$VISUAL_CONNECTOR_NAME" "$VISUAL_CONNECTOR_PAYLOAD")"
VISUAL_MODEL_ID="$(ensure_model "$VISUAL_MODEL_NAME" "$VISUAL_CONNECTOR_ID")"
VISUAL_SUMMARY_AGENT_PAYLOAD="$(jq -nc \
  --arg model_id "$VISUAL_MODEL_ID" \
  '{name:"Qwen Visualization Summary Agent", description:"Summarize OpenSearch notebook visualization screenshots", type:"flow", app_type:"os_visualization_summary", tools:[{type:"MLModelTool", name:"VisualizationSummaryTool", include_output_in_agent_response:true, parameters:{model_id:$model_id, model_type:"OPENAI", response_filter:"$.choices[0].message.content"}}]}')"
VISUAL_SUMMARY_AGENT_ID="$(upsert_agent "Qwen Visualization Summary Agent" "$VISUAL_SUMMARY_AGENT_PAYLOAD")"

write_ml_config os_chat os_chat_root_agent "$ROOT_AGENT_ID"
write_ml_config os_query_assist_ppl os_query_assist_ppl_agent "$PPL_AGENT_ID"
write_ml_config os_query_time_range_parser os_query_time_range_parser_agent "$TIME_RANGE_AGENT_ID"
write_ml_config os_data2summary os_data2summary_agent "$DATA2SUMMARY_AGENT_ID"
write_ml_config os_data2summary_with_log_pattern os_data2summary_agent "$LOG_DATA2SUMMARY_AGENT_ID"
write_ml_config os_index_type_detect os_index_type_detect_agent "$INDEX_TYPE_AGENT_ID"
write_ml_config os_query_assist_response_summary os_query_assist_response_summary_agent "$QUERY_RESPONSE_SUMMARY_AGENT_ID"
write_ml_config os_query_assist_error_summary os_query_assist_error_summary_agent "$QUERY_ERROR_SUMMARY_AGENT_ID"
write_ml_config os_summary os_summary_agent "$ALERT_SUMMARY_AGENT_ID"
write_ml_config os_summary_with_log_pattern os_summary_agent "$LOG_ALERT_SUMMARY_AGENT_ID"
write_ml_config os_text2vega os_text2vega_agent "$TEXT2VEGA_AGENT_ID"
write_ml_config os_text2vega_with_instructions os_text2vega_agent "$TEXT2VEGA_INSTRUCTIONS_AGENT_ID"
write_ml_config os_suggest_ad os_suggest_ad_agent "$SUGGEST_AD_AGENT_ID"
write_ml_config os_visualization_summary os_visualization_summary_agent "$VISUAL_SUMMARY_AGENT_ID"

log "Bootstrap complete"
printf '  chat_connector_id=%s\n' "$CHAT_CONNECTOR_ID"
printf '  chat_model_id=%s\n' "$CHAT_MODEL_ID"
printf '  chat_agent_id=%s\n' "$CHAT_AGENT_ID"
printf '  root_agent_id=%s\n' "$ROOT_AGENT_ID"
printf '  ppl_connector_id=%s\n' "$PPL_CONNECTOR_ID"
printf '  ppl_model_id=%s\n' "$PPL_MODEL_ID"
printf '  ppl_agent_id=%s\n' "$PPL_AGENT_ID"
printf '  time_range_connector_id=%s\n' "$TIME_RANGE_CONNECTOR_ID"
printf '  time_range_model_id=%s\n' "$TIME_RANGE_MODEL_ID"
printf '  time_range_agent_id=%s\n' "$TIME_RANGE_AGENT_ID"
printf '  utility_model_id=%s\n' "$UTILITY_MODEL_ID"
printf '  anomaly_suggestion_model_id=%s\n' "$AD_MODEL_ID"
printf '  visualization_model_id=%s\n' "$VISUAL_MODEL_ID"
