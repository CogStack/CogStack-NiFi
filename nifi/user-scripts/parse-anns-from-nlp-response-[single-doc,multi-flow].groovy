/*

This script parses the records array stored as JSON and prepares
 the NLP paylod that will be send to NLP REST API as a single doc

The JSON payload that is returned by the API:

{
  "result": {
      "text: "",
      "annotations": [],
      "metadata": {},
      "success": true / false,
      "errors": [],
      "footer": {}
  }
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


def inputStream = session.read(inFlowFile)
def content = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
inputStream.close()

def inJson = new JsonSlurper().parseText(content)


// ignored type names
//.  'ignore_annotation_types' is provided by the user
Set ignoreAnnTypes = (ignore_annotation_types as String).split(',').collect { it.trim().toLowerCase() }


// annotation template to clone
assert inJson.result.footer
def outAnnTemplate = [:]
inJson.result.footer.each {k, v ->
    outAnnTemplate.put(FIELD_META_PREFIX + k, v)
}


// iterate over all annotations
//
def outFlowFiles = [] as List<FlowFile>
inJson.result.annotations.each { ann -> 

    def annType = ann.type.trim().toLowerCase()
    if (ignoreAnnTypes.contains(annType)) {
      return
    }

    outAnn = outAnnTemplate.clone()
    ann.each {k, v ->
        outAnn.put(FIELD_NLP_PREFIX + k, v)
    }
    
    def newFlowFile = session.create(inFlowFile)

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

session.transfer(outFlowFiles, REL_SUCCESS)
session.remove(inFlowFile)
