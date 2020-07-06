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
    // Create a new record
    GenericRecord annRecord = new GenericData.Record(avroSchema)

    // parse the result and populate the record with data

    // obligatory metadata fields
    //
    assert hit.containsKey('meta.doc_id')
    annRecord.put("doc_id", hit['meta.doc_id'])

    assert hit.containsKey('meta.timestamp')
    annRecord.put("processing_timestamp", hit['meta.timestamp'])


    // obligatory nlp fields
    //
    assert hit.containsKey('nlp.id')
    //annRecord.put("ent_id", hit['nlp.id'])
    annRecord.put("ent_id", Integer.parseInt(hit['nlp.id']))


    // these metadata fields will be always provided by medcat
    //
    if (hit.containsKey('nlp.cui'))
        annRecord.put("cui", Boolean.parseBoolean(hit['nlp.cui']))

    if (hit.containsKey('nlp.cui'))
        annRecord.put("cui", new org.apache.avro.util.Utf8(hit['nlp.cui']))

    if (hit.containsKey('nlp.tui'))
        annRecord.put("tui", new org.apache.avro.util.Utf8(hit['nlp.tui']))

    if (hit.containsKey('nlp.start'))
        annRecord.put("start_idx", hit['nlp.start'])

    if (hit.containsKey('nlp.end'))
        annRecord.put("end_idx", hit['nlp.end'])

    if (hit.containsKey('nlp.source_value'))
        annRecord.put("source_value", new org.apache.avro.util.Utf8(hit['nlp.source_value']))

    if (hit.containsKey('nlp.type'))
        annRecord.put("type", new org.apache.avro.util.Utf8(hit['nlp.type']))

    if (hit.containsKey('nlp.acc'))
        annRecord.put("acc", Float.parseFloat(hit['nlp.acc']))

    if (hit.containsKey('nlp.icd10'))
        annRecord.put("icd10", new org.apache.avro.util.Utf8(hit['nlp.icd10']))

    if (hit.containsKey('nlp.umls'))
        annRecord.put("umls", new org.apache.avro.util.Utf8(hit['nlp.umls']))

    if (hit.containsKey('nlp.snomed'))
        annRecord.put("snomed", new org.apache.avro.util.Utf8(hit['nlp.snomed']))

    if (hit.containsKey('nlp.pretty_name'))
        annRecord.put("pretty_name", new org.apache.avro.util.Utf8(hit['nlp.pretty_name']))

    return annRecord
}



def flowFile = session.get();
if (flowFile == null) {
    return;
}

try {
    flowFile = session.write(flowFile, {inStream, outStream ->

        def flowFileContent = IOUtils.toString(inStream, StandardCharsets.UTF_8)
        def inJson = new JsonSlurper().parseText(flowFileContent)

        // Defining avro reader and writer
        DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())
        writer.create(SchemaInstance.avroSchema, outStream)

        inJson.hits.each { hit ->
            def annRecord = parseJsonToAvro(hit, SchemaInstance.avroSchema)
            writer.append(annRecord)
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