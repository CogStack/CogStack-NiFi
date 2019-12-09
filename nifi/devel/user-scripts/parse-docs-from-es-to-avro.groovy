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


// helper functions
//
def parseJsonToAvro(hit, avroSchema) {
	// Create a new, generic record
	GenericRecord docRecord = new GenericData.Record(avroSchema)

	// parse the json
	//
	assert hit['doc_id']
    docRecord.put("doc_id", hit['doc_id'])

    assert hit['timestamp']
    docRecord.put("processing_timestamp", hit['timestamp'])

    if (hit['text'])
    	docRecord.put("doc_text", new org.apache.avro.util.Utf8(hit['text']))

    // these metadata fields will be always provided by tika
    //
    if (hit.metadata['X-OCR-Applied'])
    	docRecord.put("metadata_x_ocr_applied", Boolean.parseBoolean(hit.metadata['X-OCR-Applied']))

    if (hit.metadata['X-Parsed-By'])
    	docRecord.put("metadata_x_parsed_by", new org.apache.avro.util.Utf8(String.join(";", hit.metadata['X-Parsed-By'])))


    // optional metadata fields
    //
    if (hit.metadata['Content-Type'])
    	docRecord.put("metadata_content_type", new org.apache.avro.util.Utf8(hit.metadata['Content-Type']))

    if (hit.metadata['Creation-Date'])
    	docRecord.put("metadata_creation_date", hit.metadata['Creation-Date'])

    if (hit.metadata['Last-Modified'])
    	docRecord.put("metadata_last_modified", hit.metadata['Last-Modified'])

    return docRecord
}




def flowFile = session.get();
if (flowFile == null) {
    return;
}


try {
    flowFile = session.write(flowFile, {inStream, outStream ->

        def flowFileContent = IOUtils.toString(inStream, StandardCharsets.UTF_8)
        def inJson = new JsonSlurper().parseText(flowFileContent)

        // Defining a generic avro reader and writer
        DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())
        writer.create(SchemaInstance.avroSchema, outStream)

        inJson.hits.each { hit ->
            def docRecord = parseJsonToAvro(hit, SchemaInstance.avroSchema)
            writer.append(docRecord)
        }

        // do not forget to close the writer
        writer.close()

    } as StreamCallback)
    session.transfer(flowFile, REL_SUCCESS)
} 
catch(e) {
    log.error('Error while parsing to avro record', e)
    flowFile = session.penalize(flowFile)
    session.transfer(flowFile, REL_FAILURE)
}
