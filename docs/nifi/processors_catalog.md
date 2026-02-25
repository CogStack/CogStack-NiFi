# NiFi processors catalog

This page is a working inventory of custom processors and processor scripts shipped in this repository.

Scope:

- Python extension processors (`FlowFileTransform`) in `nifi/user_python_extensions/`
- script-based processors used with `ExecuteStreamCommand` in `nifi/user_scripts/processors/`

## Python extension processors

| Processor class | Source file | Purpose | Key properties |
|---|---|---|---|
| `CogStackConvertAvroBinaryRecordFieldToBase64` | `nifi/user_python_extensions/convert_avro_binary_field_to_base64.py` | Rewrites Avro binary field(s) to base64 string values and updates output Avro schema accordingly. | `binary_field_name`, `operation_mode`, `document_id_field_name` |
| `ConvertJsonRecordSchema` | `nifi/user_python_extensions/convert_json_record_schema.py` | Remaps JSON records using a mapping schema file, including nested and composite field handling. | `json_mapper_schema_path`, `preserve_non_mapped_fields`, `composite_first_non_empty_field` |
| `CogStackConvertJsonToAttribute` | `nifi/user_python_extensions/convert_json_to_attribute.py` | Extracts numeric IDs from JSON records and stores them in FlowFile attributes (`ids_csv`, counts, lengths). | `field_name` |
| `CogStackConvertParquetToJson` | `nifi/user_python_extensions/convert_record_parquet_to_json.py` | Converts Parquet FlowFile content to NDJSON output. | None |
| `CogStackParseCogStackServiceResult` | `nifi/user_python_extensions/parse_service_response.py` | Normalizes OCR/MedCAT service responses into a consistent JSON output shape. | `service_message_type`, `output_text_field_name`, `document_id_field_name`, `document_text_field_name`, `medcat_output_mode`, `medcat_deid_keep_annotations` |
| `CogStackPrepareRecordForNlp` | `nifi/user_python_extensions/prepare_record_for_nlp.py` | Prepares records for NLP service requests as `{content: ...}` payloads with `text` and `footer`. | `document_id_field_name`, `document_text_field_name`, `process_flow_file_type` |
| `CogStackPrepareRecordForOcr` | `nifi/user_python_extensions/prepare_record_for_ocr.py` | Prepares records for OCR service requests with `binary_data` and `footer` fields. | `binary_field_name`, `output_text_field_name`, `operation_mode`, `document_id_field_name`, `process_flow_file_type` |
| `CogStackJsonRecordAddGeolocation` | `nifi/user_python_extensions/record_add_geolocation.py` | Adds geolocation (`lat`/`lon`) to JSON records using postcode lookup data. | `lookup_datafile_url`, `lookup_datafile_path`, `postcode_field_name`, `geolocation_field_name` |
| `CogStackJsonRecordDecompressCernerBlob` | `nifi/user_python_extensions/record_decompress_cerner_blob.py` | Reassembles ordered blob fragments and decompresses Cerner LZW payloads. | `binary_field_name`, `blob_sequence_order_field_name`, `binary_field_source_encoding`, `output_mode`, `document_id_field_name` |
| `CogStackSampleTestProcessor` | `nifi/user_python_extensions/sample_processor.py` | Reference/sample processor template for implementing new processors. | `sample_property_one`, `sample_property_two`, `sample_property_three` |

## Script-based processors (`ExecuteStreamCommand`)

| Script | Source file | Purpose | Typical arguments |
|---|---|---|---|
| `clean_doc.py` | `nifi/user_scripts/processors/clean_doc.py` | Cleans PII-like patterns from text fields in JSON records. | `text_field_name` |
| `convert_record_parquet_to_json.py` | `nifi/user_scripts/processors/convert_record_parquet_to_json.py` | Converts Parquet bytes from stdin to NDJSON on stdout. | None |
| `record_decompress_cerner_blob.py` | `nifi/user_scripts/processors/record_decompress_cerner_blob.py` | Reassembles + decompresses Cerner blob parts and emits merged JSON record. | `binary_field_name`, `blob_sequence_order_field_name`, `output_mode`, `document_id_field_name` |
| `get_files_from_storage.py` | `nifi/user_scripts/processors/get_files_from_storage.py` | Reads files (and optional CSV metadata) from storage folders and emits JSON records for ingestion. | `root_project_data_dir`, `folder_to_ingest`, `folder_pattern`, `operation_mode`, `output_batch_size` |
| `generate_location.py` | `nifi/user_scripts/processors/generate_location.py` | Adds random geolocation points for records using configured city polygons. | `locations`, `subject_id_field`, `location_name_field` |
| `cogstack_cohort_generate_data.py` | `nifi/user_scripts/processors/cogstack_cohort_generate_data.py` | Cohort export utility; builds cohort aggregation artifacts from patient and annotation files. | `input_folder_path`, file name patterns, patient/document field names |
| `cogstack_cohort_generate_random_data.py` | `nifi/user_scripts/processors/cogstack_cohort_generate_random_data.py` | Test/dummy cohort data generator from patient and annotation input files. | input file paths and patient/annotation field names |
| `elastic_schema_converter.py` | `nifi/user_scripts/processors/elastic_schema_converter.py` | Experimental schema conversion helper for Elasticsearch mappings. | `input_index_name`, `output_index_name`, `json_field_mapper_schema_file_path` |

## Notes

- Some scripts in `nifi/user_scripts/processors/` are stream processors; others are batch-style utilities.
- `sample_processor.py` is a template/reference implementation, not a production flow processor.
- Keep this page updated when adding/removing processor files so developers can discover what is available.

## Related docs

- [NiFi development guide](development_guide.md)
- [Processor scripting guide](processor_scripting.md)
- [NiFi user scripts](user_scripts.md)
- [NiFi Python extensions](user_python_extensions.md)
