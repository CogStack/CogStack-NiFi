# Configuration file for jupyter-hub
# source : https://github.com/jupyterhub/jupyterhub-deploy-docker/blob/main/basic-example/jupyterhub_config.py

import os
import sys
import docker
import dockerspawner
import traceback
#import traitlets
from jupyterhub.auth import LocalAuthenticator
from nativeauthenticator import NativeAuthenticator
from traitlets.config import Config


class LocalNativeAuthenticator(NativeAuthenticator, LocalAuthenticator):
    pass


DOCKER_NOTEBOOK_IMAGE = os.getenv("DOCKER_NOTEBOOK_IMAGE", "cogstacksystems:jupyterhub/singleuser:latest-amd64")

# JupyterHub requires a single-user instance of the Notebook server, so we
# default to using the `start-singleuser.sh` script included in the
# jupyter/docker-stacks *-notebook images as the Docker run command when
# spawning containers.  Optionally, you can override the Docker run command
# using the DOCKER_SPAWN_CMD environment variable.
SPAWN_CMD = os.environ.get("DOCKER_SPAWN_CMD", "start-singleuser.sh")

# Connect containers to this Docker network
# IMPORTANT, THIS MUST MATCH THE NETWORK DECLARED in "services.yml", by default: "cogstack-net"
NETWORK_NAME = os.environ.get("DOCKER_NETWORK_NAME", "cogstack-net")

# The IP address or hostname of the JupyterHub container in the Docker network
HUB_CONTAINER_IP_OR_NAME = os.environ.get("DOCKER_JUPYTER_HUB_CONTAINER_NAME", "cogstack-jupyter-hub")

# The timeout in seconds after which the idle notebook container will be shutdown
NOTEBOOK_IDLE_TIMEOUT = int(os.environ.get("DOCKER_NOTEBOOK_IDLE_TIMEOUT", "7200"))

SELECT_NOTEBOOK_IMAGE_ALLOWED = str(os.environ.get("DOCKER_SELECT_NOTEBOOK_IMAGE_ALLOWED", "false")).lower()

RUN_IN_DEBUG_MODE = str(os.environ.get("DOCKER_NOTEBOOK_DEBUG_MODE", "false")).lower()

# Explicitly set notebook directory because we"ll be mounting a host volume to
# it.  Most jupyter/docker-stacks *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
NOTEBOOK_DIR = os.environ.get("DOCKER_NOTEBOOK_DIR", "/home/jovyan/work")
SHARED_CONTENT_DIR = os.environ.get("DOCKER_SHARED_DIR", "/home/jovyan/scratch")
#WORK_DIR = os.environ.get("DOCKER_JUPYTER_WORK_DIR", "/lab/workspaces/auto-b/tree/" + str(NOTEBOOK_DIR.split("/")[-1]))
WORK_DIR = "/lab/"

ENV_PROXIES = {
    "HTTP_PROXY": os.environ.get("HTTP_PROXY", ""),
    "HTTPS_PROXY": os.environ.get("HTTPS_PROXY", ""),
    "NO_PROXY": ",".join(list(filter(len, os.environ.get("NO_PROXY", "").split(",") + [HUB_CONTAINER_IP_OR_NAME]))),
    "http_proxy": os.environ.get("HTTP_PROXY", os.environ.get("http_proxy", "")),
    "https_proxy": os.environ.get("HTTPS_PROXY", os.environ.get("https_proxy", "")),
    "no_proxy": ",".join(list(filter(len, os.environ.get("no_proxy", "").split(",") + [HUB_CONTAINER_IP_OR_NAME]))),
}

os.environ["NO_PROXY"] = ""
os.environ["no_proxy"] = ""
os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""
os.environ["http_proxy"] = ""   
os.environ["https_proxy"] = ""

c: Config = get_config()

# Spawn containers from this image
# Either use the CoGstack one from the repo which is huge and contains all the stuff needed or,
# use the default official one which is clean.
c.DockerSpawner.image = DOCKER_NOTEBOOK_IMAGE

c.DockerSpawner.use_internal_ip = True
c.DockerSpawner.network_name = NETWORK_NAME
# Pass the network name as argument to spawned containers
c.DockerSpawner.extra_host_config = {"network_mode": NETWORK_NAME}

# # Mount the real users Docker volume on the host to the notebook user"s
# # notebook directory in the container
c.DockerSpawner.volumes = {"jupyterhub-user-{username}": NOTEBOOK_DIR, "jupyter-hub-shared-scratch": SHARED_CONTENT_DIR}

