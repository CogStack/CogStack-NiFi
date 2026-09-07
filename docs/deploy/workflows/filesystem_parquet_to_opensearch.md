# 📁 Filesystem Parquet to OpenSearch

Template: `nifi/user_templates/opensearch_ingest_parquet_form_fs_to_es.json`

[View the flow definition on GitHub](https://github.com/CogStack/CogStack-NiFi/blob/main/nifi/user_templates/opensearch_ingest_parquet_form_fs_to_es.json)

## 🎯 Purpose

This flow recursively discovers Parquet files in NiFi's `/data` directory, converts
each file to newline-delimited JSON (NDJSON), and writes its records to an OpenSearch
index derived from the filename.

## 🔗 Processor chain

```text
GetFile
  -> CogStackConvertParquetToJson
  -> PutElasticsearchRecord
```

The custom Python processor reads Parquet in batches of 10,000 records and emits one
compact JSON object per line. It adds `mime.type=application/x-ndjson` and a
`record.count` FlowFile attribute.

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

1. Confirm the `GetFile` input directory and file filter. Use a mounted path; a host path
   that is not visible inside the container will not work.
2. Set **Keep Source File** to `false` for one-time ingestion and ensure NiFi can delete
   the source file. When it is `true`, `GetFile` picks up the same file continually; use
   a `ListFile`/`FetchFile` pattern or another archival strategy if files must remain.
3. Configure the SSL context and `ElasticSearchClientServiceImpl` credentials and
   certificate passwords.
4. Review the index expression. `example.parquet` becomes index `example`. Files with
   the same name in different subdirectories target the same index.
5. Add an `ID Record Path` or another deterministic ID strategy when the source contains
   a stable key and safe reprocessing is required.

## ▶️ Run and verify

Copy a small Parquet file into `data/`, start the process group, and verify that
`record.count` matches the number of indexed rows:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/<filename-without-parquet>/_count'
```

## ⚠️ Reprocessing and failures

The bundled **Keep Source File** value is `true`, so `GetFile` continually reprocesses
the same files. The writer also uses `create` without a configured document ID, causing
OpenSearch to generate new IDs and duplicate logical records. Change the retention
behavior before starting the flow unless repeated test ingestion is intentional.

See the
[Apache NiFi `GetFile` documentation](https://nifi.apache.org/components/org.apache.nifi.processors.standard.GetFile/)
for the processor's source-file behavior. Conversion and OpenSearch failures are routed
to funnels; the writer also exposes detailed `error_responses` for rejected records.
