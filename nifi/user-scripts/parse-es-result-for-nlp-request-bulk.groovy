/*

This script parses the records received from ElasticSearch and prepares
 the NLP paylod that will be send to NLP REST API

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

INFO: this script is almost identical as the one used for parsing records
 directly from JSON, but the pipeline does not require

*/

import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.commons.io.IOUtils
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets


// NiFi flow: get the input flow file
//
def flowFile = session.get()
if (flowFile == null) {
    return
}

// NiFi flow: run the processing of the flow file (implemented as StreamCallback)
//.   parse the input json into array of annotations
//.   implemented as StreamCallback: mapping FlowFiles 1-to-1
flowFile = session.write(flowFile, { inputStream, outputStream ->

    // read the input json
    def flowFileContent = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
    def inJson = new JsonSlurper().parseText(flowFileContent)

    def documentTextField = document_text_field as String
    def documentIdField = document_id_field as String

    // process each record (returned in hits.* field)
    def outContent = []

	inJson.each { record  ->

        def rec = record["_source"]

		footer = [:]

        // store each available field into footer (excluding the document content
        // 'document_text_field' is provided by the user
		rec.each {k, v ->
			if (!k.equals(document_text_field)) {
        		footer.put(k, v)
            }
    	}

    	outRec = [:]
    	outRec.text = rec[documentTextField]
        outRec["id"] = record["_id"]

        footer.put("id", outRec["id"])
        
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
