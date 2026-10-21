import unittest

from server import normalize_tool_call_indices


class NormalizeToolCallIndicesTest(unittest.TestCase):
    def test_normalizes_only_integral_tool_call_indexes(self) -> None:
        payload = {
            "messages": [
                {
                    "role": "assistant",
                    "tool_calls": [
                        {
                            "index": 0.0,
                            "function": {
                                "index": 1.0,
                                "name": "SearchIndexTool",
                                "arguments": "{}",
                            },
                        },
                        {"index": 2.5, "function": {"name": "OtherTool"}},
                    ],
                }
            ],
            "index": 9.0,
        }

        self.assertEqual(normalize_tool_call_indices(payload), 2)
        self.assertEqual(payload["messages"][0]["tool_calls"][0]["index"], 0)
        self.assertEqual(
            payload["messages"][0]["tool_calls"][0]["function"]["index"], 1
        )
        self.assertEqual(payload["messages"][0]["tool_calls"][1]["index"], 2.5)
        self.assertEqual(payload["index"], 9.0)

    def test_ignores_non_chat_payloads(self) -> None:
        self.assertEqual(normalize_tool_call_indices([]), 0)
        self.assertEqual(normalize_tool_call_indices({"messages": "invalid"}), 0)


if __name__ == "__main__":
    unittest.main()
