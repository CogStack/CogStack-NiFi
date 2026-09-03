# 🗄️ Database documents to OpenSearch

Template: `nifi/user_templates/opensearch_ingest_docs_db_to_es.json`

[View the flow definition on GitHub](https://github.com/CogStack/CogStack-NiFi/blob/main/nifi/user_templates/opensearch_ingest_docs_db_to_es.json)

## 🎯 Purpose

This flow incrementally reads text documents from a PostgreSQL table and indexes each
record in OpenSearch. The bundled configuration targets the sample
`medical_reports_text` table and uses `docid` as the stable document identifier.

## 🔗 Processor chain

```text
GenerateTableFetch-medical_reports_text
  -> ExecuteSQLRecord
  -> PutElasticsearchRecord
```

- `GenerateTableFetch` creates paginated SQL queries and tracks the maximum `docid` it
  has seen.
- `ExecuteSQLRecord` executes each query and writes embedded-schema Avro.
- `PutElasticsearchRecord` reads the Avro records and indexes them using `/docid` as
  the OpenSearch document ID.

Failure and retry relationships are routed to funnels for inspection.

## 📋 Bundled defaults

| Setting | Value |
|---|---|
| Database URL | `jdbc:postgresql://samples-db:5432/db_samples` |
| Database user | `test` |
| JDBC driver | `/opt/nifi/drivers/postgresql-42.7.7.jar` |
| Source table | `medical_reports_text` |
| Incremental/partition column | `docid` |
| Partition size | `10000` |
| Returned columns | `sampleid`, `typeid`, `dct`, `filename`, `document`, and `docid` cast to text |
| OpenSearch endpoint | `https://elasticsearch-1:9200` |
| Target index | `${generatetablefetch.tableName}` (`medical_reports_text` by default) |
| Index operation | `index` |
| Document ID | `/docid` |
| Bulk batch size | `10000` |

## ✅ Requirements

- The core stack is running; for the bundled sample database use
  `make -C deploy start-data-infra`.
- The source table has a numeric, indexed, monotonically increasing maximum-value
  column. The sample schema provides integer primary key `docid`.
- OpenSearch certificates exist and are mounted into NiFi.
- Database and OpenSearch credentials are available. Sensitive passwords are not
  included in the exported JSON.

## ⚙️ Configure after import

1. In `DBCPConnectionPool`, verify the JDBC URL, driver class, driver location, user,
   and password. The bundled local values correspond to `security/env/users_database.env`.
2. In `GenerateTableFetch`, change the table name, returned columns, partition column,
   and maximum-value column when using another schema.
3. In `PutElasticsearchRecord`, verify the target index and set `ID Record Path` to the
   unique source field, including the leading `/` required by RecordPath.
4. In `StandardSSLContextService`, enter the keystore, key, and truststore passwords and
   confirm that the mounted files match the selected search backend.
5. In `ElasticSearchClientServiceImpl`, set the correct hosts and credentials, then
   enable every controller service.

`Use Avro Logical Types` is enabled. If a target mapping rejects dates or timestamps,
adjust the record conversion and OpenSearch mapping deliberately rather than disabling
logical types without checking the resulting JSON.

## ▶️ Run and verify

Start the process group and watch the queues between all three processors. The default
target is `medical_reports_text`:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/medical_reports_text/_count'
```

Because the flow uses `docid` and the `index` operation, processing the same source row
again replaces the document with that ID instead of creating another generated ID.

## ⚠️ State and recovery

`GenerateTableFetch` stores incremental state. Clear its state only when intentionally
re-reading older rows. Before doing so, confirm that the target document ID is stable and
that re-indexing is safe. Check the failure funnels and NiFi bulletins before advancing
or discarding queued FlowFiles.
