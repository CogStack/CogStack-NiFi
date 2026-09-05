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
  OPENSEARCH_AI_OPENSEARCH_CONTAINER
  OPENSEARCH_AI_OPENSEARCH_USER
  OPENSEARCH_AI_OPENSEARCH_PASSWORD
  OPENSEARCH_AI_CONNECTION_TIMEOUT_SECONDS
  OPENSEARCH_AI_READ_TIMEOUT_SECONDS
  OPENSEARCH_AI_DEPLOY_TIMEOUT_SECONDS
  OPENSEARCH_AI_MAX_TOKENS
  OPENSEARCH_AI_REASONING_EFFORT
  OPENSEARCH_AI_CHAT_CONNECTOR_NAME
  OPENSEARCH_AI_CHAT_MODEL_NAME
  OPENSEARCH_AI_CHAT_AGENT_NAME
  OPENSEARCH_AI_ROOT_AGENT_NAME
  OPENSEARCH_AI_PPL_CONNECTOR_NAME
  OPENSEARCH_AI_PPL_MODEL_NAME
  OPENSEARCH_AI_PPL_AGENT_NAME
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
OLLAMA_MODEL_NAME="${OLLAMA_MODEL:-qwen3.5:9b-q4_K_M}"

CONNECTION_TIMEOUT="${OPENSEARCH_AI_CONNECTION_TIMEOUT_SECONDS:-120}"
READ_TIMEOUT="${OPENSEARCH_AI_READ_TIMEOUT_SECONDS:-360}"
DEPLOY_TIMEOUT="${OPENSEARCH_AI_DEPLOY_TIMEOUT_SECONDS:-300}"
MAX_TOKENS="${OPENSEARCH_AI_MAX_TOKENS:-256}"
REASONING_EFFORT="${OPENSEARCH_AI_REASONING_EFFORT:-none}"

CHAT_CONNECTOR_NAME="${OPENSEARCH_AI_CHAT_CONNECTOR_NAME:-Ollama Qwen Agent Connector}"
CHAT_MODEL_NAME="${OPENSEARCH_AI_CHAT_MODEL_NAME:-Qwen 3.5 Ollama Agent Model}"
CHAT_AGENT_NAME="${OPENSEARCH_AI_CHAT_AGENT_NAME:-Qwen 3.5 Conversational Agent v2}"
ROOT_AGENT_NAME="${OPENSEARCH_AI_ROOT_AGENT_NAME:-Qwen Dashboards Root Agent}"
PPL_CONNECTOR_NAME="${OPENSEARCH_AI_PPL_CONNECTOR_NAME:-Ollama Qwen PPL Connector}"
PPL_MODEL_NAME="${OPENSEARCH_AI_PPL_MODEL_NAME:-Qwen 3.5 Ollama PPL Model}"
PPL_AGENT_NAME="${OPENSEARCH_AI_PPL_AGENT_NAME:-Qwen PPL Query Assist Agent}"

OPENSEARCH_URL="https://localhost:9200"
OPENSEARCH_CA="/usr/share/opensearch/config/root-ca.crt"

[[ -n "$OPENSEARCH_PASSWORD" ]] \
  || die "set OPENSEARCH_AI_OPENSEARCH_PASSWORD or ELASTIC_PASSWORD"

for command_name in docker jq; do
  command -v "$command_name" >/dev/null 2>&1 || die "$command_name is required"
done

for integer_value in "$CONNECTION_TIMEOUT" "$READ_TIMEOUT" "$DEPLOY_TIMEOUT" "$MAX_TOKENS"; do
  [[ "$integer_value" =~ ^[1-9][0-9]*$ ]] || die "timeout and token settings must be positive integers"
done

[[ "$(docker inspect --format '{{.State.Running}}' "$OPENSEARCH_CONTAINER" 2>/dev/null)" == "true" ]] \
  || die "OpenSearch container '$OPENSEARCH_CONTAINER' is not running"
[[ "$(docker inspect --format '{{.State.Running}}' "$OLLAMA_CONTAINER" 2>/dev/null)" == "true" ]] \
  || die "Ollama container '$OLLAMA_CONTAINER' is not running"

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

wait_for_opensearch
wait_for_ollama

# The single quotes deliberately preserve ML Commons ${parameters.*}
# placeholders until connector inference time.
# shellcheck disable=SC2016
printf -v CHAT_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"${parameters.system_prompt}"},${parameters._chat_history:-}{"role":"user","content":"${parameters.prompt}"}${parameters._interactions:-}], "stream": false, "max_tokens": %d, "reasoning_effort": "%s"${parameters.tool_configs:-} }' \
  "$MAX_TOKENS" "$REASONING_EFFORT"

# shellcheck disable=SC2016
printf -v PPL_REQUEST_BODY \
  '{ "model": "${parameters.model}", "messages": [{"role":"system","content":"Translate the request into a valid OpenSearch PPL query. Return only the PPL query."},{"role":"user","content":"${parameters.prompt}"}], "stream": false, "max_tokens": %d, "reasoning_effort": "%s" }' \
  "$MAX_TOKENS" "$REASONING_EFFORT"