# volume_driver is no longer a keyword argument to create_container()

# Remove containers once they are stopped
c.DockerSpawner.remove = False


if SELECT_NOTEBOOK_IMAGE_ALLOWED == "true":
    # c.DockerSpawner.image_whitelist has been deprecated for allowed_images
    c.DockerSpawner.allowed_images = {
        "minimal": "jupyterhub/singleuser:latest-amd64",
        "cogstack": "cogstacksystems/jupyter-singleuser:latest-amd64",
        "cogstack-gpu": "cogstacksystems/jupyter-singleuser-gpu:latest-amd64"
    }
    # https://github.com/jupyterhub/dockerspawner/issues/423
    c.DockerSpawner.remove = True

if RUN_IN_DEBUG_MODE == "true":
    # For debugging arguments passed to spawned containers
    c.DockerSpawner.debug = True
    c.Spawner.debug = True
    # Enable debug-logging of the single-user server
    c.LocalProcessSpawner.debug = True


# Spawn single-user servers as Docker containers
class DockerSpawner(dockerspawner.DockerSpawner):
    def start(self):
        # username is self.user.name
        self.volumes = {"jupyterhub-user-{}".format(self.user.name): NOTEBOOK_DIR}

        # Mount the real users Docker volume on the host to the notebook user"s
        # # notebook directory in the container
        #self.volumes = {f"jupyterhub-user-{self.user.name}": NOTEBOOK_DIR, "jupyter-hub-shared-scratch": SHARED_CONTENT_DIR}
        
        if self.user.name not in whitelist:
            whitelist.add(self.user.name)
            with open(userlist_path, "a") as f:
                f.write("\n")
                f.write(self.user.name)

        if self.user.name in list(team_map.keys()):
            for team in team_map[self.user.name]:
                team_dir_path = os.path.join(SHARED_CONTENT_DIR, team)
                self.volumes["jupyterhub-team-{}".format(team)] = {
                    "bind": team_dir_path,
                    "mode": "rw",  # or ro for read-only
                }

        # this is a temporary fix, need to actually check permissions
        self.mem_limit = resource_allocation_user_ram_limit
        self.post_start_cmd = "chmod -R 777 " + SHARED_CONTENT_DIR

        return super().start()


def pre_spawn_hook(spawner: DockerSpawner):
    #username = spawner.user.name
    #spawner.environment["GREETING"] = f"Hello {username}"
    try:
        for key, value in ENV_PROXIES.items():
            spawner.environment[str(key)] = str(value)
        with open("/home/jovyan/test.txt", "w+") as f:
            for key, value in ENV_PROXIES.items():
                f.write("export" + " " + str(key) + "=" + str(value) + "\n")
    except Exception:
        traceback.print_exc()


"""
    def pre_spawn_hook(spawner):
        username = str(spawner.user.name).lower()
        try:
            pwd.getpwnam(username)
        except KeyError:
            subprocess.check_call(["useradd", "-ms", "/bin/bash", username])
"""


c.Spawner.default_url = WORK_DIR
c.Spawner.pre_spawn_hook = pre_spawn_hook

#c.Spawner.ip = "127.0.0.1"

# This is buggy, setting the HTTP(s)_PROXY & NO_PROXY variables via pre/post
#  spawn hook is better
#c.Spawner.environment = ENV_PROXIES

# AUTHENTICATION
#c.Authenticator.allowed_users = {"admin"}
c.Authenticator.admin_users = admin = {"admin"}

# By default all users that make sign up on Native Authenticator
# need an admin approval so they can actually log in the system.
c.Authenticator.open_signup = False

c.NotebookApp.allow_root = False

c.LocalAuthenticator.create_system_users = True
c.SystemdSpawner.dynamic_users = True
c.PAMAuthenticator.admin_groups = {"wheel"}
c.Authenticator.allowed_users = whitelist = set()

#c.Authenticator.manage_groups = True
#c.Authenticator.allow_all = True

curr_dir = os.path.dirname(__file__)

# Get active users
userlist_path = os.path.join(curr_dir, "userlist")
teamlist_path = os.path.join(curr_dir, "teamlist")

