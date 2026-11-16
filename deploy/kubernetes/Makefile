SHELL := /usr/bin/env bash
.SHELLFLAGS := -o pipefail -c

# Resolve defaults from this file so both deployment entry points use the same paths.
KUBERNETES_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
KUBERNETES_DEPLOY_DIR := $(abspath $(KUBERNETES_DIR)/..)

HELM_NIFI_RELEASE ?= cogstack-nifi
HELM_NIFI_NAMESPACE ?= cogstack
HELM_NIFI_CHART ?= $(KUBERNETES_DIR)/charts/nifi
HELM_NIFI_VALUES_FILE ?= $(KUBERNETES_DIR)/values/nifi.yaml
HELM_NIFI_VALUES_ARG = -f "$(HELM_NIFI_VALUES_FILE)"
HELM_GITEA_RELEASE ?= cogstack-gitea
HELM_GITEA_NAMESPACE ?= cogstack
HELM_GITEA_REPO_NAME ?= gitea-charts
HELM_GITEA_REPO_URL ?= https://dl.gitea.com/charts/
HELM_GITEA_CHART ?= $(HELM_GITEA_REPO_NAME)/gitea
HELM_GITEA_CHART_VERSION ?= 12.5.0
HELM_GITEA_VALUES_FILE ?= $(KUBERNETES_DIR)/values/gitea.yaml
HELM_GITEA_VALUES_ARG = -f "$(HELM_GITEA_VALUES_FILE)"
COGSTACK_CONFIG_DIR ?=
export COGSTACK_CONFIG_DIR

define KUBERNETES_WITH_ENV
source "$(KUBERNETES_DEPLOY_DIR)/export_env_vars.sh" || exit $$?;
endef

# The parent Makefile supplies the combined help target when including this file.
ifeq ($(abspath $(firstword $(MAKEFILE_LIST))),$(KUBERNETES_DIR)/Makefile)
.DEFAULT_GOAL := help
help: ## List available targets with descriptions
	@awk -F ':.*##[[:space:]]*' '/^[a-zA-Z0-9][a-zA-Z0-9_-]*:.*##/ {printf "  %-28s %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

.PHONY: help
endif

helm-template-nifi: ## Render CogStack NiFi using chart defaults plus values/nifi.yaml
	$(KUBERNETES_WITH_ENV) helm template $(HELM_NIFI_RELEASE) "$(HELM_NIFI_CHART)" $(HELM_NIFI_VALUES_ARG) --namespace $(HELM_NIFI_NAMESPACE) \
		--set-file envFile.raw="$${COGSTACK_NIFI_ENV_FILE}" \
		--set-file certificatesEnvFile.raw="$${COGSTACK_CERTIFICATES_NIFI_ENV_FILE}" \
		--set-file usersEnvFile.raw="$${COGSTACK_USERS_NIFI_ENV_FILE}"

helm-install-nifi: ## Install/upgrade CogStack NiFi using chart defaults plus values/nifi.yaml
	$(KUBERNETES_WITH_ENV) helm upgrade --install $(HELM_NIFI_RELEASE) "$(HELM_NIFI_CHART)" $(HELM_NIFI_VALUES_ARG) --namespace $(HELM_NIFI_NAMESPACE) --create-namespace \
		--set-file envFile.raw="$${COGSTACK_NIFI_ENV_FILE}" \
		--set-file certificatesEnvFile.raw="$${COGSTACK_CERTIFICATES_NIFI_ENV_FILE}" \
		--set-file usersEnvFile.raw="$${COGSTACK_USERS_NIFI_ENV_FILE}"

helm-repo-add-gitea: ## Add/update the official Gitea Helm repository
	@if ! helm repo list | awk '$$1 == "$(HELM_GITEA_REPO_NAME)" { found=1 } END { exit !found }'; then \
		helm repo add $(HELM_GITEA_REPO_NAME) $(HELM_GITEA_REPO_URL); \
	fi
	helm repo update $(HELM_GITEA_REPO_NAME)

helm-template-gitea: helm-repo-add-gitea ## Render the official Gitea chart using values/gitea.yaml
	helm template $(HELM_GITEA_RELEASE) "$(HELM_GITEA_CHART)" --version $(HELM_GITEA_CHART_VERSION) $(HELM_GITEA_VALUES_ARG) --namespace $(HELM_GITEA_NAMESPACE)

helm-install-gitea: helm-repo-add-gitea ## Install/upgrade the official Gitea chart using values/gitea.yaml
	helm upgrade --install $(HELM_GITEA_RELEASE) "$(HELM_GITEA_CHART)" --version $(HELM_GITEA_CHART_VERSION) $(HELM_GITEA_VALUES_ARG) --namespace $(HELM_GITEA_NAMESPACE) --create-namespace

.PHONY: helm-template-nifi helm-install-nifi helm-repo-add-gitea helm-template-gitea helm-install-gitea
