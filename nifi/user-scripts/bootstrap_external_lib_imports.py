import sys
import os


def running_in_docker() -> bool:
    if os.path.exists("/.dockerenv"):
        return True
    try:
        with open("/proc/1/cgroup", "rt") as f:
            return any("docker" in line or "containerd" in line for line in f)
    except FileNotFoundError:
        return False


# we need to add it to the sys imports
if running_in_docker():
    sys.path.insert(0, "/opt/nifi/user-scripts")
else:
    sys.path.insert(0, "./user-scripts")
