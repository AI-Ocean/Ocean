{{- define "mariadb.primary.host" -}}
{{ .Release.Name }}-mariadb.{{ .Release.Namespace }}.svc.cluster.local
{{- end -}}