CLIENT_CONFIG="$(jq -nc \
  --argjson connection_timeout "$CONNECTION_TIMEOUT" \
  --argjson read_timeout "$READ_TIMEOUT" \
  '{max_connection:10, connection_timeout:$connection_timeout, read_timeout:$read_timeout, max_retry_times:0}')"

CHAT_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$CHAT_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$CHAT_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"OpenAI-compatible Ollama connector for OpenSearch conversational agents", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

PPL_CONNECTOR_PAYLOAD="$(jq -nc \
  --arg name "$PPL_CONNECTOR_NAME" \
  --arg model "$OLLAMA_MODEL_NAME" \
  --arg request_body "$PPL_REQUEST_BODY" \
  --argjson client_config "$CLIENT_CONFIG" \
  '{name:$name, description:"Prompt-compatible Ollama connector for OpenSearch PPL query assist", version:"1", protocol:"http", parameters:{endpoint:"ollama:11434", model:$model, response_filter:"$.choices[0].message.content"}, credential:{ollama_key:"local"}, client_config:$client_config, actions:[{action_type:"predict", method:"POST", url:"http://${parameters.endpoint}/v1/chat/completions", headers:{"Content-Type":"application/json"}, request_body:$request_body}]}')"

CHAT_CONNECTOR_ID="$(upsert_connector "$CHAT_CONNECTOR_NAME" "$CHAT_CONNECTOR_PAYLOAD")"
CHAT_MODEL_ID="$(ensure_model "$CHAT_MODEL_NAME" "$CHAT_CONNECTOR_ID")"

CHAT_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$CHAT_AGENT_NAME" \
  --arg model_id "$CHAT_MODEL_ID" \
  '{name:$name, description:"Local Qwen assistant served through Ollama", type:"conversational", app_type:"os_chat", memory:{type:"conversation_index"}, llm:{model_id:$model_id, parameters:{max_iteration:"3", response_filter:"$.response", system_prompt:"You are a helpful OpenSearch assistant. Keep answers concise unless the user requests detail.", prompt:"${parameters.question}", message_history_limit:"5"}}, parameters:{_llm_interface:"openai/v1/chat/completions"}}')"
CHAT_AGENT_ID="$(upsert_agent "$CHAT_AGENT_NAME" "$CHAT_AGENT_PAYLOAD")"

ROOT_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$ROOT_AGENT_NAME" \
  --arg agent_id "$CHAT_AGENT_ID" \
  '{name:$name, description:"Root agent for OpenSearch Assistant", type:"flow", app_type:"os_chat", tools:[{type:"AgentTool", name:"LLMResponseGenerator", include_output_in_agent_response:true, parameters:{agent_id:$agent_id}}]}')"
ROOT_AGENT_ID="$(upsert_agent "$ROOT_AGENT_NAME" "$ROOT_AGENT_PAYLOAD")"

PPL_CONNECTOR_ID="$(upsert_connector "$PPL_CONNECTOR_NAME" "$PPL_CONNECTOR_PAYLOAD")"
PPL_MODEL_ID="$(ensure_model "$PPL_MODEL_NAME" "$PPL_CONNECTOR_ID")"

PPL_AGENT_PAYLOAD="$(jq -nc \
  --arg name "$PPL_AGENT_NAME" \
  --arg model_id "$PPL_MODEL_ID" \
  '{name:$name, description:"Generate PPL queries from natural-language questions", type:"flow", app_type:"query_assist", tools:[{type:"PPLTool", name:"TransferQuestionToPPLAndExecuteTool", description:"Translate a natural-language question into an OpenSearch PPL query for the supplied index. Inputs: {index:IndexName, question:UserQuestion}.", include_output_in_agent_response:true, parameters:{model_id:$model_id, model_type:"OPENAI", response_filter:"$.choices[0].message.content", execute:false}}]}')"
PPL_AGENT_ID="$(upsert_agent "$PPL_AGENT_NAME" "$PPL_AGENT_PAYLOAD")"

write_ml_config os_chat os_chat_root_agent "$ROOT_AGENT_ID"
write_ml_config os_query_assist_ppl os_query_assist_ppl_agent "$PPL_AGENT_ID"

log "Bootstrap complete"
printf '  chat_connector_id=%s\n' "$CHAT_CONNECTOR_ID"
printf '  chat_model_id=%s\n' "$CHAT_MODEL_ID"
printf '  chat_agent_id=%s\n' "$CHAT_AGENT_ID"
printf '  root_agent_id=%s\n' "$ROOT_AGENT_ID"
printf '  ppl_connector_id=%s\n' "$PPL_CONNECTOR_ID"
printf '  ppl_model_id=%s\n' "$PPL_MODEL_ID"
printf '  ppl_agent_id=%s\n' "$PPL_AGENT_ID"
