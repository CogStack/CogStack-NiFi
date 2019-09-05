//import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.commons.io.IOUtils
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets


// get the input flow file
def flowFile = session.get();
if (flowFile == null) {
    return;
}


// get the document id from the session information
String DOC_ID_ATTR = 'doc_id'
String documentIdValue = flowFile.getAttribute(DOC_ID_ATTR)
assert documentIdValue


// parse the input json
flowFile = session.write(flowFile, { inputStream, outputStream ->

  def content = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
  def inJson = new JsonSlurper().parseText(content)

  // output json to store the result
  def outJson = inJson.result

  // store the document id value
  outJson.doc_id = documentIdValue

  // TODO: store possibly other attributes when necessary

  outputStream.write(JsonOutput.toJson(outJson).toString().getBytes(StandardCharsets.UTF_8))
} as StreamCallback)


// transfer the seesions file
session.transfer(flowFile, REL_SUCCESS)