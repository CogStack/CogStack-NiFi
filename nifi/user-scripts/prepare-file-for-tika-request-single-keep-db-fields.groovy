/*

This script prepares an AVRO record to
 JSON format to be processed by TIKA.

*/


@Grab('org.apache.avro:avro:1.11.0')
import org.apache.avro.*
import org.apache.avro.util.*
import org.apache.avro.file.*
import org.apache.avro.generic.*


import org.apache.avro.io.EncoderFactory

import org.apache.avro.io.Encoder

import org.apache.avro.io.JsonEncoder
import org.apache.avro.io.BinaryEncoder
import org.apache.avro.io.DatumWriter
import org.apache.avro.io.Decoder
import org.apache.avro.io.DecoderFactory
import org.apache.commons.io.IOUtils
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets
import java.nio.*
import java.nio.channels.*
import org.apache.nifi.logging.ComponentLog
import groovy.transform.Field


// NiFi flow: get the input flow file
//
def flowFile = session.get();
if (flowFile == null) {
    return;
}

// the attribute name for storing the document id
String DOC_ID_ATTR = 'doc_id'
String documentIdValue = null

def previousAttributes = [:]


// NiFi flow: run the processing of the flow file
//.   parse the input avro file and extract the selected field content storing as the content
//.   implemented as StreamCallback: mapping FlowFiles 1-to-1 
flowFile = session.write(flowFile, { inputStream, outputStream ->
  byte[] bytes = IOUtils.toByteArray(inputStream);

  InputStream firstClone = new ByteArrayInputStream(bytes); 

  DataFileStream<GenericRecord> reader = new DataFileStream<>(firstClone, new GenericDatumReader<GenericRecord>())

  // get the next record -- the there should be only one
  assert reader.hasNext()
  GenericRecord currRecord = reader.next()

  // get the document binary content -- normally, this should be just raw byte content
  Object rawContent = currRecord.get(binary_field as String)
  assert rawContent

  // field name containing the output from Tika

  String outputTextFieldName = (output_text_field_name as String)

  // extract the document id that will be stored in the flow file attributes
  documentIdValue = currRecord.get(document_id_field as String)
  assert documentIdValue

  Boolean isBinary = !rawContent.getClass().toString().toLowerCase().contains("org.apache.avro.util.utf")

  // TODO: handle the case when the binary content is not of ByteBuffer
  ByteBuffer rawBytes = null
  if (!isBinary) {
    rawBytes = ByteBuffer.wrap(rawContent.toString().getBytes())
  }
  else { 
    rawBytes = (ByteBuffer) rawContent
  }

  // Empty out before sending the whole record data over, we don't want extra load
  currRecord.put(binary_field.toString(), null)
  def dataFields = currRecord.getSchema().getFields()

  DatumWriter<Object> datumWriter = new GenericDatumWriter<>(currRecord.getSchema())

  String filePath = "./var/tmp/nifi_file_" + flowFile.getAttribute("uuid").toString()
  DataFileWriter<GenericRecord> dataFileWriter = new DataFileWriter<GenericRecord>(datumWriter)
  dataFileWriter.create(currRecord.getSchema(), new File(filePath))
  dataFileWriter.append(currRecord)
  dataFileWriter.close()

  // set document id as an attribute of the flow file 
  // this is used and returned by tika
  previousAttributes[DOC_ID_ATTR] = documentIdValue

  previousAttributes["binary_field_name"] = binary_field.toString()
  previousAttributes["document_id_field_name"] = document_id_field.toString()

  // output text field name
  previousAttributes["output_text_field_name"] = outputTextFieldName

  previousAttributes["AVRO_RECORD_DATA_FILE_PATH"] = filePath
  previousAttributes["AVRO_RECORD_SCHEMA"] = currRecord.getSchema().toString()

  WritableByteChannel channel = Channels.newChannel(outputStream)
  channel.write(rawBytes)

} as StreamCallback)

// set document id as an attribute of the flow file
session.putAllAttributes(flowFile, previousAttributes)

// NiFi: transfer the seesions Flow file
// TODO: in case of lack of raw content -- shall we move to failure ???
session.transfer(flowFile, REL_SUCCESS)