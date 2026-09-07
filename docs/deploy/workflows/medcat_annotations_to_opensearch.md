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

## 📥 Import the flow

1. Open NiFi at `https://localhost:8443` and upload
   `nifi/user_templates/opensearch_ingest_docs_annotations_medcat_service_to_es.json`
   as a process group.
2. Enter `opensearch_docs_ingest_annotations_to_es` and keep it stopped.
3. Right-click an empty area, select **Configure**, and open **Controller Services**.

## 🎛️ Configure the controller services

This flow has two controller services. Configure the SSL context before the OpenSearch
client that references it.

### 1. `StandardSSLContextService`

| Property | Bundled value |
|---|---|
| Keystore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-keystore.jks` |
| Keystore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Key Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Keystore Type | `JKS` |
| Truststore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-truststore.key` |
| Truststore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Truststore Type | `JKS` |
| TLS Protocol | `TLS` |

Read the password from `security/env/certificates_elasticsearch.env`. When NiFi runs
outside the standard deployment, use certificate paths available inside that runtime
and store types matching those files. Apply and enable the service.

### 2. `ElasticSearchClientServiceImpl`

| Property | Bundled value |
|---|---|
| HTTP Hosts | `https://elasticsearch-1:9200,https://elasticsearch-2:9200` |
| Authorization Scheme | `BASIC` |
| Username | Value of `ELASTIC_USER`, normally `admin` for OpenSearch |
| Password | Value of `ELASTIC_PASSWORD` |
| SSL Context Service | `StandardSSLContextService` |
| Connect Timeout | `5000` |
| Read Timeout | `60000` |
| Character Set | `UTF-8` |
| Enable Compression | `false` |
| Sniff Cluster Nodes | `false` |
| Sniff on Failure | `false` |
| Suppress Null and Empty Values | `always-suppress` |

Read credentials from `security/env/users_elasticsearch.env`. The bundled hostnames
resolve on the Compose network; change them if NiFi reaches OpenSearch through another
address. Apply and enable this service only after the SSL context is enabled.

## ⚙️ Configure each processor

Return to the canvas and configure the processors in flow order.

### 1. `SearchElasticsearch`

| Property | Bundled value | Guidance |
|---|---|---|
| Client Service | `ElasticSearchClientServiceImpl` | Must be enabled |
| Index | `encounters` | Source document index |
| Query Definition Style | `full` | Query property contains the full search body |
| Search Results Format | `SOURCE_ONLY` | Passes only `_source` to NLP |
| Search Results Split | `splitUp-no` | Keeps each result page together |
| Pagination Type | `pagination-scroll` | Uses a scroll search |
| Pagination Keep Alive | `30 mins` | Must exceed page-processing time |
| Restart On Finish | `false` | Performs one pass only |
| Output No Hits | `false` | Emits nothing for an empty result |
| Max JSON Field String Length | `20 MB` | Increase only for known larger documents |

The bundled query selects only `id` and `text` and requires `text` to exist:

```json
{
  "_source": ["id", "text"],
  "query": {
    "bool": {
      "must": [
        {"exists": {"field": "text"}}
      ]
    }
  }
}
```

Use a restrictive query or test index for the first run. Connect `hits` and
`aggregations` to `CogStackPrepareRecordForNlp`; route `failure` and `retry` to the
search failure funnel. Review processor state before re-running a completed search.

### 2. `CogStackPrepareRecordForNlp`

| Property | Bundled value |
|---|---|
| `process_flow_file_type` | `json` |
| `document_id_field_name` | `id` |
| `document_text_field_name` | `text` |

The field names must match both the source mapping and the `_source` selection above.
Connect `success` to `InvokeHTTP`, route `failure` to its funnel, and leave `original`
auto-terminated.

### 3. `InvokeHTTP`

