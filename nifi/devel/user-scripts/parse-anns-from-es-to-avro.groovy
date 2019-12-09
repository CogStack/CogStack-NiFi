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


// Avro schema used in the database and as provided by Tika Service
//
def avroMedcatSchema = 
'''
{
  "type": "record",
  "name": "document",
  "fields":
  [
    { "name": "doc_id", "type": "int" },
    { "name": "processing_timestamp", "type": { "type" : "string", "logicalType" : "timestamp-millis" } },

    { "name": "ent_id", "type": "int" },
    { "name": "cui", "type": ["null", "string"], "default": null },
    { "name": "tui", "type": ["null", "string"], "default": null },
    { "name": "start_idx", "type": "int", "default": 0 },
    { "name": "end_idx", "type": "int", "default": 0 },
    { "name": "source_value", "type": "string", "default": "" },
    { "name": "type", "type": ["null", "string"], "default": null },
    { "name": "acc", "type": "float", "default": 0.0 },

    { "name": "icd10", "type": ["null", "string"], "default": null },
    { "name": "umls", "type": ["null", "string"], "default": null },
    { "name": "snomed", "type": ["null", "string"], "default": null },
    { "name": "pretty_name", "type": ["null", "string"], "default": null }
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
        def annSchema = new Schema.Parser().parse(avroMedcatSchema)


        // Define wich schema to be used for writing
        // If you want to extend or change the output record format
        // you define a new schema and specify that it shall be used for writing
        writer.create(annSchema, outStream)


        inJson.hits.each { hit ->

            // Create a new record
            GenericRecord annRecord = new GenericData.Record(annSchema)

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

            // Append a new record to avro file
            writer.append(annRecord)
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