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

## ⚙️ Configure after import

1. Keep the imported process group stopped while configuring it.
2. Confirm the `GetFile` input directory and file filter. Use a mounted path; a host path
   that is not visible inside the container will not work. For the bundled demo, narrow
   these to `/data/demo` and `iris\.parquet` so unrelated files below `/data` are not
   ingested.
3. Configure `StandardSSLContextService`. The certificate filenames are included in the
   template, but the keystore and truststore passwords are intentionally omitted from
   exported flows. For the standard deployment they use `ES_CERTIFICATE_PASSWORD` from
   `security/env/certificates_elasticsearch.env`.
4. Configure `ElasticSearchClientServiceImpl`. Confirm the bundled endpoint
   `https://elasticsearch-1:9200`, then enter the OpenSearch username and password from
   `security/env/users_elasticsearch.env`.
5. Enable `StandardSSLContextService`, `JsonTreeReader`, `JsonRecordSetWriter`, and
   `ElasticSearchClientServiceImpl`. The unused `AvroRecordSetWriter` does not need to
   be enabled.
6. Review the index expression. `example.parquet` becomes index `example`. Files with
   the same name in different subdirectories target the same index.
7. Decide how source files and retries should be handled before starting the group:
   leave **Keep Source File** set to `true` only for a controlled test, or use a disposable
   copy and set it to `false` for one-time ingestion. For production, prefer a
   `ListFile`/`FetchFile` pattern or move successfully processed files to an archive.
8. Add an `ID Record Path` or another deterministic ID strategy when the source contains
   a stable key and safe reprocessing is required.

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
