/*

This script parses the TIKA document content from
 JSON format to AVRO.

*/

@Grab('org.apache.avro:avro:1.11.0')
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
import org.apache.nifi.logging.ComponentLog


// avro schema instance
//
class SchemaInstance {
    static Schema avroSchema = null

    static loadSchema(text) {
        avroSchema = new Schema.Parser().parse(text)
    }
}

// loads the schema when processor starts
//
static onStart(ProcessContext context) { 
    def filePath = context.getProperty('avro_schema_path') as String
    File file = new File(filePath)
    SchemaInstance.loadSchema(file.text)
}


// get the input flow file
def flowFile = session.get();
if (flowFile == null) {
    return;
}


// helper functions
//
def parseJsonToAvro(inJson, avroSchema) {
    // create a new avro record
     GenericRecord docRecord = new GenericData.Record(avroSchema)

    // obligatory fields
    //

    assert inJson.containsKey('doc_id')
    def docIdValue = null

    try {   
        docIdValue = String.valueOf(inJson.doc_id)
    }
    catch (Exception e) {
        try {
            docIdValue = new org.apache.avro.util.Utf8(inJson.doc_id)
        }
        catch (Exception e1) {
            docIdValue = inJson.doc_id as String
        }
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

    if (inJson.metadata.containsKey('X-TIKA:Parsed-By'))
        docRecord.put("metadata_x_parsed_by", new org.apache.avro.util.Utf8(String.join(";", inJson.metadata['X-TIKA:Parsed-By'])))


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

    return docRecord
}


// process the flow file
//
flowFile = session.write(flowFile, { inputStream, outputStream ->

	def content = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
	def inJson = new JsonSlurper().parseText(content)

	// Defining avro writer
	DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())
    writer.create(SchemaInstance.avroSchema, outputStream)

    docRecord = parseJsonToAvro(inJson, SchemaInstance.avroSchema)
    writer.append(docRecord)
    
    // do not forget to close the writer
    writer.close()
} as StreamCallback)

// transfer the seesions file
session.transfer(flowFile, REL_SUCCESS)
