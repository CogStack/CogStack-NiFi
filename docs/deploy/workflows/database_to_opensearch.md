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

## 📥 Import the flow

1. Open NiFi at `https://localhost:8443` and upload
   `nifi/user_templates/opensearch_ingest_docs_db_to_es.json` as a process group.
2. Enter `opensearch_ingest_docs_db_to_es` and keep it stopped while configuring it.
3. Right-click an empty area, select **Configure**, and open **Controller Services**.

Sensitive passwords are omitted from exported NiFi flows, so the database, SSL, and
OpenSearch services require configuration after every fresh import.

## 🎛️ Configure the controller services

Configure and enable the services in this order:

| Controller service | Used by |
|---|---|
| `DBCPConnectionPool` | `GenerateTableFetch-medical_reports_text`, `ExecuteSQLRecord` |
| `AvroRecordSetWriter` | `ExecuteSQLRecord` |
| `AvroReader` | `PutElasticsearchRecord` |
| `JsonRecordSetWriter` | `PutElasticsearchRecord` result output |
| `StandardSSLContextService` | `ElasticSearchClientServiceImpl` |
| `ElasticSearchClientServiceImpl` | `PutElasticsearchRecord` |

### 1. `DBCPConnectionPool`

Configure the sample PostgreSQL connection as follows:

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

Read the sensitive value from `security/env/users_database.env`; do not store it in the
flow JSON. If using another database, update the URL, driver class, driver JAR, and
credentials together. Apply the configuration and enable the service. A driver error
usually means the JAR path does not exist inside the NiFi container.

### 2. `AvroRecordSetWriter`

This service writes the rows returned by `ExecuteSQLRecord`:

| Property | Value |
|---|---|
| Schema Access Strategy | `inherit-record-schema` |
| Schema Write Strategy | `avro-embedded` |
| Compression Format | `NONE` |
| Encoder Pool Size | `32` |
| Cache Size | `1000` |

Leave the other exported properties unchanged, apply, and enable the service.

### 3. `AvroReader`

This service reads the embedded-schema Avro produced by the preceding writer:

| Property | Value |
|---|---|
| Schema Access Strategy | `embedded-avro-schema` |
| Fast Reader Enabled | `true` |
| Cache Size | `1000` |

No schema registry is required. Apply and enable the service.

### 4. `JsonRecordSetWriter`

This writer is selected as the result writer on `PutElasticsearchRecord`:

| Property | Value |
|---|---|
| Schema Access Strategy | `inherit-record-schema` |
| Schema Write Strategy | `no-schema` |
| Output Grouping | `output-array` |
| Serialized JSON Input Handling | `ENABLED` |
| Pretty Print JSON | `false` |
| Suppress Null Values | `never-suppress` |
| Compression Format | `none` |

Apply and enable the service.

### 5. `StandardSSLContextService`

Configure the certificate stores mounted by the standard Compose deployment:

| Property | Bundled value |
|---|---|
| Keystore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-keystore.jks` |
| Keystore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Key Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Keystore Type | `JKS` |
| Truststore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-truststore.key` |
| Truststore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Truststore Type | `PKCS12` |
| TLS Protocol | `TLS` |

Read `ES_CERTIFICATE_PASSWORD` from
`security/env/certificates_elasticsearch.env`. Use paths and store types matching the
actual mounted files when deploying outside the standard stack. Apply and enable the
service.

### 6. `ElasticSearchClientServiceImpl`

Configure the OpenSearch client after the SSL service is enabled:

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

Read the credentials from `security/env/users_elasticsearch.env`. The
`elasticsearch-1` hostname is reachable on the Compose network; use a reachable host
when NiFi runs elsewhere. Apply and enable the service.

## ⚙️ Configure each processor

Return to the process-group canvas and configure the processors in flow order.

### 1. `GenerateTableFetch-medical_reports_text`

| Property | Bundled value | Guidance |
|---|---|---|
| Database Connection Pooling Service | `DBCPConnectionPool` | Must be enabled |
| Database Type | `PostgreSQL` | Match the source database |
| Table Name | `medical_reports_text` | Change for another source table |
| Columns to Return | `sampleid,typeid,dct,filename,"document",CAST(docid AS VARCHAR(255)) AS docid` | Preserve a string `docid` for indexing |
| Maximum-value Columns | `docid` | Must be numeric and monotonically increasing |
| Column for Value Partitioning | `docid` | Should be indexed by the database |
| Partition Size | `10000` | Reduce for wider records or a small test |
| Output Empty FlowFile on Zero Results | `false` | Keep |

The processor emits SQL statements rather than database rows. Its `success` relationship
must connect to `ExecuteSQLRecord`; `failure` must connect to its funnel. It stores the
largest observed `docid` as state. Clear state only when intentionally re-reading rows.

### 2. `ExecuteSQLRecord`

| Property | Bundled value | Guidance |
|---|---|---|
| Database Connection Pooling Service | `DBCPConnectionPool` | Must be enabled |
| Record Writer | `AvroRecordSetWriter` | Must be enabled |
| Max Rows Per FlowFile | `0` | Do not split a generated partition |
| Output Batch Size | `0` | Keep |
| Fetch Size | `0` | Driver default |
| Use Avro Logical Types | `true` | Preserves date/time semantics |
| Set Auto Commit | `true` | Bundled default |

Leave **SQL Query** empty: the processor receives each generated query in the incoming
FlowFile content. Connect `success` to `PutElasticsearchRecord` and `failure` to its
funnel.

If a target mapping rejects dates or timestamps, adjust the conversion and OpenSearch
mapping deliberately rather than disabling logical types without checking the resulting
JSON representation.

### 3. `PutElasticsearchRecord`

| Property | Bundled value | Guidance |
|---|---|---|
| Client Service | `ElasticSearchClientServiceImpl` | Must be enabled |
| Record Reader | `AvroReader` | Must be enabled |
| Result Record Writer | `JsonRecordSetWriter` | Must be enabled |
| Index | `${generatetablefetch.tableName}` | Resolves to `medical_reports_text` |
| Index Operation | `index` | Replaces a document with the same ID |
| ID Record Path | `/docid` | Leading `/` is required by RecordPath |
| Retain Record Path ID Field | `false` | Removes `docid` from `_source` after using it |
| Batch Size | `10000` | Keep unless cluster sizing requires tuning |
| Max JSON Field String Length | `64 MB` | Covers large clinical text fields |
| Log Error Responses | `false` | Enable while diagnosing rejected records |
| Output Error Responses | `false` | Bundled flow does not emit record-level responses |

The `successful` and `original` relationships are auto-terminated. `retry` is routed to
one funnel, while `failure` and `errors` are routed to another. Keep those queues for
diagnosis.

## ✅ Pre-start validation

Before starting the process group, confirm that all six controller services show
**Enabled**, all three processors are valid, and the table, columns, partitioning key,
index, and `/docid` RecordPath match the source schema. Start with a reduced partition
size or test table, then inspect bulletins and every failure queue before processing the
full source.

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
