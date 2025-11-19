# CogStack-NiFi

[![nifi](https://github.com/CogStack/CogStack-NiFi/actions/workflows/docker-nifi.yml/badge.svg?branch=main)](https://github.com/CogStack/CogStack-NiFi/actions/workflows/docker-nifi.yml)
[![doc-build](https://github.com/CogStack/CogStack-NiFi/actions/workflows/doc-build.yml/badge.svg?branch=main)](https://github.com/CogStack/CogStack-NiFi/actions/workflows/doc-build.yml)
[![elasticsearch-stack](https://github.com/CogStack/CogStack-NiFi/actions/workflows/docker-elasticsearch-stack.yml/badge.svg?branch=main)](https://github.com/CogStack/CogStack-NiFi/actions/workflows/docker-elasticsearch-stack.yml)

## 💡 Introduction

This repository proposes a possible next step in the evolution of free-text data processing originally implemented in [CogStack-Pipeline](https://github.com/CogStack/CogStack-Pipeline), moving towards a more modular, Platform-as-a-Service (PaaS) approach.

**CogStack-NiFi** demonstrates how to use [Apache NiFi](https://nifi.apache.org/) as the central data workflow engine for clinical document processing, integrating services such as text extraction and natural language processing (NLP). Each component runs as a standalone service, with NiFi handling data routing between components and data sources/sinks.

All NLP services are expected to implement a uniform RESTful API, allowing seamless integration into existing pipelines—making it easy to incorporate any NLP application into the stack.

---

## ⚠️ Important Notice

This project is under active development. New features or services may impact existing deployments. Please review the [release notes](https://cogstack-nifi.readthedocs.io/en/latest/news.html) and [documentation](https://cogstack-nifi.readthedocs.io) before upgrading.

---

## 💬 Asking Questions

Need help? Feel free to:

- Open an issue on the [GitHub Issue Tracker](https://github.com/CogStack/CogStack-NiFi/issues)
- Start a discussion on our [Discourse forum](https://discourse.cogstack.org) (actively monitored by the dev team)

---

## 🗂️ Project

| Folder         | Description |
|----------------|-------------|
| [`nifi`](./nifi)         | Custom Apache NiFi Docker image with workflows, configs, drivers, and user resources. |
| [`security`](./security) | Scripts for generating SSL certificates and other security-related tools. |
| [`services`](./services) | NLP and auxiliary services, each with its own configs and resources. |
| [`deploy`](./deploy)     | Example deployment setup, combining NiFi and related services. |
| [`scripts`](./scripts)   | Helper scripts (e.g., setup tools, sample DB ingestion, Elasticsearch ingestion). |
| [`data`](./data)         | Place any test or data to be ingested here. |
| [`typings`](./typings)   | Stubs for code linting/type-hint, etc. |

---

## 📚 Documentation & Getting Started

**Prerequisites**:

- Docker (mandatory)  
- Basic knowledge of Python and Linux/UNIX systems

📖 Official documentation: [cogstack-nifi.readthedocs.io](https://cogstack-nifi.readthedocs.io/en/latest/)

🚀 New to the project? Start with the [deployment guide](https://cogstack-nifi.readthedocs.io/en/latest/deploy/main.html) for example setups and workflows.

🐞 For troubleshooting or bug reports, consult the [Known Issues section](https://cogstack-nifi.readthedocs.io/en/latest/deploy/main.html) before opening a ticket.

---

## 🛑 Important Updates

Check the [IMPORTANT_NEWS](https://cogstack-nifi.readthedocs.io/en/latest/news.html) section regularly for:

- Major changes to project structure or configuration
- Security advisories or vulnerabilities affecting deployments
