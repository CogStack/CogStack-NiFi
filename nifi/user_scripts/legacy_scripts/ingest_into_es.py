#!/usr/bin/env python3

"""
Ingest PostgreSQL database samples into Elasticsearch
"""

import psycopg2
from elasticsearch import Elasticsearch

es = Elasticsearch(["http://0.0.0.0:9200"], http_auth=("admin", "admin"))
con = psycopg2.connect(database="db_samples", user="test", password="test",
                       host="0.0.0.0", port="5555")
tables = ["patients", "medical_reports_text", "encounters", "observations"]


def _get_column_names_and_data(table_name):
    cur = con.cursor()
    cur.execute("SELECT * FROM {0}".format(table_name))

    rows = cur.fetchall()

    column_names = [cur.description[i][0] for i in range(len(cur.description))]

    return rows, column_names


def _insert_table_into_es(table_name):
    rows, columns_names = _get_column_names_and_data(table_name)

    for idx, row in enumerate(rows):
        body = dictionary = dict(zip(columns_names, row))
        index_name = "samples_%s" % table_name

        es.index(index=index_name, id=idx, body=body)


def main():
    for table in tables:
        print("Indexing table", table)
        _insert_table_into_es(table)
        print("Completed", table)


if __name__ == "__main__":
    main()
