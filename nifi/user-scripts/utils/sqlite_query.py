import sqlite3

def connect_and_query(query: str, db_file_path: str, sql_script_mode: bool = False):
    """ 
    Executes whatever query.

    Args:
        query (string): your SQL query.
    """ 
    result = []
    sqlite_connection = None

    try:
        sqlite_connection = sqlite3.connect(db_file_path)
        cursor = sqlite_connection.cursor()
        if not sql_script_mode:
            cursor.execute(query)
            result = cursor.fetchall()
        else:
            cursor.executescript(query)
            sqlite_connection.commit()
        cursor.close()
    except sqlite3.Error as error:
        raise sqlite3.Error(error)
    finally:
        if sqlite_connection:
            sqlite_connection.close()

    return result

def check_db_exists(table_name: str, db_file_path: str):
    query = "PRAGMA table_info(" + table_name + ");"
    return connect_and_query(query=query, db_file_path=db_file_path)

def create_db_from_file(sqlite_file_path: str, db_file_path: str) -> sqlite3.Cursor:
    """

    Args:
        sqlite_file_path (str): sqlite db folder
        db_file_path (str): sqlite db file name

    Returns:
        sqlite3.Cursor: result of query
    """
    query = ""
    with open(sqlite_file_path, mode="r") as sql_file:
        query = sql_file.read()
    return connect_and_query(query=query, db_file_path=db_file_path,
        sql_script_mode=True)
