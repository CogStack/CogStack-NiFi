{{/* Chart name */}}
{{- define "cogstack-postgresql.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Fully qualified name */}}
{{- define "cogstack-postgresql.fullname" -}}
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
{{- define "cogstack-postgresql.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "cogstack-postgresql.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Application credentials secret name */}}
{{- define "cogstack-postgresql.appSecretName" -}}
{{- if .Values.credentials.existingAppSecret -}}
{{- .Values.credentials.existingAppSecret -}}
{{- else -}}
{{- printf "%s-app" (include "cogstack-postgresql.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/* Bootstrap SQL configmap name */}}
{{- define "cogstack-postgresql.initdbConfigMapName" -}}
{{- printf "%s-initdb" (include "cogstack-postgresql.fullname" .) -}}
{{- end -}}

{{/* Normalize docker-style memory strings to Kubernetes quantities */}}
{{- define "cogstack-postgresql.normalizeMemory" -}}
{{- $value := toString . | trim -}}
{{- if regexMatch "^[0-9]+g$" $value -}}
{{- printf "%sGi" (trimSuffix "g" $value) -}}
{{- else if regexMatch "^[0-9]+m$" $value -}}
{{- printf "%sMi" (trimSuffix "m" $value) -}}
{{- else if regexMatch "^[0-9]+k$" $value -}}
{{- printf "%sKi" (trimSuffix "k" $value) -}}
{{- else -}}
{{- $value -}}
{{- end -}}
{{- end -}}

{{/* Parse deploy/database.env into a filtered YAML map */}}
{{- define "cogstack-postgresql.parsedEnvFile" -}}
{{- $root := . -}}
{{- $envData := dict -}}
{{- $rawEnv := $root.Values.envFile.raw | default ($root.Files.Get "files/deploy-database.envfile") -}}
{{- if $rawEnv -}}
{{- $renderedEnv := tpl $rawEnv $root -}}
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

{{/* Parse security/env/users_database.env into a filtered YAML map */}}
{{- define "cogstack-postgresql.parsedUsersEnvFile" -}}
{{- $root := . -}}
{{- $usersData := dict -}}
{{- $rawUsers := $root.Values.usersEnvFile.raw | default ($root.Files.Get "files/users-database.envfile") -}}
{{- if $rawUsers -}}
{{- $renderedUsers := tpl $rawUsers $root -}}
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
