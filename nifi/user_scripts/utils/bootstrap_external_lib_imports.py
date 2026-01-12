import os
import sys
from pathlib import Path


def running_in_docker() -> bool:
    if os.path.exists("/.dockerenv"):
        return True
    try:
        with open("/proc/1/cgroup", "rt") as f:
            return any("docker" in line or "containerd" in line for line in f)
    except FileNotFoundError:
        return False


# Ensure the repo root (parent of the nifi package) is on the import path.
if running_in_docker():
    framework_dir = os.getenv(
        "NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY",
        "/opt/nifi/nifi-current/python/framework",
    )
    sys.path.insert(0, framework_dir)
else:
    repo_root = Path(__file__).resolve().parents[3]
    sys.path.insert(0, str(repo_root))
