# ☁️ Azure Blob Parquet to OpenSearch

Template: `nifi/user_templates/azure_blobs_parquet_to_opensearch.json`

[View the flow definition on GitHub](https://github.com/CogStack/CogStack-NiFi/blob/main/nifi/user_templates/azure_blobs_parquet_to_opensearch.json)

## 🎯 Purpose

This flow lists blobs in an Azure Storage container, fetches Parquet blobs, converts
them to NDJSON, and writes their records to OpenSearch. The first path segment of each
blob name becomes the destination index.

## 🔗 Processor chain

```text
ListAzureBlobStorage_v12
  -> FetchAzureBlobStorage_v12
  -> RouteOnAttribute-parquetFiles
  -> ExecuteStreamCommand-ParquetToJson
  -> PutElasticsearchRecord
```

The list processor emits blob metadata, the fetch processor retrieves one blob per
FlowFile, and `RouteOnAttribute` accepts filenames ending in `.parquet`. The conversion
script reads the Parquet content from standard input and emits NDJSON to standard output.

## 📋 Bundled defaults

| Setting | Value |
|---|---|
| Azure endpoint suffix | `blob.core.windows.net` |
| Credential mode | Account key |
| Container name | `container_name` placeholder |
| Listing strategy | Timestamps |
| Polling schedule | `1 min` |
| Initial listing target | All blobs |
| Accepted filename suffix | `.parquet` |
| Conversion command | `python3.11 convert_record_parquet_to_json.py` |
| Script working directory | `/opt/nifi/user_scripts/processors/` |
| Target index | `${azure.blobname:substringBefore('/'):toLower()}` |
| Index operation | `create` |
| OpenSearch bulk batch size | `10000` |

The index expression expects blob names shaped like `<index>/<file>.parquet`. Review it
before processing root-level blobs or prefixes containing characters that are invalid in
OpenSearch index names.

## ✅ Requirements

- NiFi and OpenSearch are running and certificates are generated.
- The NiFi container can reach the Azure Storage endpoint.
- The Azure account, container, and selected authentication method allow blob listing
  and reads.
- The bundled Parquet conversion script and Python 3.11 are available in the NiFi image.
- Azure, OpenSearch, keystore, and truststore sensitive values are entered after import.

## ⚙️ Configure after import

1. In `AzureStorageCredentialsControllerService_v12-RIO_BLOBS`, enter the storage
   account name and account key, or select and configure another supported credential
   type. Do not place production secrets in the flow JSON.
2. Set the real container name on `ListAzureBlobStorage_v12`.
3. Keep its **Record Writer** unset. The flow expects one listed blob per FlowFile so
   `FetchAzureBlobStorage_v12` can use `${azure.container}` and `${azure.blobname}`.
4. Confirm the route expression and conversion command path.
5. Configure and enable the JSON reader/writer, SSL context, Azure credential service,
   and OpenSearch client.
6. Review the target-index expression and add a deterministic `ID Record Path` if the
   Parquet data has a stable unique key.

## ▶️ Run and verify

Start with a dedicated test prefix and a small Parquet blob. Verify the derived index,
then compare its count with the source file:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/<blob-prefix>/_count'
```

## ⚠️ State and failure handling

The list processor keeps timestamp-based state and is configured to include all blobs
on its initial listing. Test the scope before enabling it against a large container.
Resetting listing state can fetch old blobs again. Because the writer uses `create`
without a document ID, reprocessing can create duplicate logical records.

Fetch failures, conversion non-zero exits, OpenSearch failures, retries, and per-record
error responses are routed to funnel queues for inspection.
