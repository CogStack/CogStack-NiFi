{{/* Chart name */}}
{{- define "cogstack-opensearch.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Fully qualified name */}}
{{- define "cogstack-opensearch.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Common labels */}}
{{- define "cogstack-opensearch.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "cogstack-opensearch.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* OpenSearch selector labels */}}
{{- define "cogstack-opensearch.opensearchSelectorLabels" -}}
app.kubernetes.io/name: {{ include "cogstack-opensearch.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: opensearch
{{- end -}}

{{/* Dashboards selector labels */}}
{{- define "cogstack-opensearch.dashboardsSelectorLabels" -}}
app.kubernetes.io/name: {{ include "cogstack-opensearch.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: dashboards
{{- end -}}

{{/* Headless service name */}}
{{- define "cogstack-opensearch.headlessServiceName" -}}
{{- printf "%s-headless" (include "cogstack-opensearch.fullname" .) -}}
{{- end -}}

{{/* OpenSearch client service name */}}
{{- define "cogstack-opensearch.clientServiceName" -}}
{{- printf "%s-client" (include "cogstack-opensearch.fullname" .) -}}
{{- end -}}

{{/* Dashboards service name */}}
{{- define "cogstack-opensearch.dashboardsServiceName" -}}
{{- printf "%s-dashboards" (include "cogstack-opensearch.fullname" .) -}}
{{- end -}}

{{/* Credentials secret name */}}
{{- define "cogstack-opensearch.credentialsSecretName" -}}
{{- if .Values.credentials.existingSecret -}}
{{- .Values.credentials.existingSecret -}}
{{- else -}}
{{- printf "%s-credentials" (include "cogstack-opensearch.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/* Snapshot backup PVC names */}}
{{- define "cogstack-opensearch.snapshotBackupDataPvcName" -}}
{{- printf "%s-snapshot-backup-data" (include "cogstack-opensearch.fullname" .) -}}
{{- end -}}

{{- define "cogstack-opensearch.snapshotBackupConfigPvcName" -}}
{{- printf "%s-snapshot-backup-config" (include "cogstack-opensearch.fullname" .) -}}
{{- end -}}

{{/* Parse deploy/elasticsearch.env into a filtered YAML map */}}
{{- define "cogstack-opensearch.parsedEnvFile" -}}
{{- $root := . -}}
{{- $envData := dict -}}
{{- if $root.Values.envFile.raw -}}
{{- $renderedEnv := tpl $root.Values.envFile.raw $root -}}
{{- range $line := splitList "\n" $renderedEnv }}
  {{- $clean := trim (replace "\r" "" $line) -}}
  {{- if and $clean (not (hasPrefix "#" $clean)) -}}
    {{- if regexMatch "^[A-Za-z_][A-Za-z0-9_]*=" $clean -}}
      {{- $key := regexFind "^[A-Za-z_][A-Za-z0-9_]*" $clean -}}
      {{- $val := trim (regexReplaceAll "^[A-Za-z_][A-Za-z0-9_]*=" $clean "") -}}
      {{- if has $key $root.Values.envFile.includeKeys -}}
        {{- if and (hasPrefix "\"" $val) (hasSuffix "\"" $val) -}}
          {{- $val = trimSuffix "\"" (trimPrefix "\"" $val) -}}
        {{- else if and (hasPrefix "'" $val) (hasSuffix "'" $val) -}}
          {{- $val = trimSuffix "'" (trimPrefix "'" $val) -}}
        {{- end -}}
        {{- if regexMatch "^\\$[A-Za-z_][A-Za-z0-9_]*$" $val -}}
          {{- $refKey := trimPrefix "$" $val -}}
          {{- if hasKey $envData $refKey -}}
            {{- $val = index $envData $refKey -}}
          {{- end -}}
        {{- end -}}
        {{- $_ := set $envData $key $val -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- end -}}
{{ toYaml $envData }}
{{- end -}}

{{/* Parse security/env/users_elasticsearch.env into a filtered YAML map */}}
{{- define "cogstack-opensearch.parsedUsersEnvFile" -}}
{{- $root := . -}}
{{- $usersData := dict -}}
{{- if $root.Values.usersEnvFile.raw -}}
{{- $renderedUsers := tpl $root.Values.usersEnvFile.raw $root -}}
{{- range $line := splitList "\n" $renderedUsers }}
  {{- $clean := trim (replace "\r" "" $line) -}}
  {{- if and $clean (not (hasPrefix "#" $clean)) -}}
    {{- if regexMatch "^[A-Za-z_][A-Za-z0-9_]*=" $clean -}}
      {{- $key := regexFind "^[A-Za-z_][A-Za-z0-9_]*" $clean -}}
      {{- $val := trim (regexReplaceAll "^[A-Za-z_][A-Za-z0-9_]*=" $clean "") -}}
      {{- if has $key $root.Values.usersEnvFile.includeKeys -}}
        {{- if and (hasPrefix "\"" $val) (hasSuffix "\"" $val) -}}
          {{- $val = trimSuffix "\"" (trimPrefix "\"" $val) -}}
        {{- else if and (hasPrefix "'" $val) (hasSuffix "'" $val) -}}
          {{- $val = trimSuffix "'" (trimPrefix "'" $val) -}}
        {{- end -}}
        {{- $_ := set $usersData $key $val -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- end -}}
{{ toYaml $usersData }}
{{- end -}}

{{/* Parse security/env/certificates_elasticsearch.env into a filtered YAML map */}}
{{- define "cogstack-opensearch.parsedCertificatesEnvFile" -}}
{{- $root := . -}}
{{- $certData := dict -}}
{{- if $root.Values.certificatesEnvFile.raw -}}
{{- $renderedCerts := tpl $root.Values.certificatesEnvFile.raw $root -}}
{{- range $line := splitList "\n" $renderedCerts }}
  {{- $clean := trim (replace "\r" "" $line) -}}
  {{- if and $clean (not (hasPrefix "#" $clean)) -}}
    {{- if regexMatch "^[A-Za-z_][A-Za-z0-9_]*=" $clean -}}
      {{- $key := regexFind "^[A-Za-z_][A-Za-z0-9_]*" $clean -}}
      {{- $val := trim (regexReplaceAll "^[A-Za-z_][A-Za-z0-9_]*=" $clean "") -}}
      {{- if has $key $root.Values.certificatesEnvFile.includeKeys -}}
        {{- if and (hasPrefix "\"" $val) (hasSuffix "\"" $val) -}}
          {{- $val = trimSuffix "\"" (trimPrefix "\"" $val) -}}
        {{- else if and (hasPrefix "'" $val) (hasSuffix "'" $val) -}}
          {{- $val = trimSuffix "'" (trimPrefix "'" $val) -}}
        {{- end -}}
        {{- $_ := set $certData $key $val -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- end -}}
{{ toYaml $certData }}
{{- end -}}

{{/* CSV of StatefulSet pod DNS names used for discovery.seed_hosts */}}
{{- define "cogstack-opensearch.seedHosts" -}}
{{- $fullname := include "cogstack-opensearch.fullname" . -}}
{{- $headless := include "cogstack-opensearch.headlessServiceName" . -}}
{{- $ns := .Release.Namespace -}}
{{- $replicas := int .Values.opensearch.replicas -}}
{{- range $i, $_ := until $replicas -}}
{{- if $i }},{{ end -}}{{ printf "%s-%d.%s.%s.svc" $fullname $i $headless $ns }}
{{- end -}}
{{- end -}}

{{/* CSV of node names for cluster.initial_cluster_manager_nodes */}}
{{- define "cogstack-opensearch.clusterManagerNodes" -}}
{{- $fullname := include "cogstack-opensearch.fullname" . -}}
{{- $replicas := int .Values.opensearch.replicas -}}
{{- range $i, $_ := until $replicas -}}
{{- if $i }},{{ end -}}{{ printf "%s-%d" $fullname $i }}
{{- end -}}
{{- end -}}

{{/* JSON array for ELASTICSEARCH_HOSTS */}}
{{- define "cogstack-opensearch.elasticsearchHostsJson" -}}
{{- if .Values.opensearch.enabled -}}
{{- $svc := include "cogstack-opensearch.clientServiceName" . -}}
{{- $ns := .Release.Namespace -}}
{{- printf "[\"https://%s.%s.svc:%d\"]" $svc $ns (int .Values.opensearch.service.httpPort) -}}
{{- else -}}
{{- if .Values.dashboards.opensearchHosts -}}
{{ toJson .Values.dashboards.opensearchHosts }}
{{- else -}}
{{- fail "dashboards.opensearchHosts must be set when opensearch.enabled=false" -}}
{{- end -}}
{{- end -}}
{{- end -}}
