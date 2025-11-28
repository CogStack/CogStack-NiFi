import json
import logging
import os
import shutil
import ssl
import subprocess
import sys
import traceback
import urllib.request
from collections import defaultdict
from collections.abc import Callable, Iterable

logger = logging.getLogger(__name__)


def safe_delete_paths(paths: Iterable[str | os.PathLike], chmod_mode: int = 755) -> None:
    """
    Forcefully deletes a list of files or directories.
    - Makes files and dirs writable before deletion.
    - Removes both normal files and symlinks.
    - Recursively deletes directories.

    Args:
        paths: iterable of file or directory paths.
        chmod_mode: permission mode to apply before deleting.
    """

    for path in paths:
        if not os.path.exists(path):
            continue
        try:
            # Handle symlinks separately
            if os.path.islink(path) or os.path.isfile(path):
                os.chmod(path, chmod_mode)
                os.remove(path)

            if os.path.isdir(path):
                # Make sure everything inside is writable
                subprocess.run(["chmod", "-R", str(chmod_mode), path], check=False)
                shutil.rmtree(path, ignore_errors=False)
            logger.info(f"Deleted: {path}")
        except Exception as e:
            logger.error(f"Could not delete {path}: {e}")


def chunk(input_list: list, num_slices: int):
    for i in range(0, len(input_list), num_slices):
        yield input_list[i:i + num_slices]


# function to convert a dictionary to json and write to file (d: dictionary, fn: string (filename))
def dict2json_file(input_dict: dict, file_path: str) -> None:
    # write the json file
    with open(file_path, "a+", encoding="utf-8") as outfile:
        json.dump(input_dict, outfile, ensure_ascii=False, indent=None, separators=(",", ":"))


def dict2json_truncate_add_to_file(input_dict: dict, file_path: str) -> None:
    if os.path.exists(file_path):
        with open(file_path, "a+") as outfile:
            outfile.seek(outfile.tell() - 1, os.SEEK_SET)
            outfile.truncate()
            outfile.write(",")
            json_string = json.dumps(input_dict, separators=(",", ":"))
            # skip starting "{"
            json_string = json_string[1:]

            outfile.write(json_string)
    else:
        dict2json_file(input_dict, file_path)


def dict2jsonl_file(input_dict: dict | defaultdict, file_path: str) -> None:
    with open(file_path, 'a', encoding='utf-8') as outfile:
        for k,v in input_dict.items():
            o = {k: v}
            json_obj = json.loads(json.dumps(o))
            json.dump(json_obj, outfile, ensure_ascii=False, indent=None, separators=(',',':'))
            print('', file=outfile)


def get_logger(name: str, propagate: bool = True) -> logging.Logger:
    """Return a configured logger shared across all NiFi clients."""
    level_name = os.getenv("NIFI_LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        fmt = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            "%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(fmt)
        logger.addHandler(handler)
        logger.setLevel(level)
        logger.propagate = propagate
    return logger

def download_file_from_url(url: str, output_path: str, ssl_verify: bool = False, chunk_size: int = 8192) -> None:
    """Download a file from a URL to a local destination.

    Args:
        url (str): The URL of the file to download.
        output_path (str): The local file path to save the downloaded file.
        ssl_verify (bool): Whether to verify SSL certificates. Defaults to False.
        chunk_size (int): Size of data chunks to read at a time. Defaults to 8192 bytes.

    Raises:
        Exception: If the download fails.
    """

    try:
        context = ssl.create_default_context() if ssl_verify else ssl._create_unverified_context()

        with urllib.request.urlopen(url, context=context) as response, open(output_path, 'wb') as out_file:
            while chunk := response.read(chunk_size):
                out_file.write(chunk)

    except Exception as e:
        raise Exception(f"Failed to download file from {url} to {output_path}: {e}") from e


# -----------------------------------------------------------------------------------------------------------------
# Function for handling property parsing, used in NiFi processors mainly, but can beused elsewhere
# -----------------------------------------------------------------------------------------------------------------
def parse_value(value: str) -> str|int|float|bool:
    """Convert NiFi string property values into native Python types."""
    if isinstance(value, bool):
        return value

    val_str = str(value).strip()
    if val_str.lower() in ("true", "false"):
        return val_str.lower() == "true"
    if val_str.replace(".", "", 1).isdigit():
        return float(val_str) if "." in val_str else int(val_str)
    return value


# -----------------------------------------------------------------------------------------------------------------
# Safe execution wrapper with consistent error logging
# -----------------------------------------------------------------------------------------------------------------
def safe_execute(logger: logging.Logger, func, *args, **kwargs) -> Callable:
    """
    Executes a function safely, logging errors with full traceback.

    Args:
        logger (logging.Logger): Logger to write errors to.
        func (Callable): Function to execute.
        *args, **kwargs: Arguments passed to the function.

    Returns:
        The result of func(*args, **kwargs), or None on error.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.error(f"❌ Error during execution of {func.__name__}: {e}\n{traceback.format_exc()}")
        raise
