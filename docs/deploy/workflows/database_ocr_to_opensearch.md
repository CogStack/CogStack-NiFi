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

## ⚙️ Configure after import

1. Configure and enable `DBCPConnectionPool` for the source database.
2. Update `GenerateTableFetch-encounters` when the source table or incremental column
   differs from `encounters.cid`.
3. Set `CogStackPrepareRecordForOcr` properties to the actual source fields:

   | Property | Bundled value |
   |---|---|
   | `process_flow_file_type` | `avro` |
   | `binary_field_name` | `binarydocument` |
   | `document_id_field_name` | `id` |
   | `output_text_field_name` | `text` |
   | `operation_mode` | `base64` |

4. Verify the `InvokeHTTP` URL. For the text-extraction-only container on the same
   Docker network, use `http://ocr-service-text-only:8090/api/process`.
5. Keep **Request Body Enabled** set to `true`; the processor sends JSON rather than a
   raw binary body.
6. Configure the SSL context and OpenSearch client passwords, hosts, and certificate
   paths. Verify that `EvaluateJsonPath` extracts the same ID field used by
   `PutElasticsearchJson`.

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
