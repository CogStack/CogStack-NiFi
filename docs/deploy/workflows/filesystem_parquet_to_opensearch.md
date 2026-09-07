# 📁 Filesystem Parquet to OpenSearch

Template: `nifi/user_templates/opensearch_ingest_parquet_form_fs_to_es.json`

[View the flow definition on GitHub](https://github.com/CogStack/CogStack-NiFi/blob/main/nifi/user_templates/opensearch_ingest_parquet_form_fs_to_es.json)

## 🎯 Purpose

This flow recursively discovers Parquet files in NiFi's `/data` directory, converts
each file to newline-delimited JSON (NDJSON), and writes its records to an OpenSearch
index derived from the filename.

The repository includes `data/demo/iris.parquet` as a ready-to-use example. The
standard Compose deployment mounts it in the NiFi container at
`/data/demo/iris.parquet`; it does not need to be copied into the container.

## 🗂️ Host and container paths

`GetFile` reads paths inside the NiFi container, not paths on the host:

```text
repository or host                       NiFi container
data/                                    /data/
└── demo/iris.parquet          ->        └── demo/iris.parquet
```

The mount is configured as `${NIFI_DATA_PATH:-../data/}:/data/` in the Compose
definition. With the default setting, paths therefore map as follows:

| Purpose | Host path, from the repository root | NiFi path |
|---|---|---|
| Bundled Iris demo | `data/demo/iris.parquet` | `/data/demo/iris.parquet` |
| Additional input | `data/<directory>/<file>.parquet` | `/data/<directory>/<file>.parquet` |

If `NIFI_DATA_PATH` is set, put input files in that host directory instead. Always
configure `GetFile` with the corresponding path below `/data`, never with the host
path.

## 🔗 Processor chain

```text
GetFile
  -> CogStackConvertParquetToJson
  -> PutElasticsearchRecord
```

The custom Python processor reads Parquet in batches of 10,000 records and emits one
compact JSON object per line. It adds `mime.type=application/x-ndjson` and a
`record.count` FlowFile attribute.

| Processor | What it does | Important output |
|---|---|---|
| `GetFile` | Finds matching files and creates one FlowFile per file. | Preserves `filename` and `path` attributes. |
| `CogStackConvertParquetToJson` | Converts every Parquet row to one NDJSON line. | Sets `record.count` and `mime.type`. |
| `PutElasticsearchRecord` | Infers the JSON schema and sends records through the OpenSearch bulk API. | Auto-terminates `successful` and `original`; routes failures and rejected records to funnels. |

## 📋 Bundled defaults

| Setting | Value |
|---|---|
| NiFi input directory | `/data/` |
| Host directory | `data/` by default through the Compose mount |
| Recursive scan | Enabled |
| File filter | `.*\.parquet` |
| Polling interval | `30 sec` |
| Files per poll | `10` |
| Keep source file | `true` |
| Target index | `${filename:substringBefore('.parquet'):toLower()}` |
| Index operation | `create` |
| OpenSearch bulk batch size | `10000` |

## ✅ Requirements

- NiFi and OpenSearch are running and their generated certificates are available.
- The NiFi Python environment includes `pyarrow`; the repository image installs the
  extension dependencies.
- Parquet files are readable by the NiFi container below `/data`.
- OpenSearch and SSL controller-service passwords are entered after import.

The standard deployment mounts `${NIFI_DATA_PATH:-../data/}` at `/data/`. With default
settings, place input files under the repository's `data/` directory.

## 📥 Import the flow

1. Open NiFi at `https://localhost:8443` and sign in.
2. Upload `nifi/user_templates/opensearch_ingest_parquet_form_fs_to_es.json` as a
   process group.
3. Enter the imported `fs_parquet_to_opensearch` process group.
4. Keep the process group stopped until all configuration below is complete. Exported
   NiFi flows intentionally omit sensitive property values, so the SSL and OpenSearch
   services are invalid immediately after import.

## 🎛️ Configure the controller services

Right-click an empty area inside the process group, select **Configure**, and open the
**Controller Services** tab. Configure services in the order below because the
OpenSearch client depends on the SSL context service.

| Controller service | Used by | Required? |
|---|---|---|
| `StandardSSLContextService` | `ElasticSearchClientServiceImpl` | Yes |
| `JsonTreeReader` | `PutElasticsearchRecord` | Yes |
| `JsonRecordSetWriter` | `PutElasticsearchRecord` result output | Yes |
| `ElasticSearchClientServiceImpl` | `PutElasticsearchRecord` | Yes |
| `AvroRecordSetWriter` | Nothing in this flow | No; leave disabled |

### 1. `StandardSSLContextService`

Select the service's **Configure** action, open **Properties**, and confirm or enter:

| Property | Standard OpenSearch deployment value |
|---|---|
| Keystore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-keystore.jks` |
| Keystore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Key Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Keystore Type | `PKCS12` |
| Truststore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-truststore.key` |
| Truststore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Truststore Type | `PKCS12` |
| TLS Protocol | `TLS` |

Read `ES_CERTIFICATE_PASSWORD` from
`security/env/certificates_elasticsearch.env`; do not copy its value into the flow JSON
or documentation. Use the exported `PKCS12` store types even though the filenames use
`.jks` and `.key` suffixes. Apply the changes, then enable the service.

If NiFi runs outside the standard Compose deployment, replace the filenames with paths
that exist inside that NiFi runtime and contain a client certificate trusted by the
target OpenSearch cluster.

### 2. `JsonTreeReader`

This service reads the converter's NDJSON output. Confirm these properties:

| Property | Value |
|---|---|
| Schema Access Strategy | `infer-schema` |
| Starting Field Strategy | `ROOT_NODE` |
| Schema Application Strategy | `SELECTED_PART` |
| Parsing Strategy | `STANDARD` |
| Max String Length | `20 MB` |

No schema registry or explicit schema is required. Leave the other exported properties
unchanged, apply the configuration, and enable the service.

### 3. `JsonRecordSetWriter`

This service serializes detailed results produced by `PutElasticsearchRecord`. Confirm:

| Property | Value |
|---|---|
| Schema Write Strategy | `no-schema` |
| Output Grouping | `output-array` |
| Schema Access Strategy | `inherit-record-schema` |
| Serialized JSON Input Handling | `ENABLED` |
| Pretty Print JSON | `false` |
| Suppress Null Values | `never-suppress` |
| Compression Format | `none` |

Leave the remaining exported properties unchanged, apply the configuration, and enable
the service.

### 4. `ElasticSearchClientServiceImpl`

Despite its NiFi component name, this client is used for the OpenSearch endpoint. Set:

| Property | Standard OpenSearch deployment value |
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

Read the username and password from `security/env/users_elasticsearch.env`. The hostname
`elasticsearch-1` is the Compose-network name and works from the NiFi container; use a
reachable hostname if NiFi is deployed elsewhere. Select the SSL service configured in
the previous step, apply the changes, and enable the client.

If the client cannot be enabled, first confirm that `StandardSSLContextService` is
enabled. Authentication and TLS connection failures can still appear only when the
processor sends its first request, so enabling the client is not by itself an end-to-end
connection test.

### 5. `AvroRecordSetWriter`

No processor property or connection in this flow references `AvroRecordSetWriter`.
Leave it disabled. It is safe to remove it from a locally imported copy of the flow, but
removal is not required.

## ⚙️ Configure each processor

Return to the process-group canvas. Open each processor's **Configure** action and use
the following settings.

### 1. `GetFile`

`GetFile` scans a directory inside the NiFi container and creates one FlowFile for each
matching file.

| Property | Bundled value | Iris demo value or guidance |
|---|---|---|
| Input Directory | `/data/` | `/data/demo` |
| File Filter | `.*\.parquet` | `iris\.parquet` |
| Recurse Subdirectories | `true` | May remain `true` |
| Ignore Hidden Files | `true` | Keep |
| Batch Size | `10` | Keep |
| Polling Interval | `30 sec` | Increase while performing a controlled test |
| Minimum File Age | `0 sec` | Keep, or increase if files are copied slowly |
| Minimum File Size | `0 B` | Keep |
| Keep Source File | `true` | Keep for the tracked Iris demo; see warning below |

The regular expression is matched against the filename. The `success` relationship must
remain connected to `CogStackConvertParquetToJson`.

For a one-time production ingest, setting **Keep Source File** to `false` lets `GetFile`
remove each source after reading it. Only use that setting for disposable inputs and
ensure NiFi has permission to delete them. For retained source files, use a stateful
`ListFile`/`FetchFile` design or archive processed files; `GetFile` with **Keep Source
File** set to `true` reads the same files again at every poll.

### 2. `CogStackConvertParquetToJson`

The custom processor has no user-configurable properties. Confirm that:

1. The processor type is `CogStackConvertParquetToJson` from the
   `org.apache.nifi:python-extensions:0.0.1` bundle.
2. NiFi shows the processor as valid. If the type is unavailable, verify that
   `nifi/user_python_extensions` is mounted at
   `/opt/nifi/nifi-current/python_extensions` and restart NiFi after correcting it.
3. The `success` relationship is connected to `PutElasticsearchRecord`.
4. The `failure` relationship is connected to its failure funnel.

The processor converts the complete Parquet FlowFile to NDJSON in batches of 10,000,
copies the incoming attributes, and adds `mime.type=application/x-ndjson` and
`record.count=<converted-row-count>`.

### 3. `PutElasticsearchRecord`

This processor parses the NDJSON records and sends them to OpenSearch through the bulk
API. Confirm:

| Property | Bundled value | Guidance |
|---|---|---|
| Client Service | `ElasticSearchClientServiceImpl` | Must be enabled |
| Record Reader | `JsonTreeReader` | Must be enabled |
| Result Record Writer | `JsonRecordSetWriter` | Must be enabled |
| Index | `${filename:substringBefore('.parquet'):toLower()}` | `iris.parquet` becomes `iris` |
| Index Operation | `create` | Review before allowing reprocessing |
| ID Record Path | Empty | Set a stable record path when one exists |
| Batch Size | `10000` | Keep unless cluster sizing requires tuning |
| Max JSON Field String Length | `20 MB` | Increase only for known larger fields |
| Log Error Responses | `true` | Keep while commissioning the flow |
| Output Error Responses | `true` | Keep so rejected records can be inspected |
| Treat Not Found as Success | `true` | Bundled default; mainly affects delete operations |

Files with the same filename in different subdirectories resolve to the same index. The
Iris data has no dedicated ID field, so the bundled blank **ID Record Path** makes
OpenSearch generate an ID for every record. Reprocessing therefore creates duplicates.

Confirm the relationships as well:

| Relationship | Handling in the bundled flow |
|---|---|
| `successful` | Auto-terminated |
| `original` | Auto-terminated |
| `failure`, `retry`, `errors` | Routed to the general failure funnel |
| `error_responses` | Routed to a separate funnel for record-level responses |

Do not auto-terminate the error relationships merely to make the processor valid; the
funnel queues provide the information needed to diagnose rejected records.

## ✅ Pre-start validation

Before starting the process group, confirm that:

- `StandardSSLContextService`, `JsonTreeReader`, `JsonRecordSetWriter`, and
  `ElasticSearchClientServiceImpl` show **Enabled**.
- All three processors are valid and have no warning icon.
- `GetFile` points at the intended container directory and its filter matches only the
  files to ingest.
- The destination-index expression, operation, and document-ID strategy are appropriate
  for reprocessing.
- Every failure funnel queue is empty or contains only failures that have already been
  investigated.

Start the process group only after every check passes. After the first file is processed,
inspect processor bulletins, provenance, and all failure queues before treating the
destination count as complete.

## 🌸 Run the bundled Iris example

The bundled `/data/demo/iris.parquet` file contains 150 rows with these fields:
`sepal.length`, `sepal.width`, `petal.length`, `petal.width`, and `variety`. Because the
index expression uses the filename without `.parquet`, the flow writes it to the `iris`
index.

1. Start NiFi and OpenSearch using the commands in the
   [workflow overview](../workflows.md#prepare-and-import-a-flow).
2. Import the flow definition and complete the controller-service configuration above.
3. On `GetFile`, use **Input Directory** `/data/demo` and **File Filter**
   `iris\.parquet`. Leave **Keep Source File** set to `true` so the tracked demo file is
   not deleted.
4. To avoid a second scan while testing, increase **Polling Interval** from `30 sec`,
   start the process group, and stop it as soon as the queues drain.
5. Open the converted FlowFile in NiFi provenance, or inspect its attributes, and confirm
   `record.count=150`.
6. Query OpenSearch from the repository root:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/iris/_count'
```

On a new `iris` index after one pass, the response should report `"count":150`. If the
index already existed or the source was polled more than once, the count can be a
multiple of 150 because the bundled writer generates a new document ID for every row.

To inspect a few records and the inferred field mapping:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/iris/_search?size=3&pretty'

curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/iris/_mapping?pretty'
```

## ▶️ Run with your own files

Place Parquet files anywhere below the host `data/` directory, or below the directory
selected with `NIFI_DATA_PATH`. Confirm that they appear below `/data` in NiFi, scope
the `GetFile` input directory and filter, and start the process group. For each file,
compare the source row count with the converter's `record.count` attribute and the
destination index count.

## ⚠️ Reprocessing and failures

The bundled **Keep Source File** value is `true`, so `GetFile` continually reprocesses
the same files. The writer also uses `create` without a configured document ID, causing
OpenSearch to generate new IDs and duplicate logical records. Change the retention
behavior before starting the flow unless repeated test ingestion is intentional. Do not
set **Keep Source File** to `false` while reading the repository's tracked
`/data/demo/iris.parquet` directly: the `/data` mount is read/write, so NiFi would delete
`data/demo/iris.parquet` on the host. Use a disposable copy for that mode.

See the
[Apache NiFi `GetFile` documentation](https://nifi.apache.org/components/org.apache.nifi.processors.standard.GetFile/)
for the processor's source-file behavior. Conversion and OpenSearch failures are routed
to funnels; the writer also exposes detailed `error_responses` for rejected records.
Inspect those queues, processor bulletins, and provenance when the source row count and
indexed count do not match.
