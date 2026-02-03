
class LzwItem:
    def __init__(self, _prefix: int = 0, _suffix: int = 0) -> None:
        self.prefix = _prefix
        self.suffix = _suffix


class DecompressLzwCernerBlob:
    def __init__(self) -> None:
        self.MAX_CODES: int = 8192
        self.tmp_decompression_buffer: list[int] = [0] * self.MAX_CODES
        self.lzw_lookup_table: list[LzwItem] = [LzwItem() for _ in range(self.MAX_CODES)]
        self.tmp_buffer_index: int = 0
        self.current_byte_buffer_index: int = 0

        # starts after 256, since 256 is the ASCII alphabet
        self.code_count: int = 257
        self.output_stream = bytearray()

    def save_to_lookup_table(self, compressed_code: int):
        self.tmp_buffer_index = -1
        while compressed_code >= 258:
            self.tmp_buffer_index += 1
            self.tmp_decompression_buffer[self.tmp_buffer_index] = \
                self.lzw_lookup_table[compressed_code].suffix
            compressed_code = self.lzw_lookup_table[compressed_code].prefix

        self.tmp_buffer_index += 1
        self.tmp_decompression_buffer[self.tmp_buffer_index] = compressed_code

        for i in reversed(list(range(self.tmp_buffer_index + 1))):
            self.output_stream.append(self.tmp_decompression_buffer[i])

    def decompress(self, input_stream: bytearray):

        byte_buffer_index: int = 0
        self.output_stream = bytearray()
        
        # used for bit shifts
        shift: int = 1
        current_shift: int = 1

        previous_code: int = 0
        middle_code: int = 0
        lookup_index: int = 0

        skip_flag: bool = False

        def read_current_byte() -> int:
            if byte_buffer_index >= len(input_stream):
                raise ValueError("Truncated input_stream while decoding LZW")
            return input_stream[byte_buffer_index]

        if not input_stream:
            return self.output_stream
        if byte_buffer_index >= len(input_stream):
            raise ValueError("Truncated input_stream while decoding LZW")
        
        first_code = input_stream[byte_buffer_index]

        while True:
            if current_shift >= 9:

                current_shift -= 8

                if first_code != 0:
                    byte_buffer_index += 1
                    middle_code = input_stream[byte_buffer_index]

                    first_code = (first_code << (current_shift + 8)) | (middle_code << current_shift)

                    byte_buffer_index += 1
                    middle_code = input_stream[byte_buffer_index]

                    tmp_code = middle_code >> (8 - current_shift)
                    lookup_index = first_code | tmp_code

                    skip_flag = True
                else:
                    byte_buffer_index += 1
                    first_code = input_stream[byte_buffer_index]
                    byte_buffer_index += 1
                    middle_code = input_stream[byte_buffer_index]
            else:
                byte_buffer_index += 1
                middle_code = input_stream[byte_buffer_index]

            if not skip_flag:
                lookup_index = (first_code << current_shift) | (middle_code >> (8 - current_shift))

                if lookup_index == 256:
                    shift = 1
                    current_shift += 1
                    first_code = read_current_byte()

                    self.tmp_decompression_buffer = [0] * self.MAX_CODES
                    self.tmp_buffer_index = 0

                    self.lzw_lookup_table = [LzwItem() for _ in range(self.MAX_CODES)]
                    self.code_count = 257
                    previous_code = 0
                    continue

                elif lookup_index == 257:  # EOF marker
                    return self.output_stream

            skip_flag = False

            # skipit part
            if previous_code == 0:
                self.tmp_decompression_buffer[0] = lookup_index
            if lookup_index < self.code_count:
                self.save_to_lookup_table(lookup_index)
                if self.code_count < self.MAX_CODES:
                    self.lzw_lookup_table[self.code_count] = LzwItem(
                        previous_code,
                        self.tmp_decompression_buffer[self.tmp_buffer_index])
                    self.code_count += 1
            else:
                if self.code_count < self.MAX_CODES:
                    self.lzw_lookup_table[self.code_count] = LzwItem(
                        previous_code,
                        self.tmp_decompression_buffer[self.tmp_buffer_index]
                    )
                    self.code_count += 1
                self.save_to_lookup_table(lookup_index)
            # end of skipit

            first_code = (middle_code & (0xff >> current_shift))
            current_shift += shift

            if self.code_count in [511, 1023, 2047, 4095]:
                shift += 1
                current_shift += 1
            previous_code = lookup_index
