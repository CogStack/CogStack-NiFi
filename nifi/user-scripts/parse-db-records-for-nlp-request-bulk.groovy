/*

This script parses the records array stored as JSON and prepares
 the NLP paylod that will be send to NLP REST API in BULK

The JSON payload that is being consumed by the API:

{
    "content": [
        {
            "text": "",
            "metadata:": {},
            "footer": {}
        },
        ...
    ]
    "applicationParams": {}
}

*/

import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.commons.io.IOUtils
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets


// NiFi flow: get the input flow file
//
def flowFile = session.get();
if (flowFile == null) {
    return;
}


// NiFi flow: run the processing of the flow file
//.   parse the input JSON into array of annotations
//.   implemented as StreamCallback: mapping FlowFiles 1-to-1
flowFile = session.write(flowFile, { inputStream, outputStream ->

  // read the input json
  def flowFileContent = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
  def inJson = new JsonSlurper().parseText(flowFileContent)

  // process each record 
  def outContent = []
  inJson.each { rec ->
    footer = [:]

    // store each available field into footer (excluding the document content
    //.  'document_text_field' is provided by the user
    rec.each {k, v ->
      if (!k.equals(document_text_field as String))
            footer.put(k, v)
      }
      outRec = [:]
      outRec.text = rec[document_text_field as String]
      outRec.footer = footer
  
    outContent.add(outRec)
  }

  // prepare and store the output JSON in the Flow file
  outJson = [:]
  outJson.content = outContent
  outputStream.write(JsonOutput.toJson(outJson).toString().getBytes(StandardCharsets.UTF_8))

} as StreamCallback)


// NiFi: transfer the seesions Flow file
session.transfer(flowFile, REL_SUCCESS)