# Resource allocation env vars
# RAM - GB of ram, CPU - num of cores
resource_allocation_user_cpu_limit = os.environ.get("RESOURCE_ALLOCATION_USER_CPU_LIMIT", "2")
resource_allocation_user_ram_limit = os.environ.get("RESOURCE_ALLOCATION_USER_RAM_LIMIT", "2.0G")
resource_allocation_admin_cpu_limit = os.environ.get("RESOURCE_ALLOCATION_ADMIN_CPU_LIMIT", "2")
resource_allocation_admin_ram_limit = os.environ.get("RESOURCE_ALLOCATION_ADMIN_RAM_LIMIT", "4.0G")


def per_user_limit(role):
    ram_limits = {"user": (int(resource_allocation_user_cpu_limit), resource_allocation_user_ram_limit),
                   "admin": (int(resource_allocation_admin_cpu_limit), resource_allocation_admin_ram_limit)}
    return ram_limits.get(role)



# Spawn single-user servers as Docker containers
c.JupyterHub.spawner_class = DockerSpawner

# set DockerSpawner args
c.DockerSpawner.extra_create_kwargs.update({"command": SPAWN_CMD})
# c.DockerSpawner.extra_create_kwargs.update({ "volume_driver": "local" })
c.DockerSpawner.extra_create_kwargs = {"user": "root"}

c.DockerSpawner.notebook_dir = NOTEBOOK_DIR

with open(userlist_path) as f:
    for line in f:
        if not line:
            continue
        parts = line.split()
        # in case of newline at the end of userlist file
        if len(parts) >= 1:
            name = str(parts[0]).lower()
            role = "user"

            if (len(parts) > 1):
                role = parts[1]
            whitelist.add(name)
            if len(parts) > 1 and role == "admin":
                admin.add(name)

            c.Spawner.mem_limit = c.SwarmSpawner.mem_limit = c.DockerSpawner.mem_limit = per_user_limit(role)[1]
            c.Spawner.cpu_limit = c.SwarmSpawner.cpu_limit = c.DockerSpawner.cpu_limit = per_user_limit(role)[0]

            c.Spawner.cpu_guarantee = c.SwarmSpawner.cpu_guarantee = c.DockerSpawner.cpu_guarantee = 1
            c.Spawner.mem_guarantee = c.SwarmSpawner.mem_guarantee = c.DockerSpawner.mem_guarantee = "1.0G"

            prev_conf = c.DockerSpawner.extra_host_config
            prev_conf.update({"mem_limit": c.DockerSpawner.mem_limit})

            c.DockerSpawner.extra_host_config = prev_conf

# Get team memberships
team_map = {user: set() for user in whitelist}
with open(teamlist_path) as f:
    for line in f:
        if not line:
            continue
        parts = line.split()
        if len(parts) > 1:
            team = parts[0]
            members = set(parts[1:])
            for member in members:
                team_map[member].add(team)

gpu_support_enabled = os.environ.get("DOCKER_ENABLE_GPU_SUPPORT", "false")

if gpu_support_enabled.lower() == "true":
    c.DockerSpawner.extra_host_config = {
        "device_requests": [
            docker.types.DeviceRequest(
                count=-1,
                capabilities=[["gpu", "utility", "compute", "video"]]
            ),
        ],
    }

c.DockerSpawner.environment = {
    "GRANT_SUDO": "1",
    "UID": "0", # workaround https://github.com/jupyter/docker-stacks/pull/420,
}

c.DockerSpawner.environment.update(ENV_PROXIES)

# Alternative, use: "nativeauthenticator.NativeAuthenticator"
#c.JupyterHub.authenticator_class = LocalNativeAuthenticator

c.FirstUseAuthenticator.create_users = True
c.JupyterHub.authenticator_class = "firstuseauthenticator.FirstUseAuthenticator" 



# User containers will access hub by container name on the Docker network
c.JupyterHub.ip = "0.0.0.0"
c.JupyterHub.hub_ip = "0.0.0.0"
c.JupyterHub.hub_connect_ip = HUB_CONTAINER_IP_OR_NAME


jupyter_hub_port = int(os.environ.get("JUPYTERHUB_INTERNAL_PORT", 8888))
jupyter_hub_proxy_api_port = int(os.environ.get("JUPYTERHUB_INTERNAL_PROXY_API_PORT", 8887))
jupyter_hub_ssl_port = int(os.environ.get("JUPYTERHUB_SSL_PORT", 443))
jupyter_hub_proxy_url = str(os.environ.get("JUPYTERHUB_PROXY_API_URL", "http://127.0.0.1:"))

