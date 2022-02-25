# Introduction

Our custom Apache NiFi image comes with 4 example template workflows bundled that available in [user templates](../nifi/user-templates) in `../nifi` directory.
These are:
1. `Ingest raw text from DB to ES` - performing ingestion of free-text notes from database to Elasticsearch.
2. `Ingest PDFs from DB to ES` - performing ingestion of raw notes in PDF format from database to Elasticsearch.
3. `MedCAT annotate from ES to ES` - annotating the free-text notes using MedCAT, reading from database and storing in Elasticsearch.
4. `MedCAT annotate from DB to ES` - the same as (3) but reading notes from Elasticsearch.

If you are using Nifi with SSL mode (which is on by default as of the upgrade to version 1.15+), then you would need to use the equivalent templates:
1. `INGEST_RAW_FROM_DB_TO_ES_SSL` - same as 1. from above but with SSL configurations
2. `Ingest_raw_text_into_ES_and_annotate_from_ES_to_ES_SSL` - workflows 1 and 3 combined with SSL support.

# Used services
In the workflow examples, the following services are used:
- `samples-db` - storing the example input data,
- `nifi` - the actual Apache NiFi data pipeline engine with user interface,
- `elasticsearch-1` - for storing the resulting documents and annotations data,
- `tika-service` - extraction of text from binary documents,
- `nlp-medcat-medmen` - an example NLP application for extracting annotations from free-text.

To deploy the above services, one can type in the `deploy` directory: 
```
make start-data-infra
make start-nlp-medcat
```

Please note that all the above services will be accessible by services within internal `cognet` Docker network while only some of them will be accessible from host machine.
Please refer to [SERVICES](./SERVICES.md) for a more detailed description of the available services and their deployment.

