import sys

sys.path.insert(0, "/opt/nifi/user-scripts")

import json
import traceback
from collections import defaultdict
from typing import Any

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import ProcessContext, PropertyDescriptor, StandardValidators
from nifiapi.relationship import Relationship
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView
from utils.helpers.base_nifi_processor import BaseNiFiProcessor


class ConvertJsonRecordSchema(BaseNiFiProcessor):
    """
        Remaps each incoming JSON record (single dict or list of dicts) using a lookup loaded from
        json_mapper_schema_path.

        Supports:
        - simple renames: {"new_field": "old_field"}
        - constants/null placeholders: {"new_field": null}
        - composite concatenation: {"new_field": ["field1", "field2", ...]}
        - dotted destination keys for nesting: {"a.b.c": "old_field"} => {"a": {"b": {"c": value}}}
        - dotted destination keys applied to nested dict/list containers:
            {"document_Fields.valueText": "Answer"} will be applied to each object in record["document_Fields"]
            if document_Fields is a list[dict].

    For every mapping entry it can rename fields, populate constant null placeholders,
    or stitch together composite fields by concatenating multiple source values with newline separators.

    Optionally preserves any source fields not covered by the mapping via the
    preserve_non_mapped_fields boolean property, which defaults to true to avoid accidental data loss.

    Emits the transformed payload as JSON (mime.type=application/json) and tags the FlowFile with the schema path used,
    routing successes to success and any exceptions to failure
    """

    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.json_mapper_schema_path: str = "/opt/nifi/user-schemas/json/cogstack_common_schema_mapping.json"
        self.preserve_non_mapped_fields: bool = True
        self.composite_first_non_empty_field: list[str] = []

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="json_mapper_schema_path",
                               description="The path to the json schema mapping file, " \
                                "the schema directory is mounted as a volume in" \
                                " the nifi container in the /opt/nifi/user-schemas/ folder",
                               default_value="/opt/nifi/user-schemas/json/cogstack_common_schema_mapping.json",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="preserve_non_mapped_fields",
                               description="Whether to preserve fields that are not mapped in the schema",
                               default_value="true",
                               required=True,
                               allowable_values=["true", "false"],
                               validators=[StandardValidators.BOOLEAN_VALIDATOR]),
            PropertyDescriptor(name="composite_first_non_empty_field",
                    description="List of fields that are composite fields taking the first non-empty value e.g."
                    " 'new_field_mapping': [field1, field2] if field1 is empty then field2 is taken",
                    default_value="",
                    required=False)
        ]

        self._relationships = [
            Relationship(
                name="success",
                description="All FlowFiles processed successfully."
            ),
            Relationship(
                name="failure",
                description="FlowFiles that failed processing."
            )
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties
        self.relationships: list[Relationship] = self._relationships

    # -----------------------------
    # Helpers for nested destinations
    # -----------------------------
    @staticmethod
    def _set_nested(out: dict, dotted_key: str, value: Any) -> None:
        parts = dotted_key.split(".")
        cur = out
        for p in parts[:-1]:
            nxt = cur.get(p)
            if nxt is None:
                nxt = {}
                cur[p] = nxt
            elif not isinstance(nxt, dict):
                raise ValueError(f"Cannot nest into '{dotted_key}': '{p}' is not an object")
            cur = nxt
        cur[parts[-1]] = value

    def _set_field(self, out: dict, key: str, value: Any) -> None:
        if "." in key:
            self._set_nested(out, key, value)
        else:
            out[key] = value

    @staticmethod
    def _split_schema(schema: dict) -> tuple[dict, dict[str, dict]]:
        """
        Splits schema into:
          flat_schema: keys without a dot
          nested_schema: {container: {subpath: old_field}}
        Example:
          "document_Fields.valueText": "Answer"
        becomes:
          nested_schema["document_Fields"]["valueText"] = "Answer"
        """
        flat: dict = {}
        nested: dict[str, dict] = defaultdict(dict)
        for new_field, old_field in schema.items():
            if "." in new_field:
                container, subpath = new_field.split(".", 1)
                nested[container][subpath] = old_field
            else:
                flat[new_field] = old_field
        return flat, nested

    @staticmethod
    def _parse_list_property(raw: str) -> list[str]:
        raw = (raw or "").strip()
        if not raw:
            return []
        # JSON list?
        if raw.startswith("["):
            try:
                val = json.loads(raw)
                if isinstance(val, list):
                    return [str(x).strip() for x in val if str(x).strip()]
            except Exception:
                pass
        # comma-separated fallback
        return [x.strip() for x in raw.split(",") if x.strip()]

    def _render_list_items(
            self,
            items: list[dict],
            keys: list[str] = ["label", "valueText", "valueNum", "valueDate", "comment"],
        ) -> str | None:
            """
            Render a list of dict items (typically nested records such as `document_Fields`)
            into a readable multi-line text block for use inside composite fields like `document_Content`.

            Each item is rendered by extracting the first non-empty values for the provided `keys`
            (in the given order). The formatting is:

                <label>: <valueText> | <valueNum> | <valueDate> | <comment>

            - If only one value is present, it is emitted as a single token.
            - Empty / null / empty-collection values are skipped.
            - Items with no non-empty values are skipped.
            - Items are separated by a blank line.

            Args:
                items: List of dict objects to render (e.g. record["document_Fields"]).
                keys: Ordered list of keys to pull from each dict. Defaults to the schema
                    produced by your ES nested field mapping:
                    ["label", "valueText", "valueNum", "valueDate", "comment"].

            Returns:
                A string containing the rendered content, or None if nothing could be rendered.
            """


            lines: list[str] = []
            for it in items:
                if not isinstance(it, dict):
                    continue

                vals: list[str] = []
                for k in keys:
                    v = it.get(k)
                    if v not in (None, "", [], {}):
                        vals.append(str(v))

                if not vals:
                    continue

                # nice formatting: label: rest...
                if len(vals) > 1:
                    lines.append(f"{vals[0]}: " + " | ".join(vals[1:]))
                else:
                    lines.append(vals[0])

            return "\n\n".join(lines) if lines else None

    def _value_for_composite(self, record: dict, field_name: str) -> str | None:
        """
        Resolve a single entry referenced by a composite field mapping.

        This is used when a mapping specifies something like:
            "document_Content": ["OrderingComment", "SchedulingInstructions", "document_Fields"]

        Behaviour:
        - If record[field_name] is a scalar (str/int/float/bool/date-like), it is stringified.
        - If record[field_name] is a list of dicts, it is rendered via `_render_list_items()`.
        - If record[field_name] is a dict or a non-dict list, it is ignored (returns None)
            to avoid dumping structured JSON into text fields.
        - Missing / null / empty-string values return None.

        Args:
            record: The input record being mapped.
            field_name: A top-level field name referenced by a composite mapping entry.

        Returns:
            A string suitable for concatenation into the composite output field, or None if the
            field is missing / empty / unsupported for text rendering.
        """

        val = record.get(field_name)
        if val in (None, ""):
            return None

        # list-of-dicts => render as Q&A-ish text
        if isinstance(val, list) and all(isinstance(x, dict) for x in val):
            return self._render_list_items(val)

        # scalar => stringify
        if isinstance(val, dict | list):
            return None  # avoid dumping raw objects
        return str(val)
    
    def map_record(self, record: dict, json_mapper_schema: dict) -> dict:
        """
        Maps the fields of a record to new field names based on the provided JSON schema mapping.
            {new_field -> old_field, ....}

        Args:
            record (dict): The input record whose fields need to be mapped.
            json_mapper_schema (dict): The schema mapping dict specifying how to rename or nest fields.

        Returns:
            dict: A new record with fields mapped according to the schema.
        """

        new_record: dict = {}

        flat_schema, nested_schema = self._split_schema(json_mapper_schema)

        # reverse mapping for direct renames: old_field -> [new_field...]
        reverse = defaultdict(list)
        for new_field, old_field in flat_schema.items():
            if isinstance(old_field, str) and old_field:
                reverse[old_field].append(new_field)

        # 1) rename / preserve fields at this level
        for curr_field_name, curr_field_value in record.items():
            if curr_field_name in reverse:
                for new_field_name in reverse[curr_field_name]:
                    self._set_field(new_record, new_field_name, curr_field_value)
            elif self.preserve_non_mapped_fields:
                new_record[curr_field_name] = curr_field_value

        # 2) add null placeholders + composite fields at this level
        for new_field, old_field in flat_schema.items():
            if old_field is None:
                # only set if missing (supports dotted destination too)
                # (simple check: if top-level key exists, don't overwrite)
                # Composite fields:
                # - For scalars: concatenate values as strings (newline-separated).
                # - For list[dict] values: render them into readable Q&A-like text using
                #   keys ["label","valueText","valueNum","valueDate","comment"] and append
                #   to the composite output (e.g. document_Content).
                top = new_field.split(".", 1)[0]
                if "." not in new_field:
                    new_record.setdefault(new_field, None)
                else:
                    # nested: set only if not present
                    if top not in new_record:
                        self._set_field(new_record, new_field, None)
                    # if top exists, we avoid overwriting to keep behavior conservative
            elif isinstance(old_field, list):
                if new_field in self.composite_first_non_empty_field:
                    value = None
                    for sub_field in old_field:
                        rendered = self._value_for_composite(record, sub_field)
                        if rendered not in (None, ""):
                            value = rendered
                            break
                    self._set_field(new_record, new_field, value)
                else:
                    parts: list[str] = []
                    for sub_field in old_field:
                        rendered = self._value_for_composite(record, sub_field)
                        if rendered not in (None, ""):
                            parts.append(rendered)
                    self._set_field(new_record, new_field, "\n".join(parts) if parts else None)

        # 3) apply nested schema to container fields (dict or list[dict])
        for container, sub_schema in nested_schema.items():
            src = record.get(container)

            if isinstance(src, list):
                out_list: list[Any] = []
                for item in src:
                    if isinstance(item, dict):
                        out_list.append(self.map_record(item, sub_schema))
                    else:
                        out_list.append(item)
                new_record[container] = out_list

            elif isinstance(src, dict):
                new_record[container] = self.map_record(src, sub_schema)

            else:
                # container missing or scalar -> leave as-is/preserved
                # (if preserve_non_mapped_fields was true, it is already in new_record)
                pass

        return new_record

    @overrides
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        output_contents: list[dict[Any, Any]] = []

        try:
            self.process_context: ProcessContext = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytes = flowFile.getContentsAsBytes()
            records: dict | list[dict] = json.loads(input_raw_bytes.decode("utf-8"))

            if isinstance(records, dict):
                records = [records]

            json_mapper_schema: dict = {}
            with open(self.json_mapper_schema_path) as file:
                json_mapper_schema = json.load(file)

            for record in records:
                output_contents.append(self.map_record(record, json_mapper_schema))

            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
            attributes["json_mapper_schema_path"] = str(self.json_mapper_schema_path)
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=json.dumps(output_contents).encode('utf-8'))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
