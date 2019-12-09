@Grab('org.apache.avro:avro:1.8.1')
import org.apache.avro.*
import org.apache.avro.file.*
import org.apache.avro.generic.*

import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.avro.io.DatumWriter
import org.apache.commons.io.IOUtils
import org.apache.nifi.flowfile.FlowFile
import org.apache.nifi.processor.io.OutputStreamCallback
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets


// get the input flow file
def flowFile = session.get();
if (flowFile == null) {
    return;
}


// Avro schema used in the database
// and as provided by Tika Service
//
def avroDocumentSchema = 
'''
{
  "type": "record",
  "name": "document",
  "fields":
  [
    { "name": "doc_id", "type": ["int", "string"] },
    { "name": "doc_text", "type": "string", "default": "" },
    { "name": "processing_timestamp", "type": { "type" : "string", "logicalType" : "timestamp-millis" } },
    { "name": "metadata_x_ocr_applied", "type": "boolean" },
    { "name": "metadata_x_parsed_by", "type": "string" },
    { "name": "metadata_content_type", "type": ["null", "string"], "default": null },
    { "name": "metadata_page_count", "type": ["null", "int"], "default": null },
    { "name": "metadata_creation_date", "type": ["null", { "type" : "string", "logicalType" : "timestamp-millis" }], "default": null },
    { "name": "metadata_last_modified", "type": ["null", { "type" : "string", "logicalType" : "timestamp-millis" }], "default": null }
  ]
}
'''


// Parse the input json
//
flowFile = session.write(flowFile, { inputStream, outputStream ->

	def content = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
	def inJson = new JsonSlurper().parseText(content)

	// Defining avro reader and writer
	DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())

	// set avro schema
	def docSchema = new Schema.Parser().parse(avroDocumentSchema)


    // Define wich schema to be used for writing
    // If you want to extend or change the output record format
    // you define a new schema and specify that it shall be used for writing
    writer.create(docSchema, outputStream)

    // Create a new record
    GenericRecord docRecord = new GenericData.Record(docSchema)

    // parse the result and populate the record with data

    // obligatory fields
    //
    assert inJson.containsKey('doc_id')
    def docIdValue = null
    try {
        docIdValue = Integer.parseInt(inJson['doc_id'])
    }
    catch (Exception e) {
        docIdValue = new org.apache.avro.util.Utf8(inJson['doc_id'])
    }
    docRecord.put("doc_id", docIdValue)

    assert inJson.containsKey('timestamp')
    docRecord.put("processing_timestamp", inJson['timestamp'])

    if (inJson.containsKey('text'))
    	docRecord.put("doc_text", new org.apache.avro.util.Utf8(inJson['text']))


    // these metadata fields will be always provided by tika
    //
    assert inJson.containsKey('metadata')
    if (inJson.metadata.containsKey('X-OCR-Applied'))
    	docRecord.put("metadata_x_ocr_applied", inJson.metadata['X-OCR-Applied'])

    if (inJson.metadata.containsKey('X-Parsed-By'))
    	docRecord.put("metadata_x_parsed_by", new org.apache.avro.util.Utf8(String.join(";", inJson.metadata['X-Parsed-By'])))


    // optional metadata fields
    //
    if (inJson.metadata.containsKey('Page-Count'))
        docRecord.put("metadata_page_count", inJson.metadata['Page-Count'])

    if (inJson.metadata.containsKey('Content-Type'))
    	docRecord.put("metadata_content_type", new org.apache.avro.util.Utf8(inJson.metadata['Content-Type']))

    if (inJson.metadata.containsKey('Creation-Date'))
    	docRecord.put("metadata_creation_date", inJson.metadata['Creation-Date'])

    if (inJson.metadata.containsKey('Last-Modified'))
    	docRecord.put("metadata_last_modified", inJson.metadata['Last-Modified'])

    // Append a new record to avro file
    writer.append(docRecord)
    
    // do not forget to close the writer
    writer.close()
} as StreamCallback)

// transfer the seesions file
session.transfer(flowFile, REL_SUCCESS)