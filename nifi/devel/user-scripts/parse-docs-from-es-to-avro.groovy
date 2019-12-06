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
    { "name": "doc_id", "type": "int" },
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

def flowFile = session.get();
if (flowFile == null) {
    return;
}

//try {

    flowFile = session.write(flowFile, {inStream, outStream ->

        def flowFileContent = IOUtils.toString(inStream, StandardCharsets.UTF_8)
        def inJson = new JsonSlurper().parseText(flowFileContent)

        // Defining avro reader and writer
        DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())

        // set avro schema
        def docSchema = new Schema.Parser().parse(avroDocumentSchema)


        // Define wich schema to be used for writing
        // If you want to extend or change the output record format
        // you define a new schema and specify that it shall be used for writing
        writer.create(docSchema, outStream)


        inJson.hits.each { hit ->

            // Create a new record
            GenericRecord docRecord = new GenericData.Record(docSchema)

            // parse the result and populate the record with data

            // obligatory fields
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

            // Append a new record to avro file
            writer.append(docRecord)
        }

        // do not forget to close the writer
        writer.close()

    } as StreamCallback)

    session.transfer(flowFile, REL_SUCCESS)

/*
} catch(e) {
    log.error('Error appending new record to avro file', e)
    flowFile = session.penalize(flowFile)
    session.transfer(flowFile, REL_FAILURE)
}
*/