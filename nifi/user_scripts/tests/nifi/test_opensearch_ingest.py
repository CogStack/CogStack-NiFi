import unittest
from io import BytesIO


class DummyFlowFile:
    def __init__(self, content: str):
        self._data = BytesIO(content.encode())

    def read(self):
        return self._data.getvalue()

    def write(self, data):
        self._data = BytesIO(data)
        return self

class TestMyProcessor(unittest.TestCase):
    def test_uppercase(self):
        proc = Proccc()
        ff_in = DummyFlowFile("hello nifi")
        ff_out = proc.transform({}, ff_in)

        self.assertEqual(ff_out.read().decode(), "HELLO NIFI")

if __name__ == "__main__":
    unittest.main()
