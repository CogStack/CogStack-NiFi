/*

This script prepares an AVRO record to
 JSON format to be processed by TIKA.

*/


@Grab('org.apache.avro:avro:1.8.1')
import org.apache.avro.*
import org.apache.avro.file.*
import org.apache.avro.generic.*

import org.apache.commons.io.IOUtils
import org.apache.nifi.processor.io.StreamCallback
import java.nio.charset.StandardCharsets
import java.nio.*
import java.nio.channels.*


// NiFi flow: get the input flow file
//
def flowFile = session.get();
if (flowFile == null) {
    return;
}

// the attribute name for storing the document id
String DOC_ID_ATTR = 'doc_id'
String documentIdValue = null


// NiFi flow: run the processing of the flow file
//.   parse the input avro file and extract the selected field content storing as the content
//.   implemented as StreamCallback: mapping FlowFiles 1-to-1
flowFile = session.write(flowFile, { inputStream, outputStream ->

  DataFileStream<GenericRecord> reader = new DataFileStream<>(inputStream, new GenericDatumReader<GenericRecord>())

  // get the next record -- the there should be only one
  assert reader.hasNext()
  GenericRecord currRecord = reader.next()

  // get the document binary content -- normally, this should be just raw byte content
  Object rawContent = currRecord.get(binary_field as String)
  assert rawContent

  // extract the document id that will be stored in the flow file attributes
  documentIdValue = currRecord.get(document_id_field as String)
  assert documentIdValue

  // TODO: handle the case when the binary content is not of ByteBuffer
  ByteBuffer rawBytes = (ByteBuffer) rawContent

  WritableByteChannel channel = Channels.newChannel(outputStream)
  channel.write(rawBytes)

} as StreamCallback)


// set document id as an attribute of the flow file
flowFile = session.putAttribute(flowFile, DOC_ID_ATTR, documentIdValue)


// NiFi: transfer the seesions Flow file
// TODO: in case of lack of raw content -- shall we move to failure ???
session.transfer(flowFile, REL_SUCCESS)