c.ConfigurableHTTPProxy.api_url = jupyter_hub_proxy_url + str(jupyter_hub_proxy_api_port)
# ideally a private network address
# c.JupyterHub.proxy_api_ip = "10.0.1.4"
# c.JupyterHub.proxy_api_port = jupyter_hub_proxy_api_port

# TLS config
c.JupyterHub.port = jupyter_hub_ssl_port
c.JupyterHub.ssl_key = os.environ.get("SSL_KEY", "/srv/jupyterhub/root-ca.key")
c.JupyterHub.ssl_cert = os.environ.get("SSL_CERT", "/srv/jupyterhub/root-ca.pem")

# Persist hub data on volume mounted inside container
data_dir = os.environ.get("DATA_VOLUME_CONTAINER", "")

c.JupyterHub.cookie_secret_file = data_dir + "jupyterhub_cookie_secret"

c.JupyterHub.services = []

if NOTEBOOK_IDLE_TIMEOUT > 0:
    c.JupyterHub.services.append({
        "name": "idle-culler",
        "admin": True,
        "command": [
            sys.executable,
            "-m", "jupyterhub_idle_culler",
            f"--timeout={NOTEBOOK_IDLE_TIMEOUT}",
        ],
    })

#------------------------------------------------------------------------------
# Application(SingletonConfigurable) configuration
#------------------------------------------------------------------------------
# This is an application.

c.JupyterHub.pid_file = "/srv/jupyterhub/jupyter_hub.pid"
c.ConfigurableHTTPProxy.pid_file = "/srv/jupyterhub/jupyter_hub_proxy.pid"

# The date format used by logging formatters for %(asctime)s
#  Default: "%Y-%m-%d %H:%M:%S"
# c.Application.log_datefmt = "%Y-%m-%d %H:%M:%S"   

# The Logging format template
#  Default: "[%(name)s]%(highlevel)s %(message)s"
# c.Application.log_format = "[%(name)s]%(highlevel)s %(message)s"

jupyter_log_level = os.environ.get("JUPYTERHUB_LOG_LEVEL", "INFO")

# Set the log level by value or name.
#  Choices: any of [0, 10, 20, 30, 40, 50, "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]
#  Default: INFO
c.Application.log_level = jupyter_log_level

# Instead of starting the Application, dump configuration to stdout
#  Default: False
# c.Application.show_config = False

# Instead of starting the Application, dump configuration to stdout (as JSON)
#  Default: False
# c.Application.show_config_json = False

# Let"s start with the least privilege, especially on a single host having limited resources
c.JupyterHub.allow_named_servers = False

# Timeout (in seconds) to wait for spawners to initialize
# 
#  Checking if spawners are healthy can take a long time if many spawners are
#  active at hub start time.
#
#  If it takes longer than this timeout to check, init_spawner will be left to
#  complete in the background and the http server is allowed to start.
#          
#  A timeout of -1 means wait forever, which can mean a slow startup of the Hub
#  but ensures that the Hub is fully consistent by the time it starts responding
#  to requests. This matches the behavior of jupyterhub 1.0.
#  
#  .. versionadded: 1.1.0
#  Default: 10
c.JupyterHub.init_spawners_timeout = 720

# Timeout (in seconds) before giving up on a spawned HTTP server
#  
#  Once a server has successfully been spawned, this is the amount of time we
#  wait before assuming that the server is unable to accept connections.
#  Default: 30
c.Spawner.http_timeout = 720

# Timeout (in seconds) before giving up on starting of single-user server.
#  
#  This is the timeout for start to return, not the timeout for the server to
#  respond. Callers of spawner.start will assume that startup has failed if it
#  takes longer than this. start should return when the server process is started
#  and its location is known.
#  Default: 60
c.Spawner.start_timeout = 720


#------------------------------------------------------------------------------
# LocalProcessSpawner configuration
#------------------------------------------------------------------------------

# A Spawner that just uses Popen to start local processes as users.
# 
# Requires users to exist on the local system.
# 
# This is the default spawner for JupyterHub.

# Seconds to wait for process to halt after SIGINT before proceeding to SIGTERM
c.LocalProcessSpawner.interrupt_timeout = 120

# Seconds to wait for process to halt after SIGKILL before giving up
c.LocalProcessSpawner.kill_timeout = 120

# Seconds to wait for process to halt after SIGTERM before proceeding to SIGKILL
c.LocalProcessSpawner.term_timeout = 120
