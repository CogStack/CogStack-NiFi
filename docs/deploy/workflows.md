# 🔀 Workflows

This section documents every maintained NiFi 2.x flow definition in
`nifi/user_templates/`. Files below `nifi/user_templates/legacy/` are historical and
are not covered.

## 📚 Maintained flow definitions

| Flow definition | Source | Destination | Additional service |
|---|---|---|---|
| [Database documents to OpenSearch](workflows/database_to_opensearch.md) | PostgreSQL table | OpenSearch index | None |
| [Database documents via OCR](workflows/database_ocr_to_opensearch.md) | PostgreSQL binary-document table | OpenSearch index | OCR service |
| [MedCAT annotations to OpenSearch](workflows/medcat_annotations_to_opensearch.md) | Existing OpenSearch index | Annotation index | MedCAT service |
| [Filesystem Parquet to OpenSearch](workflows/filesystem_parquet_to_opensearch.md) | Parquet files under `/data` | Index per filename | None |
| [Azure Blob Parquet to OpenSearch](workflows/azure_blob_parquet_to_opensearch.md) | Azure Blob Storage | Index per blob prefix | Azure Storage |

## 🚀 Prepare and import a flow

From the repository root, initialize certificates and start the core data services:

```bash
make -C deploy init-security
make -C deploy start-data-infra
```

Then open NiFi at `https://localhost:8443`. Keep the imported process group stopped
while configuring it. Use NiFi's **Upload Process Group** or flow-definition import
action and select the JSON file named by the relevant guide.

Most bundled standard processors and controller services target NiFi 2.10.0; the Azure
Blob flow contains Azure components from NiFi 2.7.2. The definitions include processor
and controller-service settings, but they do not contain parameter contexts and NiFi
omits sensitive property values from exports. Review component compatibility when
importing them into another NiFi version.

## 🔐 Post-import configuration

Before starting an imported flow:

1. Open the process group's **Controller Services** configuration.
2. Enter all required sensitive values. Depending on the flow, these include database,
   OpenSearch, keystore, truststore, or Azure Storage credentials.
3. Confirm that service URLs, database tables, field names, certificate paths, and
   target index names match the deployment.
4. Enable the record readers/writers, SSL context, database pool, storage credentials,
   and OpenSearch client used by the flow.
5. Resolve every validation error, then start the process group.

The bundled URLs and credentials are local-development defaults. Use deployment-specific
values in production. Failure, retry, and error relationships terminate at funnels in
these examples; inspect their queues instead of assuming failed FlowFiles were discarded.

## 🔎 Verify OpenSearch output

Check the expected index in OpenSearch Dashboards or query its count endpoint. For the
default local OpenSearch deployment:

```bash
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u '<user>:<password>' \
  'https://localhost:9200/<index>/_count'
```

Use the target index documented for the selected flow. A successful HTTP response does
not prove that every FlowFile succeeded, so also inspect NiFi bulletins, provenance, and
the queues connected to failure funnels.

## 🗜️ Cerner blob decompression

Use `CogStackJsonRecordDecompressCernerBlob` when source documents are stored as Cerner
blob fragments, with one database row per blob sequence. The processor expects one
FlowFile to contain all blob rows for a single document, then sorts the fragments by
sequence number, validates the sequence, concatenates the binary payload, and extracts
or decompresses the embedded document bytes.

### 🔗 Recommended processor chain

```text
Fetch document IDs
  -> ExecuteSQLRecord, one query per document ID
  -> CogStackJsonRecordDecompressCernerBlob
  -> downstream OCR / indexing processor
```

The important boundary is one FlowFile per document. `GenerateTableFetch` and similar
table-range processors split work by row ranges; they do not automatically guarantee
that every blob sequence for a document remains in the same FlowFile. For Cerner blob
rows, prefer a document-ID driven query where each `ExecuteSQLRecord` invocation fetches
all sequences for one document.

### 🧾 Example SQL shape

```sql
SELECT
    CAST(docid AS VARCHAR) AS id,
    blob_sequence_num,
    binarydoc
FROM cerner_blob_table
WHERE docid = ?
ORDER BY blob_sequence_num
```

### ⚙️ `ExecuteSQLRecord` settings

- Set `Max Rows Per FlowFile` to `0`.
- Set `Output Batch Size` to `0`.
- Use a JSON record writer that emits a JSON array. The processor reads JSON FlowFile
  content, not Avro container bytes.
- Keep `Fetch Size` tuned for database performance only; it should not be used as a
  FlowFile grouping mechanism.
- If the SQL comes from the incoming FlowFile content, leave `SQL Query` empty. If the
  SQL is configured on the processor, pass the document ID as a prepared-statement
  argument, for example with `sql.args.1.type` and `sql.args.1.value` attributes.

### 📥 Required input fields

Input records must include these fields unless you override the processor properties:

| Field | Default property | Required behavior |
|---|---|---|
| Document ID | `document_id_field_name=id` | Present, non-empty, and identical for every record in the FlowFile. |
| Blob sequence | `blob_sequence_order_field_name=blob_sequence_num` | Present, integer-like, unique by default, contiguous, and starting at `0` or `1`. |
| Blob payload | `binary_field_name=binarydoc` | Present and non-empty. With the default `binary_field_source_encoding=base64`, this must be a base64 string. |

### 🛠️ Recommended processor properties

| Property | Recommended value | Notes |
|---|---|---|
| `binary_field_name` | `binarydoc` | Change only if your SQL aliases the blob column differently. |
| `document_id_field_name` | `id` | Alias the SQL document ID to match this, or change the property. |
| `blob_sequence_order_field_name` | `blob_sequence_num` | The processor uses this for reassembly order. |
| `blob_sequence_order_resolve_duplicate_policy` | `fail` | Keep the default unless the source system has a known duplicate-row convention. |
| `binary_field_source_encoding` | `base64` | Recommended for JSON FlowFiles. |
| `output_mode` | `base64` | Recommended for JSON output and downstream processors. |

### ⚠️ Failure routing

The processor routes to `failure` when it detects unsafe input, including:

- missing document ID, blob sequence, or blob payload fields;
- multiple document IDs in one FlowFile;
- duplicate sequence numbers when the duplicate policy is `fail`;
- sequence gaps such as `[1, 3]` or a missing leading sequence such as `[2, 3]`;
- invalid base64 payloads;
- payloads that cannot be extracted as embedded PDF/RTF bytes or decoded as Cerner LZW.

### ✅ Successful output

On success, the output is a JSON array containing one merged record. Non-binary fields
are copied from the first input record, and the blob field contains the decompressed or
extracted document bytes encoded according to `output_mode`. Useful FlowFile attributes
include `document_id`, `blob_parts`, `blob_sequence`, `blob_seq_min`, `blob_seq_max`,
`compressed_len`, `blob_payload_source`, and `is_lzw_compressed`.
