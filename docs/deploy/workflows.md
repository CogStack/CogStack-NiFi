# Workflows

Our custom Apache NiFi image comes with 4 basic example template workflows bundled that available in [user templates](https://github.com/CogStack/CogStack-NiFi/tree/master/nifi/user-templates) in `./nifi` directory.
These are:
1. `OpenSearch_ingest_DB_to_ES` - performing ingestion of free-text notes from database to Elasticsearch, no pre-processing involved.
2. `OpenSearch_ingest_DB_to_ES_OCR` - performing ingestion of raw notes in PDF format from database to Elasticsearch, OCR involved using Tika-service.
3. `OpenSearch_ingest_annotate_DB_MedCATService_to_ES` - annotating the free-text notes using MedCAT, reading from database and storing in Elasticsearch.
4. `OpenSearch_ingest_annotate_ES_MedCATService_to_ES` - the same as (3) but reading notes from Elasticsearch.

If you are using Nifi with SSL mode (which is on by default as of the upgrade to version 1.15+), please note that all of these templates have SSL configured (SSLContext service controller being present), please make sure that you set the password(s) to the key/trust(store) for the templates to work.

There are more workflows available in the sections below

<span style="color: red"><strong> IMPORTANT:</strong></span> if you do not see some workflows in the NiFi Template Web interface then you will have to manually go to the `./nifi/user-templates` folder and upload whatever templates are missing, the reason for this is that NiFi keep its own available template(s) file separately and we do not update this as it will overwrite the user's own file.

<br>

## Used services
In the workflow examples, the following services are used:
- `samples-db` - storing the example input data,
- `nifi` - the actual Apache NiFi data pipeline engine with user interface,
- `elasticsearch-1` - for storing the resulting documents and annotations data, cluster of two instances.
- `elasticsearch-2` - second node 
- `tika-service` - extraction of text from binary documents,
- `nlp-medcat-service-production` - an example NLP application for extracting annotations from free-text.
- `cogstack-cohort` - CogStack-Cohort tool
- `ocr-service-1`/`ocr-service-2` - OCR service(s)

To deploy the above services, one can type in the `deploy` directory: 
```
make start-data-infra
make start-nlp-medcat
```

Please note that all the above services will be accessible by services within internal `cognet` Docker network while only some of them will be accessible from host machine.
Please refer to [SERVICES](./services.md) for a more detailed description of the available services and their deployment.

<br>

## Apache NiFi web user interface
Before start, please see [the official Apache NiFi guide on using the web user interface](https://nifi.apache.org/docs/nifi-docs/html/user-guide.html#User_Interface) that covers extensively the available functionality.

In this doc only the key aspects will be covered on using the bundled user templates with configuring and executing the flows.

Once deployed, the Apache-NiFi web interface will be accessible from the host (e.g. localhost) machine at `http://localhost:8080`.

To see all available user workflow templates navigate to **Templates** window by clicking the corresponding list item as presented on the figure below.
Following, to select an example workflow template to run, drag and drop the **template** button from the components toolbar panel to the main notepad window.
![template-w1](../_static/img/nifi-templates-w1.png)


Please note that all the available workflow templates that are bundled with our custom Apache NiFi image are available in [`../nifi/user templates`](https://github.com/CogStack/CogStack-NiFi/tree/master/nifi/user-templates) directory.
During normal work, the user has possibility to create and store own template workflows.
These workflows are represented as XML files and so can be easily further shared or modified.

The templates mentioned in the introduction section may REQUIRE some minor configuration such as adding the passwords to the ES connectors (u: `admin`, pw:`admin`) and to the SSLContext Service Controller,
the trust/key(store) password is `cogstackNifi`. 

Every time you make change to the SSL Service Controller you MUST verify/validate all the properties first, 

<br>

## Ingesting free-text documents (DB → ES)
This workflow implements a common data ingestion pipeline: reading from a database and storing the free-text data alongside selected structured fields into Elasticsearch.
The workflow was presented on the figure above.

<br>

### Reading records from database
Free-text data alongside available structured fields are read from `samples-db` database from `medical_reports_text` table. 
This operation is implemented by NiFi components: `GenerateTableFetch` and `ExecuteSQLRecord`,  where the configuration of the former component is described on the picture below.
The `docid` field is set as the primary key of the `medical_reports_text` table and is used persist the state of the last read record and to partition the records while reading.
![db-reader](../_static/img/configure-db-reader-w1.png)

<br>

### Configuring DB connector
However, apart from specifying the DB tables, the DB connector controller `DBCPConnectionPool-MTSamples` needs to configured and activated.
The example data is stored in `db_samples` database. 
User `test` with password `test` was created to connect to it.

Alongside the DB connector, other controllers used by the processors (i.e. record readers and writers) need to be activated too - all of this is illustrated on the picture below.
![db-reader-w1](../_static/img/configure-db-connector-w1.png)

<br>

#### Parameters to lookout for

The `DBCConnectionPool` controller service can be configured to operate with multiple DB types, you will need to configure them manually with the appropiate drivers and driver classes, the following configs can be used:
```
  PgSQL:
    - Database Connection URL: jdbc:postgresql://samples-db:5432/db_samples
    - Database Driver Class Name: org.postgresql.Driver
    - Database Driver Location(s): /opt/nifi/drivers/postgresql-42.6.0.jar
``` 
```
  MSSQL:
    - Database Connection URL: jdbc:sqlserver://cogstack-databank-db-mssql:1433;DatabaseName=MTSamples;encrypt=true;trustServerCertificate=true; 
    - Database Driver Class Name: com.microsoft.sqlserver.jdbc.SQLServerDriver
    - Database Driver Location(s): /opt/nifi/drivers/mssql-jdbc-11.2.0.jre8.jar
```

<b>Reminder:</b> the datbase driver location path is mounted on the NiFi container by default on service startup, `./nifi/drivers/:/opt/nifi/drivers/`, you may want to check the [nifi drivers folder](../../nifi/drivers/) for available drivers, and if you require other drivers, please copy the .jar files there and they will be available on the NiFi container during runtime (no NiFi service restart is required)

<br>

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
  - in the "PutElasticsearchRecord" process, change the "Identifier Record Path" from "/docid" to "/unique_id_column"

Additional steps may be required : delete current Db-samples container, then the volume (samples-vol) and restart this container, of course the  

Restart all nifi-processes and the ingestion should work.

<br>

## Indexing records by Elasticsearch
The records are finally stored in Elasticsearch data store under index `medical_reports_text` and using url endpoint `http://elasticsearch-1:9200`.
This operation is implemented by NiFi component `PutElasticsearchRecord` with its configuration presented on the picture below.
The Elasticsearch user credentials need to be provided which in this example would be the built-in user `admin` with password `admin`.
When indexing the records as documents the record's primary key field `/docid` will be used as the document identifier in Elasticsearch.
Optionally, the default Date / Time / Timestamp Format can be overridden for corresponding fields being ingested.
In this example case, the Timestamp Format was overridden as `yyyy-MM-dd'T'HH:mm:ss.SSS`.
![es-writer-w1](../_static/img/configure-es-writer-w1.png)

<br>

## Executing the workflow
Once the NiFi components are properly configured and required connectors and controllers are activated, one can run the ingestion pipeline.
To run the pipeline, one needs to select the workflow components and click on the run button ( **►** ) on the operations panel.
Similarly, to stop execution, click on the stop button ( **■** ).
At any moment, one can stop and resume execution either of the full workflow or individual components to interactively inspect or troubleshoot the data processing.
The figure below presents how to execute the current workflow.
![nifi-exec-w1](../_static/img/nifi-exec-workflow-w1.png)

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

<br>

## Ingesting text from PDF documents (DB → ES)
This workflow implements an extended version of the initial data ingestion pipeline.
This time, the documents are stored in the database in binary format and so the text needs to be extracted from them prior to being indexed in Elasticsearch.
The text extraction is handled by Apache Tika that is running as Tika Service (see: [description of all available services](./services.md)).
Figure below presents the full workflow.
![nifi-w2](../_static/img/nifi-workflow-w2.png)

Please note that in contrast to the previous example, this one introduces a conditional flow. 
In case of a processing failure, the record (Flow File) in question will be routed via a corresponding error path.
This enables further inspecting and isolating invalid or unsupported payloads, such as when encountered by Tika a corrupted file instead of an actual document PDF file.

<br>

## Reading records from database
Similarly, as in the previous workflow, the records are read from the same database using the same database connector controller `DBCPConnectionPool-MTSamples`.
This time, the documents data are read from table `medical_reports_raw` and such columns are being queried: `docid, sampleid, dct, binarydoc`, where the `binarydoc` column contains the binary data of the documents.
However, this time we limit the database reader to fetch one row at once as configured in a single `QueryDatabaseTable` component (instead of two: `GenerateTableFetch` and `ExecuteSQLRecord`).
This is in order to have a more granular control over possibly failed documents by Tika that can be directly inspected and to avoid out-of-memory exceptions when a bulk of large scanned documents would be fetched at once.

The figure below presents the configuration of `GenerateTableFetch` NiFi component covering the above description.
![nifi-reader-w2](../_static/img/configure-db-reader-w2.png)

<br>

## Extracting text from PDFs
The text extraction is implemented by Tika Service that exposes RESful API for processing the documents.
Given a binary document sent as a stream, it will return payload containing the extracted text with document metadata.

There are 4 NiFi components involved in this process:
1. `ExecuteScript-PrepareTikaContent` - prepares the payload to be sent to Tika Service,
2. `InvokeHTTP-QueryTika` - sends the document to Tika Service and received back the response in JSON,
3. `ExecuteScript-ParseTikaResponse` - parses the Tika JSON response.
4. `ExecuteGroovyScript-ConvertJsonToAvro` - parses the JSON content into AVRO record format.

Components (1), (3) and (4) execute custom Groovy scripts to parse the records (Flow Files).
These scripts are bundled with our custom Apache NiFi image and are available in [`./nifi/user-scripts`](https://github.com/CogStack/CogStack-Nifi/nifi/user-scripts).

The key component (2) is a generic HTTP client for communication with RESTful services.
It sends the binary payload using `POST` method to `http://tika-service:8090/api/process` endpoint.
Please note that same instance of Tika Service can be used by different HTTP clients in multiple data pipelines.
See [the official Tika Service documentation](https://github.com/CogStack/tika-service/) for more information about the service and API use.
Figure below shows the configuration of the HTTP client. 
![configure-tika-w2](../_static/img/configure-tika-w2.png)

Please note that these 4 components can be merged into a specialised component for communicating with Tika Service.

<br>

## Indexing records by Elasticsearch
This example uses the same configuration for `PutElasticsearchRecord` component as before, but the records are now stored under `medical_reports_text_tika` index.

<br>

## Annotating free-text documents (DB → ES)
This workflow implements the NLP annotations ingestion pipeline based on the previous examples.
The documents are stored in the initial database in free-text format, but we are interested in extracting only the NLP annotations.
The annotations will extracted from free-text notes via NLP Service.
Finally, the annotations will be stored in Elasticsearch.

The annotations extraction is provided by MedCAT that is exposing NLP model functionality via MedCAT Service (see: [description of all available services](./services.md)).
Figure below presents the full workflow.
![nifi-w3](../_static/img/nifi-workflow-w3.png)

## Reading records from database
The documents are being read from the database by NiFi components `GenerateTableFetch` and `ExecuteSQLRecord` with the same configuration as in the first example.
However, only the `docid, document, sampleid` columns are read being the relevant ones.

<br>

## Extracting NLP annotations from documents
The annotations extraction is implemented by MedCAT Service that exposes RESful API for processing the documents.
Given a document content encoded as JSON, it will return payload containing the extracted annotations.

There are several NiFi components involved in this process which stand out:
1. `ConvertAvroToJSON` - converts the AVRO records to JSON format using a generic format transcoder,
2. `ExecuteScript-ConvertRecordToMedCATinput` - prepares the JSON payload for MedCAT Service, this is Jython script, it has several configurable process properties:
  - `document_id_field\ = `docid` , the exact name of the unique Id column for the DB/ES record
  - `document_text_field` = `document`, field/column name containing free text 
  - `log_file_name` = `nlp_request_bulk_parse_medical_text.log`, creates a log file in the repo folder `/nifi/user-scripts/`
  - `log_invalid_records_to_file` = `True`, enable/disable logging errors to logfile with the above mentioned file name

  -  <span style="color: red">IMPORTANT:</span> all the original fields aside from doc id and text field that were returned by the ES search query will be placed in the "footer" dict key of each generated json record. 

3. `QueryNlpService-MedCAT-Bulk` - sends the bulk of documents in JSON format to MedCAT Service and receives back the annotations (bulk operation)

document_annotation_id
4. `ParseJSON-ResponseContent-Bulk` - parses the received annotations, custom Jython script, with a few important properties:

  - `annotation_id_field` = `id` , this should not be changed, it is the internal annotation ID generated by MedCAT Service, check a sample MedCAT service response before changing!
  - `document_id_field` = `docid`, the original unique document Id field, it is taken from the "footer" section of the response generated eariler by `ExecuteScript-ConvertRecordToMedCATinput`

  - `ignore_annotation_types` = `none` , comma separated values of annotation types to ignore
  - `original_record_fields_to_include` = `none` , if you want more fields to be included you can add them here, separated by commas, these values are taken from the "footer" section of the Json previously generated before bulk processing


The script creates an unique annotation ID field by concatenating the document_id_field and annotation_id_field, resulting in something like : \${document_id_field}_${annotation_id_field}, this is stored as a flowfile attribute, for each record (which represents one annotation record!)  under the name name 'document_annotation_id', it is later used in the 'PutElasticSearchJson' processor as the unique '_id' for ES, specified in the "Identifier Attribute" property of the processor.


Components (2) and (4) execute custom Jython scripts to parse the records (Flow Files).
These scripts are bundled with our custom Apache NiFi image and are available in [`../nifi/user-scripts`](https://github.com/CogStack/CogStack-Nifi/nifi/user-scripts).

The key component (3) is a generic HTTP client for communication with RESTful services.
It sends the JSON payload using `POST` method to `http://nlp-medcat-service-production:5000/api/process_bulk` endpoint.
MedCAT Service will process the multiple documents simultaneously, i.e. in bulk mode.
Please note that same instance of MedCAT Service can be used by different HTTP clients in multiple data pipelines.
See [the official MedCAT Service documentation](https://github.com/CogStack/MedCATservice/) for more information about the service and API use.
Figure below shows the configuration of the HTTP client. 
![configure-medcart-w3](../_static/img/configure-medcat-w3.png)

<br>

## Indexing annotations by Elasticsearch
This example uses similar configuration for `PutElasticsearchRecord` component as before.
The annotations are now stored under `medical_reports_anns_medcat_medmen` index where the document identifier is specified by `document_annotation_id` field of the Flow File (it is being generated by the payload parsing script before).

<br>

## Annotating free-text documents (ES → ES)
This workflow implements a modified NLP annotations ingestion pipeline based on the previous example.
It is assumed that now free-text documents were already ingested into Elasticsearch.
Moreover, here we are interested in extracting the NLP annotations only from documents matching a specific query for Elasticsearch.
As before, the annotations will be stored in Elasticsearch.
Figure below presents the full workflow.
![nifi-w4](../_static/img/nifi-workflow-w4.png)

<br>

## Reading documents from Elasticsearch
In this example, documents are read from the same Elasticsearch data store.
This is, the same one was used previously to store the documents, which were  indexed under `medical_reports_text` index.
The documents are fetched matching an example query `{"query":{"match_all":{"document":"cancer"}}}`, i.e. the `document` field that will contain a `cancer` keyword.
Figure below presents the configuration of the Elasticsearch reader component `SearchElasticsearch`.
![nifi-w4](../_static/img/configure-es-reader-w4.png)

<br>

## Extracting NLP annotations from documents
Similarly, the annotations extraction is implemented by MedCAT Service that exposes RESful API for processing the documents.

Since from Elasticsearch the records are received in JSON format, there is no need to perform parsing from AVRO format.
Hence, there are 3 NiFi components involved in this process:
1. `ExecuteGroovyScript-ConvertToNLP` - prepares the JSON payload for MedCAT Service,
2. `QueryNlpService-MedCAT-Bulk` - sends the bulk of documents in JSON format to MedCAT Service and receives back the annotations (bulk operation),
3. `ParseJSON-ResponseContent-Bulk` - parses the received annotations.

Components (1) and (3) execute custom Groovy scripts to parse the records (Flow Files).
The configuration of HTTP client (2) remains the same as before.

<br>

## Indexing annotations by Elasticsearch
This example uses similar configuration for `PutElasticsearchRecord` component as before.
The annotations are now stored under `medical_reports_anns_medcat_medmen_cancer` index.

<br>

## Sending automated emails
You can automate email sending by using the PutEmail processor. You will need an Outlook or Gmail account to do this, of course, you can also use your own SMTP server if one is present.
For Gmail you would need to generate an app password : for a [personal accounts](https://myaccount.google.com/apppasswords), for [workspace accounts](https://support.google.com/a/answer/2956491?hl=en).
For Outlook, please see : for [organisations](https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission) , for [personal accounts](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040) .

<br>

## CogStack Common Schema conversion and ingestion

As CogStack expands across institutions, there was a need to standardize the naming convention of the fields of most data structures we encountered. As such, we came up with our own strucutre based on the core fields found across organisations
, whilst respecting the OMOP data model.

The main files responsible for the schema mapping are the following:

`cogstack_common_schema_elasticsearch_index_mapping_template.json` - this is used by Elasticsearch, creates a mapping for a specified index. In general this does not need to be changed

`cogstack_common_schema_mapping.json` - <span style="color: red">IMPORTANT:</span> contains a JSON dict, here is where you can map your fields to the already predifined ones, as a sample we used the fields in the `medical_reports_text` DB and mapped them accordingly. 

`cogstack_common_schema_full.avsc` - this contains the Avro field specifications, including data types and so on. Usually this will not need changing.

The flow is displayed in the image below. Split into two sections, it does the following:

  - create index mapping, from the mapping declared in `cogstack_common_schema_elasticsearch_index_mapping_template.json`, you can change the index name in the `PutElasticsearchJson` processor by changing the `Index` property. <span style="color: red">IMPORTANT: this only needs to be run once. </span> 

  - in the bottom second half of the image we convert the current fields gotten from the DB to our own schema mapping, the resulting record being in Avro format, we then ingest the record into ES. The only two processors that need changing here are `GenerateTableFetch` and `PutElasticsearchRecord`.

![common-schema-workflow](../_static/img/cogstack_common_schema_full_workflow.png)

## Ingesting raw files from disk with extra optional data

NiFi template name: `Raw_file_read_from_disk_ocr_custom`

Journey of this workflow: 
1. execute python file that gets the record files from a folder which respects the yyyy/mm/dd pattern, each folder has a meta.csv file containing record data columns,
 the free text is however stored in raw format however and needs to be OCR-ed, with the file name being the record ID from the meta.csv file. 
We perform a lookup up and add the raw file content as a column to its corresponding record. 
The result of the script is a JSON with all the records within a folder passted to STDOUT (only one flowfile can be generated per processor call since it is stdout).
2. we add the content-type as "application/json" to each flowfile, for completness.
3. we split the list of dictionaries so that we from one flowfile containing X records we will have a flowfile per record (required as for OCR-ing, we can only do one file per request). This step may require additional adjustment, the SplitJson processor has a text char limit (2mil) that it can split. If we go above that we can't split, so adjust the `output_batch_size` parameter of the `ExecuteProcess-getFilesFromDisk` processor, contained within the `Command Arguments` property, at the very end.
4. we convert the JSON output to AVRO for easier manipulation within the NiFi Jython script, which transfers the record's fields as attributes of a flowfile for future use
, and the designated binary data column is set as the content of the new flowfile, so that we send binary data to the ocr service.
5. perform the OCR
6. execute another custom python script to format the JSON response to contain the original record data fields too, at this stage the record is ready for ingestion into ES!

Prerequisite if you want to test this template for testing, please run the following commands:
- `cd nifi/user-scripts/tests`
- `python3 generate_files.py`

The above assumes that you already have the NiFi container running, the script just generates some sample files.

## CogStack Cohort source file creation.

Check the "CogStack_Cohort_create_source_docs" template, you will have to manually upload the xml if it is not already there (presuming you already have a working installation).

This workflow will not work with sample data and annotations because there are not enough patients in the provided dataset.

Prerequisites for this workflow: 
1. make sure your concepts have been generated using a SNOMED model.
2. make sure you have enough patients (>1k)
3. you have the required fields in your patient records: age, ethnicity, date of death, date of birth, patient_id, doc_id, gender.
4. datetime fields must have the same format.

The script used for this process is located here: `nifi/user-scripts/cogstack_cohort_generate_data.py`. Please read all the info provided in the NiFi template.

