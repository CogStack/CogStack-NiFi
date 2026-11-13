# Cluster prerequisite, installed separately from PostgreSQL application releases.
CNPG_OPERATOR_MINOR ?= 1.28
CNPG_OPERATOR_VERSION ?= 1.28.1
CNPG_OPERATOR_MANIFEST ?= https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-$(CNPG_OPERATOR_MINOR)/releases/cnpg-$(CNPG_OPERATOR_VERSION).yaml

kube-install-cnpg-operator: ## Install CloudNativePG operator/CRDs from the pinned upstream manifest
	kubectl apply --server-side -f "$(CNPG_OPERATOR_MANIFEST)"

.PHONY: kube-install-cnpg-operator
