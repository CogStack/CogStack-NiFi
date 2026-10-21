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

## 📥 Import the flow

1. Open NiFi at `https://localhost:8443` and upload
   `nifi/user_templates/azure_blobs_parquet_to_opensearch.json` as a process group.
2. Enter `azure_blobs_parquet_to_opensearch` and keep it stopped.
3. Right-click an empty area, select **Configure**, and open **Controller Services**.

The export contains no Azure account name, account key, OpenSearch password, or
certificate-store passwords. Add these sensitive values only in NiFi or through a
deployment-specific secret mechanism, never in the committed JSON.

## 🎛️ Configure the controller services

| Controller service | Used by |
|---|---|
| `AzureStorageCredentialsControllerService_v12-RIO_BLOBS` | Azure list and fetch processors |
| `JsonTreeReader` | `PutElasticsearchRecord` |
| `JsonRecordSetWriter` | `PutElasticsearchRecord` result output |
| `StandardSSLContextService` | `ElasticSearchClientServiceImpl` |
| `ElasticSearchClientServiceImpl` | `PutElasticsearchRecord` |

### 1. `AzureStorageCredentialsControllerService_v12-RIO_BLOBS`

The bundled flow uses an Azure Storage account key:

| Property | Value |
|---|---|
| Credentials Type | `ACCOUNT_KEY` |
| Storage Account Name | Your Azure Storage account name |
| Account Key | The key for that account |
| Endpoint Suffix | `blob.core.windows.net` |
| Proxy Configuration Service | Empty unless the deployment requires a proxy |

Apply and enable the service. If changing **Credentials Type**, populate only the fields
required by the selected mode, such as a SAS token, managed identity client ID, or
service-principal tenant, client ID, and client secret. Confirm that both list and fetch
processors still reference this service.

### 2. `JsonTreeReader`

| Property | Value |
|---|---|
| Schema Access Strategy | `infer-schema` |
| Starting Field Strategy | `ROOT_NODE` |
| Schema Application Strategy | `SELECTED_PART` |
| Max String Length | `20 MB` |
| Allow Comments | `false` |

No schema registry or explicit schema is required. Apply and enable the service.

### 3. `JsonRecordSetWriter`

| Property | Value |
|---|---|
| Schema Access Strategy | `inherit-record-schema` |
| Schema Write Strategy | `no-schema` |
| Output Grouping | `output-array` |
| Pretty Print JSON | `false` |
| Suppress Null Values | `never-suppress` |
| Compression Format | `none` |

Apply and enable the service.

### 4. `StandardSSLContextService`

