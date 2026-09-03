# Local OpenSearch ML models

Place custom TorchScript or ONNX model ZIP files in this directory before
starting the OpenSearch containers. The directory is mounted read-only at the
same path on every OpenSearch node:

```text
/usr/share/opensearch/models
```

Register a model through the ML Commons REST API or OpenSearch Dashboards Dev
Tools using a URL such as:

```text
file:///usr/share/opensearch/models/my-model.zip
```

Do not commit model binaries to the repository.
