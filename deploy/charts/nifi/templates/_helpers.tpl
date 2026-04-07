{{/* Chart name */}}
{{- define "cogstack-nifi.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Fully qualified name */}}
{{- define "cogstack-nifi.fullname" -}}
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
{{- define "cogstack-nifi.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "cogstack-nifi.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Selector labels */}}
{{- define "cogstack-nifi.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cogstack-nifi.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: nifi
{{- end -}}

{{/* Service account name */}}
{{- define "cogstack-nifi.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "cogstack-nifi.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/* Sensitive config secret name */}}
{{- define "cogstack-nifi.sensitiveSecretName" -}}
{{- if .Values.sensitiveConfig.existingSecret -}}
{{- .Values.sensitiveConfig.existingSecret -}}
{{- else -}}
{{- printf "%s-sensitive-config" (include "cogstack-nifi.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/* Normalize docker-style memory strings to Kubernetes quantities */}}
{{- define "cogstack-nifi.normalizeMemory" -}}
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

{{/* Parse deploy/nifi.env into a filtered YAML map */}}
{{- define "cogstack-nifi.parsedEnvFile" -}}
{{- $root := . -}}
{{- $envData := dict -}}
{{- $rawEnv := $root.Values.envFile.raw | default ($root.Files.Get "files/deploy-nifi.envfile") -}}
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

{{/* Parse security/env/certificates_nifi.env into a filtered YAML map */}}
{{- define "cogstack-nifi.parsedCertificatesEnvFile" -}}
{{- $root := . -}}
{{- $certData := dict -}}
{{- $rawCerts := $root.Values.certificatesEnvFile.raw | default ($root.Files.Get "files/certificates-nifi.envfile") -}}
{{- if $rawCerts -}}
{{- $renderedCerts := tpl $rawCerts $root -}}
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

{{/* Parse security/env/users_nifi.env into a filtered YAML map */}}
{{- define "cogstack-nifi.parsedUsersEnvFile" -}}
{{- $root := . -}}
{{- $usersData := dict -}}
{{- $rawUsers := $root.Values.usersEnvFile.raw | default ($root.Files.Get "files/users-nifi.envfile") -}}
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

{{/* Service names */}}
{{- define "cogstack-nifi.serviceName" -}}
{{- printf "%s" (include "cogstack-nifi.fullname" .) -}}
{{- end -}}

{{- define "cogstack-nifi.headlessServiceName" -}}
{{- printf "%s-headless" (include "cogstack-nifi.fullname" .) -}}
{{- end -}}

{{/* Kubernetes cluster coordination prefixes */}}
{{- define "cogstack-nifi.clusterLeasePrefix" -}}
{{- default (printf "%s-" (include "cogstack-nifi.fullname" .)) .Values.nifi.cluster.leasePrefix -}}
{{- end -}}

{{- define "cogstack-nifi.clusterConfigMapPrefix" -}}
{{- default (printf "%s-" (include "cogstack-nifi.fullname" .)) .Values.nifi.cluster.configMapNamePrefix -}}
{{- end -}}

{{/* NiFi proxy host allow-list */}}
{{- define "cogstack-nifi.proxyHosts" -}}
{{- $envData := include "cogstack-nifi.parsedEnvFile" . | fromYaml | default (dict) -}}
{{- $hosts := list -}}
{{- $proxyHost := .Values.nifi.web.proxyHost -}}
{{- if hasKey $envData "NIFI_WEB_PROXY_HOST" -}}
{{- $proxyHost = index $envData "NIFI_WEB_PROXY_HOST" -}}
{{- end -}}
{{- if $proxyHost -}}
{{- $hosts = append $hosts $proxyHost -}}
{{- end -}}
{{- $svc := include "cogstack-nifi.serviceName" . -}}
{{- $port := int .Values.service.httpsPort -}}
{{- if hasKey $envData "NIFI_INTERNAL_PORT" -}}
{{- $port = int (index $envData "NIFI_INTERNAL_PORT") -}}
{{- end -}}
{{- $hosts = append $hosts (printf "%s:%d" $svc $port) -}}
{{- $hosts = append $hosts (printf "%s.%s:%d" $svc .Release.Namespace $port) -}}
{{- $hosts = append $hosts (printf "%s.%s.svc:%d" $svc .Release.Namespace $port) -}}
{{- range .Values.nifi.web.additionalProxyHosts -}}
{{- $hosts = append $hosts . -}}
{{- end -}}
{{- if .Values.ingress.enabled -}}
{{- range .Values.ingress.hosts -}}
{{- if .host -}}
{{- $hosts = append $hosts .host -}}
{{- end -}}
{{- end -}}
{{- end -}}
{{- join "," $hosts -}}
{{- end -}}
