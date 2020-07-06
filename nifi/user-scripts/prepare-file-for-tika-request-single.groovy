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
String documentIdValue = flowFile.getAttribute('uuid')


// set document id as an attribute of the flow file
flowFile = session.putAttribute(flowFile, DOC_ID_ATTR, documentIdValue)


// NiFi: transfer the seesions Flow file
// TODO: in case of lack of raw content -- shall we move to failure ???
session.transfer(flowFile, REL_SUCCESS)