# Apache NiFi web user interface
Before start, please see [the official Apache NiFi guide on using the web user interface](https://nifi.apache.org/docs/nifi-docs/html/user-guide.html#User_Interface) that covers extensively the available functionality.

In this README only the key aspects will be covered on using the bundled user templates with configuring and executing the flows.

Once deployed, Apache NiFi web interface will be accessible from the host (e.g. localhost) machine at `http://localhost:8080`.

To see all available user workflow templates navigate to **Templates** window by clicking the corresponding list item as presented on the figure below.
Following, to select an example workflow template to run, drag and drop the **template** button from the components toolbar panel to the main notepad window.
![template-w1](./docs-assets/nifi-templates-w1.png)

Please note that all the available workflow templates that are bundled with our custom Apache NiFi image are available in [`../nifi/user-templates`](../nifi/user-templates) directory.
During normal work, the user has possibility to create and store own template workflows.
These workflows are represented as XML files and so can be easily further shared or modified.

The templates mentioned in the introduction section may REQUIRE some minor configuration such as addting the passwords to the ES connectors (u: `admin`, pw:`admin`) and to the SSLContext Controller,
the trust/key(store) password is `cogstackNifi`.

# Ingesting free-text documents (DB → ES)
This workflow implements a common data ingestion pipeline: reading from a database and storing the free-text data alongside selected structured fields into Elasticsearch.
The workflow was presented on the figure above.


## Reading records from database
Free-text data alongside available structured fields are read from `samples-db` database from `medical_reports_text` table. 
This operation is implemented by NiFi components: `GenerateTableFetch` and `ExecuteSQLRecord`,  where the configuration of the former component is described on the picture below.
The `docid` field is set as the primary key of the `medical_reports_text` table and is used persist the state of the last read record and to partition the records while reading.
![db-reader](./docs-assets/configure-db-reader-w1.png)

## Configuring DB connector
However, apart from specifying the DB tables, the DB connector controller `DBCPConnectionPool-MTSamples` needs to configured and activated.
The example data is stored in `db_samples` database. 
User `test` with password `test` was created to connect to it.

Alongside the DB connector, other controllers used by the processors (i.e. record readers and writers) need to be activated too - all of this is illustrated on the picture below.
![db-reader-w1](./docs-assets/configure-db-connector-w1.png)


## Adding your own data to the DB 

The easiest way to do this is to create your own sql schema file (to keep things separated) stored in the pgsamples folder( for example `services/pgsamples/new_schema.sql​` ) put your sql code there and mount it on the pg-samples container, like so:
```
  samples-db:
      image: postgres:11.4-alpine
      container_name: cogstack-samples-db
      restart: always
      volumes:
        # mapping postgres data dump and initialization
        - ../services/pgsamples/new_schema.sql:/data/new_schema.sql:ro  # <----- this is the new line
```
Pay attention to the mapped volume file path, we added a new line.

Afterwards, in the `services/pgsamples/init_db.sh​ file`, you will need to add a line that imports the sql file created directly when the DB container is first initialized

```
# create schemas
#
echo "Defining DB schemas"
psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -f $DATA_DIR/"new_schema.sql"    
```

After this is done , the only things that need to be changed are in the NiFi flow config, as follows:
  - in the "GenerateTableFetch" process (make sure it is not running, and that you right click it go to view state​ and then click on the "Clear State" button, this resets the ingested records), we change the table_name from medical_reports_text to your own custom `index_table_name` , and the Maximum-value Columns to any field that we wish to select DB rows by, preferably some unique ID field that could also be a primary key `unique_id_column` ( if it's the actual key you wish to select the documents by) .
  - in the "PutElasticsearchHttpRecord" process, change the "Identifier Record Path" from "/docid" to "/unique_id_column"

Additional steps may be required : delete current Db-samples container, then the volume (samples-vol) and restart this container, of course the  

Restart all nifi-processes and the ingestion should work.

## Indexing records by Elasticsearch
The records are finally stored in Elasticsearch data store under index `medical_reports_text` and using url endpoint `http://elasticsearch-1:9200`.
This operation is implemented by NiFi component `PutElasticsearchHttpRecord` with its configuration presented on the picture below.
The Elasticsearch user credentials need to be provided which in this example would be the built-in user `admin` with password `admin`.
When indexing the records as documents the record's primary key field `/docid` will be used as the document identifier in Elasticsearch.
Optionally, the default Date / Time / Timestamp Format can be overridden for corresponding fields being ingested.
In this example case, the Timestamp Format was overridden as `yyyy-MM-dd'T'HH:mm:ss.SSS`.
![es-writer-w1](./docs-assets/configure-es-writer-w1.png)

## Executing the workflow
Once the NiFi components are properly configured and required connectors and controllers are activated, one can run the ingestion pipeline.
To run the pipeline, one needs to select the workflow components and click on the run button ( **►** ) on the operations panel.
Similarly, to stop execution, click on the stop button ( **■** ).
At any moment, one can stop and resume execution either of the full workflow or individual components to interactively inspect or troubleshoot the data processing.
The figure below presents how to execute the current workflow.
![nifi-exec-w1](./docs-assets/nifi-exec-workflow-w1.png)

Assuming that the services are available to be accessed on the host machine `localhost`, one can check whether the records have been indexed by Elassticsearch directly in Kibana interface by navigating to `http://localhost:5601`.

Alternatively, one can run `curl` on local machine to check the number of documents ingested:
```
curl -s -XGET http://admin:admin@localhost:9200/medical_reports_text/_count | jq
```
with the expected response:
```
{
  "count": 259,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  }
}
```

# Ingesting text from PDF documents (DB → ES)
This workflow implements an extended version of the initial data ingestion pipeline.
This time, the documents are stored in the database in binary format and so the text needs to be extracted from them prior to being indexed in Elasticsearch.
The text extraction is handled by Apache Tika that is running as Tika Service (see: [description of all available services](./SERVICES.md)).
Figure below presents the full workflow.
![nifi-w2](./docs-assets/nifi-workflow-w2.png)

Please note that in contrast to the previous example, this one introduces a conditional flow. 
In case of a processing failure, the record (Flow File) in question will be routed via a corresponding error path.
This enables further inspecting and isolating invalid or unsupported payloads, such as when encountered by Tika a corrupted file instead of an actual document PDF file.

## Reading records from database
Similarly, as in the previous workflow, the records are read from the same database using the same database connector controller `DBCPConnectionPool-MTSamples`.
This time, the documents data are read from table `medical_reports_raw` and such columns are being queried: `docid, sampleid, dct, binarydoc`, where the `binarydoc` column contains the binary data of the documents.
However, this time we limit the database reader to fetch one row at once as configured in a single `QueryDatabaseTable` component (instead of two: `GenerateTableFetch` and `ExecuteSQLRecord`).
This is in order to have a more granular control over possibly failed documents by Tika that can be directly inspected and to avoid out-of-memory exceptions when a bulk of large scanned documents would be fetched at once.

The figure below presents the configuration of `GenerateTableFetch` NiFi component covering the above description.
![nifi-reader-w2](./docs-assets/configure-db-reader-w2.png)


## Extracting text from PDFs
The text extraction is implemented by Tika Service that exposes RESful API for processing the documents.
Given a binary document sent as a stream, it will return payload containing the extracted text with document metadata.

There are 4 NiFi components involved in this process:
1. `ExecuteScript-PrepareTikaContent` - prepares the payload to be sent to Tika Service,
2. `InvokeHTTP-QueryTika` - sends the document to Tika Service and received back the response in JSON,
3. `ExecuteScript-ParseTikaResponse` - parses the Tika JSON response.
4. `ExecuteGroovyScript-ConvertJsonToAvro` - parses the JSON content into AVRO record format.

Components (1), (3) and (4) execute custom Groovy scripts to parse the records (Flow Files).
These scripts are bundled with our custom Apache NiFi image and are available in [`../nifi/user-scripts`](../nifi/user-scripts) directory.

The key component (2) is a generic HTTP client for communication with RESTful services.
It sends the binary payload using `POST` method to `http://tika-service:8090/api/process` endpoint.
Please note that same instance of Tika Service can be used by different HTTP clients in multiple data pipelines.
See [the official Tika Service documentation](https://github.com/CogStack/tika-service/) for more information about the service and API use.
Figure below shows the configuration of the HTTP client. 
![configure-tika-w2](./docs-assets/configure-tika-w2.png)

Please note that these 4 components can be merged into a specialised component for communicating with Tika Service.

## Indexing records by Elasticsearch
This example uses the same configuration for `PutElasticsearchHttpRecord` component as before, but the records are now stored under `medical_reports_text_tika` index.

# Annotating free-text documents (DB → ES)
This workflow implements the NLP annotations ingestion pipeline based on the previous examples.
The documents are stored in the initial database in free-text format, but we are interested in extracting only the NLP annotations.
The annotations will extracted from free-text notes via NLP Service.
Finally, the annotations will be stored in Elasticsearch.

The annotations extraction is provided by MedCAT that is exposing NLP model functionality via MedCAT Service (see: [description of all available services](./SERVICES.md)).
Figure below presents the full workflow.
![nifi-w3](./docs-assets/nifi-workflow-w3.png)

## Reading records from database
The documents are being read from the database by NiFi components `GenerateTableFetch` and `ExecuteSQLRecord` with the same configuration as in the first example.
However, only the `docid, document, sampleid` columns are read being the relevant ones.

## Extracting NLP annotations from documents
The annotations extraction is implemented by MedCAT Service that exposes RESful API for processing the documents.
Given a document content encoded as JSON, it will return payload containing the extracted annotations.

There are 4 NiFi components involved in this process:
1. `ConvertAvroToJSON` - converts the AVRO records to JSON format using a generic format transcoder,
2. `ParseJSON-RequestContent-Bulk` - prepares the JSON payload for MedCAT Service,
3. `QueryNlpService-MedCAT-Bulk` - sends the bulk of documents in JSON format to MedCAT Service and receives back the annotations (bulk operation),
4. `ParseJSON-ResponseContent-Bulk` - parses the received annotations.

Components (2) and (4) execute custom Groovy scripts to parse the records (Flow Files).
These scripts are bundled with our custom Apache NiFi image and are available in [`../nifi/user-scripts`](../nifi/user-scripts) directory.

The key component (3) is a generic HTTP client for communication with RESTful services.
It sends the JSON payload using `POST` method to `http://nlp-medcat-medmen:5000/api/process_bulk` endpoint.
MedCAT Service will process the multiple documents simultaneously, i.e. in bulk mode.
Please note that same instance of MedCAT Service can be used by different HTTP clients in multiple data pipelines.
See [the official MedCAT Service documentation](https://github.com/CogStack/MedCATservice/) for more information about the service and API use.
Figure below shows the configuration of the HTTP client. 
![configure-medcart-w3](./docs-assets/configure-medcat-w3.png)

## Indexing annotations by Elasticsearch
This example uses similar configuration for `PutElasticsearchHttpRecord` component as before.
The annotations are now stored under `medical_reports_anns_medcat_medmen` index where the document identifier is specified by `document_annotation_id` field of the Flow File (it is being generated by the payload parsing script before).

# Annotating free-text documents (ES → ES)
This workflow implements a modified NLP annotations ingestion pipeline based on the previous example.
It is assumed that now free-text documents were already ingested into Elasticsearch.
Moreover, here we are interested in extracting the NLP annotations only from documents matching a specific query for Elasticsearch.
As before, the annotations will be stored in Elasticsearch.
Figure below presents the full workflow.
![nifi-w4](./docs-assets/nifi-workflow-w4.png)

## Reading documents from Elasticsearch
In this example, documents are read from the same Elasticsearch data store.
This is, the same one was used previously to store the documents, which were  indexed under `medical_reports_text` index.
The documents are fetched matching an example query `document:cancer`, i.e. the `document` field that will contain a `cancer` keyword.
Figure below presents the configuration of the Elasticsearch reader component `ScrollElasticsearchHttp`.
![nifi-w4](./docs-assets/configure-es-reader-w4.png)

## Extracting NLP annotations from documents
Similarly, the annotations extraction is implemented by MedCAT Service that exposes RESful API for processing the documents.

Since from Elasticsearch the records are received in JSON format, there is no need to perform parsing from AVRO format.
Hence, there are 3 NiFi components involved in this process:
1. `ExecuteGroovyScript-ConvertToNLP` - prepares the JSON payload for MedCAT Service,
2. `QueryNlpService-MedCAT-Bulk` - sends the bulk of documents in JSON format to MedCAT Service and receives back the annotations (bulk operation),
3. `ParseJSON-ResponseContent-Bulk` - parses the received annotations.

Components (1) and (3) execute custom Groovy scripts to parse the records (Flow Files).
The configuration of HTTP client (2) remains the same as before.

## Indexing annotations by Elasticsearch
This example uses similar configuration for `PutElasticsearchHttpRecord` component as before.
The annotations are now stored under `medical_reports_anns_medcat_medmen_cancer` index.