| Property | Bundled value | Guidance |
|---|---|---|
| HTTP URL | `http://cogstack-medcat-service-production:5000/api/process_bulk` | Must resolve from NiFi |
| HTTP Method | `POST` | Keep |
| Request Body Enabled | `true` | Required |
| Request Content-Type | `${mime.type}` | Supplied by the preparation processor |
| Connection Timeout | `10 secs` | Bundled default |
| Socket Read Timeout | `60 secs` | Increase for legitimately slow batches |
| Socket Write Timeout | `120 secs` | Bundled default |
| Response Body Ignored | `false` | Required by the parser |
| Response Generation Required | `false` | Bundled default |
| HTTP/2 Disabled | `True` | Bundled default |

Connect `Response` to `CogStackParseCogStackServiceResult`; route `No Retry`, `Retry`,
and `Failure` to the HTTP failure funnel. `Original` is auto-terminated. If using a
different MedCAT deployment, change the URL without changing the `/api/process_bulk`
contract expected by the preparation and parser processors.

### 4. `CogStackParseCogStackServiceResult`

| Property | Bundled value | Meaning |
|---|---|---|
| `service_message_type` | `medcat` | Parse a MedCAT response |
| `document_id_field_name` | `id` | Source identifier |
| `document_text_field_name` | `text` | Source text field |
| `output_text_field_name` | `text` | Restored output text |
| `medcat_output_mode` | `not_set` | Normal annotations, not de-identification |
| `medcat_empty_text_handling` | `drop` | Do not emit empty-text documents |
| `medcat_no_annotations_handling` | `restore` | Restore a document with no annotations |
| `medcat_deid_keep_annotations` | `true` | Relevant only in de-identification mode |

The parser combines the source document ID and MedCAT annotation ID into
`annotation_id`. Connect `success` to `SplitJson`, route `failure` to its funnel, and
leave `original` auto-terminated.

### 5. `SplitJson`

| Property | Bundled value |
|---|---|
| JsonPath Expression | `$.*` |
| Null Value Representation | `empty string` |
| Max String Length | `20 MB` |

This produces one FlowFile per annotation. Connect `split` to
`EvaluateJsonPath-create_annotation_id_store_as_attritbute`, route `failure` to its
funnel, and leave `original` auto-terminated.

### 6. `EvaluateJsonPath-create_annotation_id_store_as_attritbute`

The processor name contains the original `attritbute` typo; this does not affect its
behavior.

| Property | Bundled value |
|---|---|
| Destination | `flowfile-attribute` |
| Return Type | `auto-detect` |
| Path Not Found Behavior | `ignore` |
| Dynamic property `annotation_id` | `$.annotation_id` |
| Max String Length | `20 MB` |

Connect `matched` to `PutElasticsearchJson`; route `unmatched` and `failure` to their
funnels. An unmatched FlowFile cannot be indexed safely because the downstream writer
uses this attribute as its deterministic ID.

### 7. `PutElasticsearchJson`

| Property | Bundled value | Guidance |
|---|---|---|
| Client Service | `ElasticSearchClientServiceImpl` | Must be enabled |
| Index | `encounters_annotations` | Keep separate from source documents |
| Index Operation | `index` | Replaces an annotation with the same ID |
| Identifier Attribute | `annotation_id` | Must match `EvaluateJsonPath` |
| Input Content Format | `Single JSON` | Required after `SplitJson` |
| Max FlowFiles Per Batch | `100` | Reduce while testing if desired |
| Max JSON Field String Length | `20 MB` | Bundled default |
| Retain Identifier Field | `true` | Keeps the identifier in `_source` |
| Log Error Responses | `false` | Enable while diagnosing rejected annotations |
| Output Error Responses | `false` | Bundled default |

The `successful` and `original` relationships are auto-terminated. Route `failure`,
`retry`, and `errors` to the OpenSearch failure funnel.

## ✅ Pre-start validation

Before starting, confirm that both controller services are enabled, all seven processors
are valid, the source query returns matching `id` and `text` fields, and the MedCAT URL
is reachable from NiFi. Confirm the destination index is not the source index. Start
with a restrictive query, then inspect HTTP responses, provenance, bulletins, and every
failure queue before processing the full source.

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
