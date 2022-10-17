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
import groovy.json.JsonBuilder

import org.apache.avro.specific.SpecificDatumReader
import org.apache.avro.io.DatumReader
import org.apache.avro.io.Decoder
import org.apache.avro.io.DecoderFactory
import org.apache.avro.io.Encoder
import org.apache.avro.io.EncoderFactory

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
def parseJsonToAvro(inJson, avroSchema, originalAvroDoc, outputTextFieldName, documentIdFieldName, binaryFieldName) {
    
    // obligatory fields
    assert inJson.containsKey("doc_id")
    def docIdValue = null

    try {
        docIdValue = Integer.parseInt(inJson["doc_id"].toString())
    }
    catch (Exception e) {
        try {
            docIdValue = new org.apache.avro.util.Utf8(inJson["doc_id"])
        }
        catch (Exception e1) {
            docIdValue = inJson["doc_id"]
        }
    }

     // create a new avro record
    GenericRecord docRecord = new GenericData.Record(avroSchema)

    // put the original DB fields back in
   
    assert inJson.containsKey('timestamp')
    docRecord.put("processing_timestamp", inJson['timestamp'])

    // if we got a doc_id field name that is different from doc_id then use it
    if (documentIdFieldName != "") {
        docRecord.put(documentIdFieldName, docIdValue)
    }
    else {
        docRecord.put("doc_id", docIdValue)
    }

    def dataFields = originalAvroDoc.getSchema().getFields()

    dataFields.forEach(recordField -> {
        def fieldName = recordField.name().toString()
        if (fieldName.toLowerCase() != binaryFieldName.toLowerCase())
        {
            def fieldData = originalAvroDoc.get(fieldName)
            docRecord.put(recordField.name().toString(), fieldData)
        }
    })

    // if there is an output fieldName that was declared by the user then replace the "text" field name with this one
    if (inJson.containsKey('text'))
        if (outputTextFieldName != "") {
            docRecord.put(outputTextFieldName, new org.apache.avro.util.Utf8(inJson['text']))
        }
        else {
            docRecord.put("doc_text", new org.apache.avro.util.Utf8(inJson['text']))
        }

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


    String outputTextFieldName
    String documentIdFieldName
    String binaryFieldName

    try {
        outputTextFieldName = flowFile.getAttribute("output_text_field_name").toString()
        documentIdFieldName = String.valueOf(flowFile.getAttribute("document_id_field_name"))
        binaryFieldName = String.valueOf(flowFile.getAttribute("binary_field_name"))
    }
    catch (Exception e) {
    }

    def avro_record_file_path = flowFile.getAttribute('AVRO_RECORD_DATA_FILE_PATH').toString()
    def avro_record_old_schema = Schema.parse(flowFile.getAttribute("AVRO_RECORD_SCHEMA").toString())

    def avro_record_File = new File(avro_record_file_path)

    DatumReader<GenericRecord> datumReader = new GenericDatumReader<GenericRecord>(avro_record_old_schema)
    DataFileReader<GenericRecord> dataFileReader = new DataFileReader<GenericRecord>(avro_record_File, datumReader)
    GenericRecord originalAvroDoc = dataFileReader.next()

    // Defining avro writer
    DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())
    writer.create(SchemaInstance.avroSchema, outputStream)

    def docRecord = parseJsonToAvro(inJson, SchemaInstance.avroSchema, originalAvroDoc, outputTextFieldName, documentIdFieldName, binaryFieldName)
    writer.append(docRecord)

    // delete the file after we are done with it (this is not perfect, some files may remain if the workflow is stopped and restarted from scratch)
    avro_record_File.delete()
      
    // do not forget to close the writer
    writer.close()
} as StreamCallback)    

// transfer the seesions file
session.transfer(flowFile, REL_SUCCESS)