| Property | Bundled value |
|---|---|
| Keystore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-keystore.jks` |
| Keystore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Key Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Keystore Type | `PKCS12` |
| Truststore Filename | `/security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1-truststore.key` |
| Truststore Password | Value of `ES_CERTIFICATE_PASSWORD` |
| Truststore Type | `PKCS12` |
| TLS Protocol | `TLS` |

Read the password from `security/env/certificates_elasticsearch.env`. Use the exported
store types even though the filenames have `.jks` and `.key` suffixes. Apply and enable
the service.

### 5. `ElasticSearchClientServiceImpl`

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

Read credentials from `security/env/users_elasticsearch.env`. The bundled hostname is
reachable on the Compose network; change it if NiFi uses another route to OpenSearch.
Apply and enable the client after enabling the SSL service.

## ⚙️ Configure each processor

Return to the process-group canvas and configure the processors in flow order.

### 1. `ListAzureBlobStorage_v12`

| Property | Bundled value | Guidance |
|---|---|---|
| Storage Credentials | `AzureStorageCredentialsControllerService_v12-RIO_BLOBS` | Must be enabled |
| Container Name | `container_name` | Replace this placeholder |
| Blob Name Prefix | Empty | Set a narrow test prefix before the first run |
| Listing Strategy | `timestamps` | Stores listing state |
| Entity Tracking Initial Listing Target | `all` | First run includes existing blobs |
| Entity Tracking Time Window | `3 hours` | Bundled state window |
| Record Writer | Empty | Keep empty so each blob produces one FlowFile |
| Minimum File Age | `0 sec` | Increase if uploads may still be in progress |
| Minimum File Size | `0 B` | Keep or set an intentional lower bound |

The processor runs every `1 min` on the NiFi primary node. Connect `success` to
`FetchAzureBlobStorage_v12`. Test the container and prefix carefully because the initial
listing includes all matching historical blobs. Clearing processor state causes old
blobs to be listed again.

### 2. `FetchAzureBlobStorage_v12`

| Property | Bundled value |
|---|---|
| Storage Credentials | `AzureStorageCredentialsControllerService_v12-RIO_BLOBS` |
| Container Name | `${azure.container}` |
| Blob Name | `${azure.blobname}` |
| Client-Side Encryption Key Type | `NONE` |

The expressions consume attributes created by the list processor; do not replace them
with fixed names unless the upstream design is also changed. Connect `success` to
`RouteOnAttribute-parquetFiles` and `failure` to its funnel.

### 3. `RouteOnAttribute-parquetFiles`

| Property | Bundled value |
|---|---|
| Routing Strategy | `Route to 'match' if all match` |
| Dynamic property `filename` | `${filename:endsWith(".parquet")}` |

The suffix match is case-sensitive. Connect `matched` to
`ExecuteStreamCommand-ParquetToJson`; `unmatched` is auto-terminated. Change the
expression if uppercase extensions should also be accepted.

### 4. `ExecuteStreamCommand-ParquetToJson`

| Property | Bundled value | Guidance |
|---|---|---|
| Command Path | `python3.11` | Must exist inside NiFi |
| Working Directory | `/opt/nifi/user_scripts/processors/` | Contains the conversion script |
| Command Arguments Strategy | `Command Arguments Property` | Keep |
| Command Arguments | `convert_record_parquet_to_json.py` | Bundled script |
| Argument Delimiter | `;` | Keep |
| Ignore STDIN | `false` | Sends Parquet bytes to the script |
| Output MIME Type | `application/x-ndjson` | Required by the JSON reader |
| Max Attribute Length | `256` | Bundled default |

Connect `output stream` to `PutElasticsearchRecord` and `nonzero status` to its failure
funnel; `original` is auto-terminated. A non-zero result commonly means that Python,
`pyarrow`, the working directory, or the script is unavailable inside NiFi, or that the
blob is not valid Parquet.

### 5. `PutElasticsearchRecord`

| Property | Bundled value | Guidance |
|---|---|---|
| Client Service | `ElasticSearchClientServiceImpl` | Must be enabled |
| Record Reader | `JsonTreeReader` | Must be enabled |
| Result Record Writer | `JsonRecordSetWriter` | Must be enabled |
| Index | `${azure.blobname:substringBefore('/'):toLower()}` | Uses the first path segment |
| Index Operation | `create` | Reprocessing generates duplicate logical rows |
| ID Record Path | Empty | Set when Parquet contains a stable key |
| Batch Size | `10000` | Bundled bulk size |
| Max JSON Field String Length | `20 MB` | Increase only for known larger fields |
| Log Error Responses | `true` | Keep while commissioning the flow |
| Output Error Responses | `true` | Emits record-level rejection details |

The index expression expects `<index>/<file>.parquet`; root-level blob names contain no
`/` and therefore need a different expression. The `successful` and `original`
relationships are auto-terminated. Route `failure`, `retry`, and `errors` to the general
funnel and `error_responses` to its dedicated funnel.

## ✅ Pre-start validation

Before starting, confirm that all five controller services are enabled, all five
processors are valid, the Azure container and optional prefix are correct, and a small
matching blob produces a valid OpenSearch index name. Confirm that Python 3.11 and the
conversion script exist inside NiFi. Start with a dedicated test prefix, then inspect
state, provenance, bulletins, and every failure queue before widening the listing scope.

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
