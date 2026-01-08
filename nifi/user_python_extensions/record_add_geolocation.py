import sys

sys.path.insert(0, "/opt/nifi/user_scripts")

import csv
import json
import os
import shutil
import traceback
from zipfile import ZipFile

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView
from utils.generic import download_file_from_url, safe_delete_paths
from utils.helpers.base_nifi_processor import BaseNiFiProcessor


class CogStackJsonRecordAddGeolocation(BaseNiFiProcessor):
    """NiFi Python processor to add geolocation data to JSON records based on postcode lookup.
       We use https://www.getthedata.com/open-postcode-geo for geolocation.
       The schema of the file used is available at: https://www.getthedata.com/open-postcode-geo
       | Field                         | Possible Values                                                             
       |-------------------------------|---------------------------------------------------------------------
       | postcode                      | [outcode][space][incode]                                                    
       | status                        | live<br>terminated                                                          
       | usertype                      | small<br>large                                                              
       | easting                       | int<br>NULL                                                                 
       | northing                      | int<br>NULL                                                                 
       | positional_quality_indicator  | int                                                                         
       | country                       | England,Wales,Scotland,Northern Ireland,Channel Islands,Isle of Man  
       | latitude                      | decimal                                                                     
       | longitude                     | decimal                                                                     
       | postcode_no_space             | [outcode][incode]                                                           
       | postcode_fixed_width_seven    | *See comments*                                                              
       | postcode_fixed_width_eight    | *See comments*                                                             
       | postcode_area                 | [A-Z]{1,2}                                                                  
       | postcode_district             | [outcode]                                                                   
       | postcode_sector               | [outcode][space][number]                                                    
       | outcode                       | [outcode]                                                                   
       | incode                        | [incode]                                                                    

    """

    class Java:
        implements = ["org.apache.nifi.python.processor.FlowFileTransform"]

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.lookup_datafile_url: str = "https://download.getthedata.com/downloads/open_postcode_geo.csv.zip"
        self.lookup_datafile_path: str = "/opt/nifi/user_scripts/db/open_postcode_geo.csv"
        self.postcode_field_name: str = "address_postcode"
        self.geolocation_field_name: str = "address_geolocation"

        self.loaded_csv_file_rows: list[list] = []
        self.postcode_lookup_index: dict[str, int] = {}

        self._properties: list[PropertyDescriptor] = [
           PropertyDescriptor(name="lookup_datafile_url",
                               description="specify the URL for the geolocation lookup datafile zip",
                               default_value="https://download.getthedata.com/downloads/open" \
                               "_postcode_geo.csv.zip",
                               required=True, 
                               validators=[StandardValidators.URL_VALIDATOR]),
            PropertyDescriptor(name="lookup_datafile_path",
                               description="specify the local path for the geolocation lookup datafile csv",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR],
                               default_value="/opt/nifi/user_scripts/db/open_postcode_geo.csv"),
            PropertyDescriptor(name="postcode_field_name",
                               description="postcode field name in the records",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR],
                               default_value="address_postcode"),
            PropertyDescriptor(name="geolocation_field_name",
                    description="new field to store the geolocation coords,"
                                " if it is not present it will be created in each record",
                    required=True,
                    validators=[StandardValidators.NON_EMPTY_VALIDATOR],
                    default_value="address_postcode")
        ]
        
        self.descriptors: list[PropertyDescriptor] = self._properties

    @overrides
    def onScheduled(self, context: ProcessContext) -> None:
        """ Initializes processor resources when scheduled.
        Args:
            context (ProcessContext): The process context.
            This argument is required by the NiFi framework.
        """

        self.logger.debug("onScheduled() called — initializing processor resources")

        if self._check_geolocation_lookup_datafile():
            with open(self.lookup_datafile_path) as csv_file:
                csv_reader = csv.reader(csv_file)
                self.loaded_csv_file_rows = [row for row in csv_reader]

        self.postcode_lookup_index = {val[9]: idx
        for idx, val in enumerate(self.loaded_csv_file_rows)}

    def _check_geolocation_lookup_datafile(self) -> bool:
        """ Downloads the geolookup csv file for UK postcodes.

        Raises:
            e: file not found

        Returns:
            bool: file exists or not
        """

        base_output_extract_dir_path: str = "/opt/nifi/user_scripts/db"
        output_extract_dir_path: str = os.path.join(base_output_extract_dir_path, "open_postcode_geo")
        output_download_path: str = os.path.join(base_output_extract_dir_path, "open_postcode_geo.zip")
        datafile_csv_initial_path: str = os.path.join(output_extract_dir_path, "open_postcode_geo.csv")
        file_found: bool = False

        if os.path.exists(self.lookup_datafile_path):
            self.logger.info(f"geolocation lookup datafile already exists at {self.lookup_datafile_path}")
            file_found = True
        else:
            try:
                if os.path.exists(output_download_path) is False and os.path.isfile(self.lookup_datafile_path) is False:
                    download_file_from_url(self.lookup_datafile_url, output_download_path, ssl_verify=False)
                    self.logger.debug(f"downloaded geolocation lookup datafile to {self.lookup_datafile_path}")

                    if output_download_path.endswith('.zip'):
                        with ZipFile(output_download_path, 'r') as zip_ref:
                            zip_ref.extractall(output_extract_dir_path)
                            self.logger.debug(f"extracted geolocation lookup datafile to {output_extract_dir_path}")
                else:
                    self.logger.debug(f"file {self.lookup_datafile_path} already exists.... skipping download")

                if os.path.exists(datafile_csv_initial_path) and datafile_csv_initial_path != self.lookup_datafile_path:
                    self.logger.debug(f"geolocation lookup datafile found at {self.lookup_datafile_path} \
                                        after extraction")
                    shutil.copy2(datafile_csv_initial_path, self.lookup_datafile_path)
                    self.logger.debug(f"copied geolocation lookup datafile to {self.lookup_datafile_path}")
                file_found = True
            
            except Exception as e:
                self.logger.error(f"failed to download geolocation lookup datafile: {str(e)}")
                traceback.print_exc()
                raise e

        # cleanup downloaded files
        safe_delete_paths([output_download_path, output_extract_dir_path])

        return file_found

    @overrides
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        """ Transforms the input FlowFile by adding geolocation data based on postcode lookup.
        Args:
            context (ProcessContext): The process context.
            flowFile (JavaObject): The input FlowFile to be transformed.
        Returns:
            FlowFileTransformResult: The result of the transformation, including updated attributes and contents.
        Raises:
            Exception: If any error occurs during processing.
        
        NOTE: the input json should be small enough to fit into memory otherwise it might cause memory issues, 
              keep it < 20MB, under 20k records (depending on record size).
              Use SplitRecord processor to split large files into smaller chunks before processing.
        """

        try:
            self.process_context: ProcessContext = context
            self.set_properties(context.getProperties())

            input_raw_bytes: bytes = flowFile.getContentsAsBytes()

            records: dict | list[dict] = json.loads(input_raw_bytes.decode("utf-8"))

            valid_records: list[dict] = []
            error_records: list[dict] = []

            if isinstance(records, dict):
                records = [records]

            if self.postcode_lookup_index:
                for record in records:
                    if self.postcode_field_name in record:
                        _postcode = str(record[self.postcode_field_name]).replace(" ", "")
                        _data_col_row_idx = self.postcode_lookup_index.get(_postcode, -1)

                        if _data_col_row_idx != -1:
                            _selected_row = self.loaded_csv_file_rows[_data_col_row_idx]
                            _lat, _long = str(_selected_row[7]).strip(), str(_selected_row[8]).strip()
                            try:
                                record[self.geolocation_field_name] = {
                                    "lat": float(_lat),
                                    "lon": float(_long)
                                }
                            except ValueError:
                                self.logger.debug(f"invalid lat/long values for postcode {_postcode}: {_lat}, {_long}")
                                error_records.append(record)
                    valid_records.append(record)
            else:
                raise FileNotFoundError("geolocation lookup datafile is not available and data was not loaded, " \
                                        "please check URLs")

            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
            attributes["mime.type"] = "application/json"

            if error_records:
                attributes["record.count.errors"] = str(len(error_records))
            attributes["record.count"] = str(len(valid_records))

            return FlowFileTransformResult(
                relationship="success",
                attributes=attributes,
                contents=json.dumps(valid_records).encode("utf-8"),
            )
        except Exception as exception:
            self.logger.error("Exception during flowfile processing:\n" + traceback.format_exc())
            return self.build_failure_result(flowFile, exception)
