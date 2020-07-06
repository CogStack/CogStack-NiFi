#!/usr/bin/python
import json
import java.io
from org.apache.commons.io import IOUtils
from java.nio.charset import StandardCharsets
from org.apache.nifi.processor.io import StreamCallback

class UpdateFlowFieldsCallback(StreamCallback):

  FIELD_META_PREFIX = "meta."
  FIELD_NLP_PREFIX = "nlp."

  def __init__(self):
        pass

  def process(self, in_stream, out_stream):
    text = IOUtils.toString(in_stream, StandardCharsets.UTF_8)
    if len(text) > 0:
      in_json = json.loads(text)

      out_json = {}
      out_json['annotations'] = []
      
      if 'result' in in_json and 'annotations' in in_json['result'] and in_json['result']['annotations'] is not None and len(in_json['result']['annotations']) > 0:

        for orig_ann in in_json['result']['annotations']:
          ann = {}

          for k, v in orig_ann.items():
            ann[self.FIELD_NLP_PREFIX + k] = v

          if 'footer' in in_json:
            for k, v in in_json['footer'].items():
              ann[self.FIELD_META_PREFIX + k] = v

          out_json['annotations'].append(ann)

      out_stream.write(bytearray(json.dumps(out_json, indent=4).encode('utf-8')))


in_flowfile = session.get()
if in_flowfile != None:
  out_flowfile = session.write(in_flowfile, UpdateFlowFieldsCallback())

  session.transfer(out_flowfile, REL_SUCCESS)
