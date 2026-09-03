# 🧠 MedCAT annotations to OpenSearch

Template: `nifi/user_templates/opensearch_ingest_docs_annotations_medcat_service_to_es.json`

[View the flow definition on GitHub](https://github.com/CogStack/CogStack-NiFi/blob/main/nifi/user_templates/opensearch_ingest_docs_annotations_medcat_service_to_es.json)

## 🎯 Purpose

This flow reads documents that already exist in OpenSearch, sends their text to the
CogStack MedCAT service, expands the response into individual annotation documents,
and writes those annotations to a separate OpenSearch index.

## 🔗 Processor chain

```text
SearchElasticsearch
  -> CogStackPrepareRecordForNlp
  -> InvokeHTTP
  -> CogStackParseCogStackServiceResult
  -> SplitJson
  -> EvaluateJsonPath-create_annotation_id_store_as_attritbute
  -> PutElasticsearchJson
```

The preparation processor sends the document text plus a footer containing the source
fields. The response parser creates an `annotation_id` by combining the source document
ID and MedCAT annotation ID. `EvaluateJsonPath` copies it to a FlowFile attribute used
as the destination document ID.

## 📋 Bundled defaults

| Setting | Value |
|---|---|
| Source OpenSearch index | `encounters` |
| Source fields | `id`, `text` |
| Search condition | Documents where `text` exists |
| Pagination | Scroll, keep-alive `30 mins` |
| Restart on finish | `false` |
| MedCAT endpoint | `http://cogstack-medcat-service-production:5000/api/process_bulk` |
| Document ID field | `id` |
| Document text field | `text` |
| Destination index | `encounters_annotations` |
| Index operation | `index` |
| Destination ID attribute | `annotation_id` |

## ✅ Requirements

- The source OpenSearch index exists and its documents contain stable `id` and `text`
  fields.
- The MedCAT service and its configured model are running:

  ```bash
  make -C deploy start-medcat-service
  ```

- NiFi can resolve `cogstack-medcat-service-production` on the Docker network, or the
  `InvokeHTTP` URL is changed to a reachable MedCAT endpoint.
- OpenSearch and SSL controller-service passwords are entered after import.

## ⚙️ Configure after import

1. Configure `ElasticSearchClientServiceImpl` with the correct hosts and credentials.
   The bundled flow lists `elasticsearch-1` and `elasticsearch-2`.
2. Configure and enable `StandardSSLContextService` using the generated deployment
   certificates and passwords.
3. Update the source index, `_source` fields, and query in `SearchElasticsearch`.
4. Match `document_id_field_name` and `document_text_field_name` in
   `CogStackPrepareRecordForNlp` and `CogStackParseCogStackServiceResult` to the source
   mapping.
5. Verify the MedCAT URL and keep **Request Body Enabled** set to `true`.
6. Set the destination index in `PutElasticsearchJson`. Keep `annotation_id` as the
   identifier unless another deterministic uniqueness scheme is required.

The bundled parser uses normal annotation mode (`medcat_output_mode=not_set`), not
de-identification mode. Each annotation becomes a separate destination document.

## ▶️ Run and verify

The search processor is configured for a single pass because **Restart On Finish** is
`false`. Start with a restrictive query or a test index, then confirm the annotation
index count:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/encounters_annotations/_count'
```

Using deterministic `annotation_id` values makes deliberate reprocessing idempotent for
the same source document and MedCAT annotation IDs.

## ⚠️ Failure handling

Search, HTTP, preparation, parsing, splitting, identifier extraction, and OpenSearch
failures are routed to funnels. Documents with no returned annotations do not create
annotation records in the bundled non-de-identification mode. Inspect MedCAT responses
and NiFi provenance when input counts and annotation counts differ.
