# Workflows

This page contains current workflow guidance for NiFi 2.x based deployments.
Historical walkthroughs and older template notes are kept separately in
[legacy workflows](workflows_legacy.md).

Template locations:

- `nifi/user_templates/` for current templates (JSON).
- `nifi/user_templates/legacy/` for older templates (XML/reference).

## Cerner blob decompression

Use `CogStackJsonRecordDecompressCernerBlob` when source documents are stored as Cerner
blob fragments, with one database row per blob sequence. The processor expects one
FlowFile to contain all blob rows for a single document, then sorts the fragments by
sequence number, validates the sequence, concatenates the binary payload, and extracts
or decompresses the embedded document bytes.

Recommended processor chain:

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

Example SQL shape:

```sql
SELECT
    CAST(docid AS VARCHAR) AS id,
    blob_sequence_num,
    binarydoc
FROM cerner_blob_table
WHERE docid = ?
ORDER BY blob_sequence_num
```

`ExecuteSQLRecord` settings:

- Set `Max Rows Per FlowFile` to `0`.
- Set `Output Batch Size` to `0`.
- Use a JSON record writer that emits a JSON array. The processor reads JSON FlowFile
  content, not Avro container bytes.
- Keep `Fetch Size` tuned for database performance only; it should not be used as a
  FlowFile grouping mechanism.
- If the SQL comes from the incoming FlowFile content, leave `SQL Query` empty. If the
  SQL is configured on the processor, pass the document ID as a prepared-statement
  argument, for example with `sql.args.1.type` and `sql.args.1.value` attributes.

Input records must include these fields unless you override the processor properties:

| Field | Default property | Required behavior |
|---|---|---|
| Document ID | `document_id_field_name=id` | Present, non-empty, and identical for every record in the FlowFile. |
| Blob sequence | `blob_sequence_order_field_name=blob_sequence_num` | Present, integer-like, unique by default, contiguous, and starting at `0` or `1`. |
| Blob payload | `binary_field_name=binarydoc` | Present and non-empty. With the default `binary_field_source_encoding=base64`, this must be a base64 string. |

Recommended processor properties:

| Property | Recommended value | Notes |
|---|---|---|
| `binary_field_name` | `binarydoc` | Change only if your SQL aliases the blob column differently. |
| `document_id_field_name` | `id` | Alias the SQL document ID to match this, or change the property. |
| `blob_sequence_order_field_name` | `blob_sequence_num` | The processor uses this for reassembly order. |
| `blob_sequence_order_resolve_duplicate_policy` | `fail` | Keep the default unless the source system has a known duplicate-row convention. |
| `binary_field_source_encoding` | `base64` | Recommended for JSON FlowFiles. |
| `output_mode` | `base64` | Recommended for JSON output and downstream processors. |

The processor routes to `failure` when it detects unsafe input, including:

- missing document ID, blob sequence, or blob payload fields;
- multiple document IDs in one FlowFile;
- duplicate sequence numbers when the duplicate policy is `fail`;
- sequence gaps such as `[1, 3]` or a missing leading sequence such as `[2, 3]`;
- invalid base64 payloads;
- payloads that cannot be extracted as embedded PDF/RTF bytes or decoded as Cerner LZW.

On success, the output is a JSON array containing one merged record. Non-binary fields
are copied from the first input record, and the blob field contains the decompressed or
extracted document bytes encoded according to `output_mode`. Useful FlowFile attributes
include `document_id`, `blob_parts`, `blob_sequence`, `blob_seq_min`, `blob_seq_max`,
`compressed_len`, `blob_payload_source`, and `is_lzw_compressed`.
