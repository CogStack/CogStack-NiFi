import os
import sqlite3


db_folder = os.getenv("USER_SCRIPT_DB_DIR", "./db/")
db_file_name = "index_name.db"


def connect_db(query):
    try:
        sqlite_connection = sqlite3.connect(os.path.join(db_folder, db_file_name))
        cursor = sqlite_connection.cursor()
        sql_query = query
        cursor.execute(sql_query)
        cursor.close()
    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)
    finally:
        if sqlite_connection:
            sqlite_connection.close()


connect_db("select sqlite_version();")



