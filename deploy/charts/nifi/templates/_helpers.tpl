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
{{- $hosts := list -}}
{{- if .Values.nifi.web.proxyHost -}}
{{- $hosts = append $hosts .Values.nifi.web.proxyHost -}}
{{- end -}}
{{- $svc := include "cogstack-nifi.serviceName" . -}}
{{- $port := int .Values.service.httpsPort -}}
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
