# 📄 Database documents via OCR

Template: `nifi/user_templates/opensearch_ingest_docs_db_ocr_service_to_es.json`

[View the flow definition on GitHub](https://github.com/CogStack/CogStack-NiFi/blob/main/nifi/user_templates/opensearch_ingest_docs_db_ocr_service_to_es.json)

## 🎯 Purpose

This flow reads binary documents from PostgreSQL, sends one document at a time to the
CogStack OCR service, merges the extracted text with the source metadata, and indexes
the result in OpenSearch.

## 🔗 Processor chain

```text
GenerateTableFetch-encounters
  -> ExecuteSQLRecord
  -> CogStackPrepareRecordForOcr
  -> InvokeHTTP
  -> CogStackParseCogStackServiceResult
  -> SplitJson
  -> EvaluateJsonPath
  -> PutElasticsearchJson
```

`CogStackPrepareRecordForOcr` converts the Avro binary field to a base64 JSON request
and preserves the remaining source fields in a footer. After OCR, the parser restores
that footer, adds the extracted `text`, and exposes `id` as a FlowFile attribute for
OpenSearch indexing.

## 📋 Bundled defaults

| Setting | Value |
|---|---|
| Database URL | `jdbc:postgresql://samples-db:5432/db_samples` |
| Source table | `encounters` |
| Incremental/partition column | `cid` |
| Partition size | `1000` |
| Rows per FlowFile | `1` |
| Binary source field | `binarydocument` |
| Document ID field | `id` |
| OCR endpoint | `http://ocr-service:8090/api/process` |
| Extracted text field | `text` |
| OpenSearch endpoint | `https://elasticsearch-1:9200` |
| Target index | `${generatetablefetch.tableName}` (`encounters` by default) |
| Index operation | `index` |
| OpenSearch identifier attribute | `id` |

## ✅ Requirements

- The core stack and sample database are running.
- The OCR service is running. From the repository root use:

  ```bash
  make -C deploy start-ocr-services
  ```

- The source table contains a numeric incremental column, a unique document ID, and a
  binary document column.
- NiFi can resolve `ocr-service` on the Docker network, or the `InvokeHTTP` URL is
  changed to a reachable endpoint.
- Database, OpenSearch, keystore, and truststore passwords are entered after import.

## 📥 Import the flow

1. Open NiFi at `https://localhost:8443` and upload
   `nifi/user_templates/opensearch_ingest_docs_db_ocr_service_to_es.json` as a process
   group.
2. Enter `opensearch_ingest_docs_db_ocr_service_to_es` and keep it stopped.
3. Right-click an empty area, select **Configure**, and open **Controller Services**.

## 🎛️ Configure the controller services

| Controller service | Used by |
|---|---|
| `DBCPConnectionPool` | `GenerateTableFetch-encounters`, `ExecuteSQLRecord` |
| `AvroRecordSetWriter` | `ExecuteSQLRecord` |
| `StandardSSLContextService` | `ElasticSearchClientServiceImpl` |
| `ElasticSearchClientServiceImpl` | `PutElasticsearchJson` |

### 1. `DBCPConnectionPool`

| Property | Bundled value |
|---|---|
| Database Connection URL | `jdbc:postgresql://samples-db:5432/db_samples` |
| Database Driver Class Name | `org.postgresql.Driver` |
| Database Driver Locations | `/opt/nifi/drivers/postgresql-42.7.7.jar` |
| Database User | Value of `POSTGRES_USER_SAMPLES`, `test` by default |
| Password | Value of `POSTGRES_PASSWORD_SAMPLES` |
| Password Source | `PASSWORD` |
| Max Total Connections | `8` |
| Maximum Idle Connections | `8` |
| Minimum Idle Connections | `0` |
| Max Wait Time | `500 millis` |

Read the credentials from `security/env/users_database.env`. When using another source,
change the URL, driver class, driver JAR, and credentials together. Apply and enable the
service.

### 2. `AvroRecordSetWriter`

| Property | Value |
|---|---|
| Schema Access Strategy | `inherit-record-schema` |
| Schema Write Strategy | `avro-embedded` |
| Compression Format | `NONE` |
| Encoder Pool Size | `32` |
| Cache Size | `1000` |

This writer supplies the embedded schema consumed by `CogStackPrepareRecordForOcr`.
Apply and enable it.

### 3. `StandardSSLContextService`

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

Read the password from `security/env/certificates_elasticsearch.env`. Confirm that the
paths and store types match the files mounted into NiFi, then apply and enable the
service.

### 4. `ElasticSearchClientServiceImpl`

| Property | Bundled value |
|---|---|
| HTTP Hosts | `https://elasticsearch-1:9200` |
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

Read credentials from `security/env/users_elasticsearch.env`. Apply and enable this
service only after the SSL context is enabled.

## ⚙️ Configure each processor

Return to the process-group canvas and configure the processors in flow order.

### 1. `GenerateTableFetch-encounters`

| Property | Bundled value | Guidance |
|---|---|---|
| Database Connection Pooling Service | `DBCPConnectionPool` | Must be enabled |
| Database Type | `PostgreSQL` | Match the source database |
| Table Name | `encounters` | Change for another source table |
| Maximum-value Columns | `cid` | Numeric, indexed, monotonically increasing column |
| Column for Value Partitioning | `cid` | Usually the same indexed column |
| Partition Size | `1000` | Reduce for an initial OCR test |
| Output Empty FlowFile on Zero Results | `false` | Keep |

Connect `success` to `ExecuteSQLRecord` and `failure` to its funnel. This processor
stores incremental state; clearing it deliberately resubmits old rows to OCR.

### 2. `ExecuteSQLRecord`

| Property | Bundled value | Guidance |
|---|---|---|
| Database Connection Pooling Service | `DBCPConnectionPool` | Must be enabled |
| Record Writer | `AvroRecordSetWriter` | Must be enabled |
| Max Rows Per FlowFile | `1` | Required for one OCR request per document |
| Output Batch Size | `0` | Keep |
| Fetch Size | `0` | Driver default |
| Use Avro Logical Types | `true` | Keep unless conversion is deliberately changed |
| Set Auto Commit | `true` | Bundled default |

Leave **SQL Query** empty because the incoming FlowFile contains the query generated by
`GenerateTableFetch`. Connect `success` to `CogStackPrepareRecordForOcr` and `failure`
to its funnel.

### 3. `CogStackPrepareRecordForOcr`

| Property | Bundled value | Meaning |
|---|---|---|
| `process_flow_file_type` | `avro` | Input from `ExecuteSQLRecord` |
| `binary_field_name` | `binarydocument` | Source document bytes |
| `document_id_field_name` | `id` | Stable destination ID |
| `output_text_field_name` | `text` | Field that receives OCR text |
| `operation_mode` | `base64` | Encodes bytes in the JSON request |

All named fields must exist in the SQL result. Connect `success` to `InvokeHTTP` and
`failure` to its funnel; `original` is auto-terminated. The processor also sets the
request MIME type used by `InvokeHTTP`.

### 4. `InvokeHTTP`

| Property | Bundled value | Guidance |
|---|---|---|
| HTTP URL | `http://ocr-service:8090/api/process` | Must be reachable from NiFi |
| HTTP Method | `POST` | Keep |
| Request Body Enabled | `true` | Required |
| Request Content-Type | `${mime.type}` | Supplied by the preparation processor |
| Connection Timeout | `15 secs` | Increase only for connection establishment issues |
| Socket Read Timeout | `30 secs` | Increase for documents that legitimately take longer |
| Socket Write Timeout | `30 secs` | Bundled default |
| Response Body Ignored | `false` | Required by the parser |
| Response Generation Required | `false` | Bundled default |

For the text-only OCR container, use
`http://ocr-service-text-only:8090/api/process`. Connect `Response` to
`CogStackParseCogStackServiceResult`; route `No Retry`, `Retry`, and `Failure` to the
HTTP failure funnel. `Original` is auto-terminated.

### 5. `CogStackParseCogStackServiceResult`

| Property | Bundled value |
|---|---|
| `service_message_type` | `ocr` |
| `document_id_field_name` | `id` |
| `document_text_field_name` | `text` |
| `output_text_field_name` | `text` |
| `medcat_output_mode` | `not_set` |

The MedCAT-prefixed properties are shared by the generic parser and are not used for a
normal OCR response. Connect `success` to `SplitJson` and `failure` to its funnel;
`original` is auto-terminated.

### 6. `SplitJson`

| Property | Bundled value |
|---|---|
| JsonPath Expression | `$.*` |
| Null Value Representation | `empty string` |
| Max String Length | `20 MB` |

Connect `split` to `EvaluateJsonPath`, route `failure` to its funnel, and leave
`original` auto-terminated.

### 7. `EvaluateJsonPath`

| Property | Bundled value |
|---|---|
| Destination | `flowfile-attribute` |
| Return Type | `auto-detect` |
| Path Not Found Behavior | `ignore` |
| Dynamic property `id` | `$.id` |
| Max String Length | `20 MB` |

This creates the `id` FlowFile attribute used by the OpenSearch writer. Connect
`matched` to `PutElasticsearchJson`; route `unmatched` and `failure` to their funnels.

### 8. `PutElasticsearchJson`

| Property | Bundled value | Guidance |
|---|---|---|
| Client Service | `ElasticSearchClientServiceImpl` | Must be enabled |
| Index | `${generatetablefetch.tableName}` | Resolves to `encounters` |
| Index Operation | `index` | Replaces an existing document with the same ID |
| Identifier Attribute | `id` | Must match `EvaluateJsonPath` |
| Input Content Format | `Single JSON` | Required after `SplitJson` |
| Max FlowFiles Per Batch | `100` | Reduce while testing if desired |
| Max JSON Field String Length | `20 MB` | Increase only for known larger output |
| Retain Identifier Field | `true` | Keeps `id` in `_source` |
| Log Error Responses | `false` | Enable while diagnosing failures |
| Output Error Responses | `false` | Bundled default |

The `successful` and `original` relationships are auto-terminated. Route `retry` to its
funnel and `failure` plus `errors` to the general OpenSearch failure funnel.

## ✅ Pre-start validation

Before starting, confirm that all four controller services are enabled, all eight
processors are valid, the source query returns `cid`, `id`, and `binarydocument`, and
the OCR URL resolves from NiFi. Start with a small partition, then inspect HTTP response
attributes, provenance, bulletins, and every failure queue before processing the full
table.

## ▶️ Run and verify

Start the process group with a small source range first. Confirm that OCR responses
reach `CogStackParseCogStackServiceResult`, that split records have an `id` attribute,
and that the destination index count increases:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/encounters/_count'
```

The default flow writes OCR-enriched records to an index with the same name as the
source table. Change the target index before starting if source and enriched documents
must be kept separately.

## ⚠️ Failure handling

HTTP failures, parse failures, SQL failures, unmatched IDs, and OpenSearch errors are
routed to separate funnel queues. Inspect the response body and NiFi bulletin before
retrying. Clearing `GenerateTableFetch` state causes source rows to be submitted to OCR
again and should be done only deliberately.
