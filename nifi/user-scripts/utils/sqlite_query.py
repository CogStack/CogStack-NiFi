from ast import List
import sqlite3


def connect_and_query(query: str, db_file_path: str, sqlite_connection: sqlite3.Connection = None, sql_script_mode: bool = False, keep_conn_open=False) -> List:
    """  Executes whatever query.

    Args:
        query (str): your SQL query.
        db_file_path (str): file path to sqlite db
        sql_script_mode (bool, optional): if it is transactional or just a fetch query . Defaults to False.

    Raises:
        sqlite3.Error: sqlite error.

    Returns:
        List: List of results
    """

    result = []

    try:
        if sqlite_connection is not None:
            sqlite_connection = sqlite_connection
        else:
            sqlite_connection = create_connection(db_file_path)
            sqlite_connection.execute('pragma journal_mode=wal')

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
        if sqlite_connection and not keep_conn_open:
            sqlite_connection.close()

    return result


def create_connection(db_file_path: str, read_only_mode=False) -> sqlite3.Connection:

    connection_str = "file:" + str(db_file_path)

    if read_only_mode:
        connection_str += "?mode=ro"

    return sqlite3.connect(connection_str, uri=True)


def query_with_connection(query: str, sqlite_connection: sqlite3.Connection) -> List:
    result = []
    try:
        cursor = sqlite_connection.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
    except sqlite3.Error as error:
        raise sqlite3.Error(error)
    return result


def check_db_exists(table_name: str, db_file_path: str):
    query = "PRAGMA table_info(" + table_name + ");"
    return connect_and_query(query=query, db_file_path=db_file_path)


def create_db_from_file(sqlite_file_path: str, db_file_path: str) -> sqlite3.Cursor:
    """ Creates db from .sqlite schema/query file

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
