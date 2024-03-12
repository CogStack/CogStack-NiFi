import argparse
import json
import subprocess


if __name__ == "__main__":
    # parse the input parameters
    parser = argparse.ArgumentParser(description='ElasticSearch index initializer')
    parser.add_argument('--index', help='index name')
    parser.add_argument('--fields', help='a comma  separated list of fields (e.g.: field1:type1,field2:type2, ...)')
    parser.add_argument('--mapping-type', help='mapping type name (optional, default: \'_doc\')', default='_doc')
    parser.add_argument('--host', help='hostname')
    parser.add_argument('--port', help='port (optional, default: 9200)', default=9200)
    parser.add_argument('--user', help='user (optional)')
    parser.add_argument('--password', help='password (optional)')

    args = parser.parse_args()

    if args.index is None or args.fields is None or args.host is None:
        parser.print_usage()
        exit(0)

    try:
        user_credentials_string = ""
        if args.user is not None and args.password is not None:
            user_credentials_string = "-u %s:%s" % (args.user, args.password)

        curl_string = "curl -XPUT -H \"Content-Type: application/json\" http://%s:%s/%s %s -k -d " % (args.host,
                                                                                                      args.port,
                                                                                                      args.index,
                                                                                                      user_credentials_string)
        # parse the fields
        fields_mapping = {}
        for fd in args.fields.strip().split(','):
            fv_pair = fd.split(':')
            assert len(fv_pair) == 2

            fields_mapping[fv_pair[0]] = {'type': fv_pair[1]}

        body_payload = {"mappings": {args.mapping_type: {"properties": fields_mapping}}}
        full_curl_command = '%s \' %s \'' % (curl_string, json.dumps(body_payload))

        # run system-wide available curl instead of external library such as requests
        print("Running: ", full_curl_command)
        output = subprocess.check_output(full_curl_command, shell=True)

        # check the output
        print(output)

    except Exception as exception:
        print(exception)



