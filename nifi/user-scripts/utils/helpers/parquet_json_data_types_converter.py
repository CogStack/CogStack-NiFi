import base64
from datetime import date, datetime
from decimal import Decimal


def parquet_json_data_type_convert(field_value):
    if isinstance(field_value, (datetime, date)): # noqa: UP038
        return field_value.isoformat()
    if isinstance(field_value, Decimal):
        return str(field_value)
    if isinstance(field_value, (bytes, bytearray, memoryview)):  # noqa: UP038
        return base64.b64encode(bytes(field_value)).decode("ascii")
    return str(field_value)
