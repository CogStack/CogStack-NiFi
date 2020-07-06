/*

This script parses the records array stored as JSON and prepares
 the NLP paylod that will be send to NLP REST API in BULK

The JSON payload that is returned by the API:

{
  "result": [
    {
      "text: "",
      "annotations": [],
      "metadata": {},
      "success": true / false,
      "errors": [],
      "footer": {}
    },
    ...
  ]
}

*/

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
def parseJsonToAvro(hit, res, avroSchema) {
    // Create a new record
    GenericRecord annRecord = new GenericData.Record(avroSchema)

    // parse the result and populate the record with data

    // obligatory metadata fields
    //
    assert ( res.footer.containsKey(document_id_field as String) && res.footer[document_id_field as String] != null)
    annRecord.put("doc_id", Integer.parseInt(res.footer[document_id_field as String] as String))

    assert ( res.containsKey('timestamp') && res['timestamp'])
    annRecord.put("processing_timestamp", new org.apache.avro.util.Utf8(res['timestamp']))

    // obligatory nlp fields
    //
    assert ( hit.containsKey(annotation_id_field as String) && hit[annotation_id_field as String] != null)
    //annRecord.put("ent_id", hit['id'])
    annRecord.put("ent_id", Integer.parseInt(hit[annotation_id_field as String] as String))

    // these metadata fields will be always provided by medcat
    //
    if (hit.containsKey('cui') && hit['cui'])
        annRecord.put("cui", new org.apache.avro.util.Utf8(hit['cui']))

    if (hit.containsKey('tui') && hit['tui'])
        annRecord.put("tui", new org.apache.avro.util.Utf8(hit['tui']))

    if (hit.containsKey('start') && hit['start'] != null)
        annRecord.put("start_idx", Integer.parseInt(hit['start'] as String))

    if (hit.containsKey('end') && hit['end'] != null)
        annRecord.put("end_idx", Integer.parseInt(hit['end'] as String))

    if (hit.containsKey('source_value') && hit['source_value'])
        annRecord.put("source_value", new org.apache.avro.util.Utf8(hit['source_value']))

    if (hit.containsKey('type') && hit['type'])
        annRecord.put("type", new org.apache.avro.util.Utf8(hit['type']))

    if (hit.containsKey('acc') && hit['acc'] != null)
        annRecord.put("acc", Float.parseFloat(hit['acc'] as String))

    if (hit.containsKey('icd10') && hit['icd10'])
        annRecord.put("icd10", new org.apache.avro.util.Utf8(hit['icd10']))

    if (hit.containsKey('umls') && hit['umls'])
        annRecord.put("umls", new org.apache.avro.util.Utf8(hit['umls']))

    if (hit.containsKey('snomed') && hit['snomed'])
        annRecord.put("snomed", new org.apache.avro.util.Utf8(hit['snomed']))

    if (hit.containsKey('pretty_name') && hit['pretty_name'])
        annRecord.put("pretty_name", new org.apache.avro.util.Utf8(hit['pretty_name']))

    return annRecord
}




// NiFi flow: read the input of the current flow file
//.   INFO: we will create multiple Flow files as an output
//.         hence not utilising StreamCallback
def inFlowFile = session.get();
if (inFlowFile == null) {
    return;
}

//try {
  inFlowFile = session.write(inFlowFile, {inStream, outStream ->


  def flowFileContent = IOUtils.toString(inStream, StandardCharsets.UTF_8)
  def inJson = new JsonSlurper().parseText(flowFileContent)

    // Defining avro reader and writer
    DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<GenericRecord>())
    writer.create(SchemaInstance.avroSchema, outStream)
  
   inJson.result.each {res ->

    // iterate over all the annotations
    //
    res.annotations.each { ann ->
     
      def annRecord = parseJsonToAvro(ann, res, SchemaInstance.avroSchema)
      writer.append(annRecord)
      }
  }

  writer.close()
  } as StreamCallback)
    session.transfer(inFlowFile, REL_SUCCESS)
