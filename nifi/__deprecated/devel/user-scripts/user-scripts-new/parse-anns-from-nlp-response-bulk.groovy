/*

This script parses the records array stored as JSON and prepares
 the NLP paylod that will be send to NLP REST API in BULK

The JSON payload that is returned by the API:

{
  "result": [
    {
      "text: "",
      "annotations": [],
      "metadata": {},
      "success": true / false,
      "errors": [],
      "footer": {}
    },
    ...
  ]
}

*/

import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.commons.io.IOUtils
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets


// constants:
//.   prefixes used in the output field names
final String FIELD_META_PREFIX = "meta."
final String FIELD_NLP_PREFIX = "nlp."


// NiFi flow: read the input of the current flow file
//.   INFO: we will create multiple Flow files as an output
//.         hence not utilising StreamCallback
def inFlowFile = session.get();
if (inFlowFile == null) {
    return;
}


// read the contents of the input Flow file
def inputStream = session.read(inFlowFile)
def flowFileContent = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
inputStream.close()

def inJson = new JsonSlurper().parseText(flowFileContent)


// ignored type names
//.  'ignore_annotation_types' is provided by the user
Set ignoreAnnTypes = (ignore_annotation_types as String).split(',').collect { it.trim().toLowerCase() }


// iterate over records, store the annotations in separate flow files
//
def outFlowFiles = [] as List<FlowFile>

inJson.result.each {res ->

  // annotation template containing footer that will be used 
  //.  by the all of the annotations in the same record
  def outAnnTemplate = [:]
  res.footer.each {k, v ->
      outAnnTemplate.put(FIELD_META_PREFIX + k, v)
  }
  assert res.timestamp
  outAnnTemplate.put(FIELD_META_PREFIX + 'timestamp', res.timestamp)

  // iterate over all the annotations
  //
  res.annotations.each { ann -> 
    // filter the ignored annotations (by type)
    def annType = ann.type.trim().toLowerCase()
    if (ignoreAnnTypes.contains(annType)) {
      return
    }

    outAnn = outAnnTemplate.clone()
    ann.each {k, v ->
        outAnn.put(FIELD_NLP_PREFIX + k, v)
    }

    // create a separate flow file per annotation
    def newFlowFile = session.create(inFlowFile)

    // 'document_id_field' and 'annotation_id_field' are provided by the user
    //.  and are used to creater a unique identifier
    def doc_id = outAnn[document_id_field as String]
    assert doc_id
    def ann_id = outAnn[annotation_id_field as String]
    assert ann_id
    def doc_ann_id = "d_${doc_id}-a_${ann_id}"

    // store annotation ID as the Flow file attriburte and store the new Flow file
    newFlowFile = session.putAttribute(newFlowFile, 'document_annotation_id', doc_ann_id)
    newFlowFile = session.write(newFlowFile, { outputStream -> 
         outputStream.write( JsonOutput.toJson(outAnn).toString().getBytes(StandardCharsets.UTF_8) )
      } 
      as OutputStreamCallback )

      outFlowFiles << newFlowFile
    }
}

// NiFi: transfer all the flow files
session.transfer(outFlowFiles, REL_SUCCESS)
session.remove(inFlowFile)
