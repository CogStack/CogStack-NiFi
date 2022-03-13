# Configuration file for jupyter-hub
# source : https://github.com/jupyterhub/jupyterhub-deploy-docker/blob/master/jupyterhub_config.py

import os
import pwd
import subprocess
import dockerspawner 
from jupyterhub.auth import LocalAuthenticator
from nativeauthenticator import NativeAuthenticator

class LocalNativeAuthenticator(NativeAuthenticator, LocalAuthenticator):
  pass

def pre_spawn_hook(spawner):
    username = spawner.user.name
    try:
        pwd.getpwnam(username)
    except KeyError:
        subprocess.check_call(["useradd", "-ms", "/bin/bash", username])

c = get_config()


# Spawn containers from this image
# Either use the CoGstack one from the repo which is huge and contains all the stuff needed or,
# use the default official one which is clean.
c.DockerSpawner.image = os.getenv("DOCKER_NOTEBOOK_IMAGE", "jupyterhub/singleuser:latest")

# JupyterHub requires a single-user instance of the Notebook server, so we
# default to using the `start-singleuser.sh` script included in the
# jupyter/docker-stacks *-notebook images as the Docker run command when
# spawning containers.  Optionally, you can override the Docker run command
# using the DOCKER_SPAWN_CMD environment variable.
spawn_cmd = os.environ.get("DOCKER_SPAWN_CMD", "start-singleuser.sh")

c.DockerSpawner.extra_create_kwargs.update({"command": spawn_cmd})

# Connect containers to this Docker network
# IMPORTANT, THIS MUST MATCH THE NETWORK DECLARED in "services.yml", by default: "cogstack-net"
network_name = os.environ.get("DOCKER_NETWORK_NAME", "cogstack-net")

c.DockerSpawner.use_internal_ip = True
c.DockerSpawner.network_name = network_name
# Pass the network name as argument to spawned containers
c.DockerSpawner.extra_host_config = { "network_mode": network_name}

# Explicitly set notebook directory because we"ll be mounting a host volume to
# it.  Most jupyter/docker-stacks *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
notebook_dir = os.environ.get("DOCKER_NOTEBOOK_DIR") or "/home/jovyan/work"

shared_content_dir = os.environ.get("DOCKER_SHARED_DIR", "/home/jovyan/scratch")

#c.DockerSpawner.notebook_dir = notebook_dir
# Mount the real user"s Docker volume on the host to the notebook user"s
# notebook directory in the container
c.DockerSpawner.volumes = { "jupyterhub-user-{username}": notebook_dir, "jupyter-hub-shared-scratch": shared_content_dir}
# volume_driver is no longer a keyword argument to create_container()
# c.DockerSpawner.extra_create_kwargs.update({ "volume_driver": "local" })

#c.DockerSpawner.image_whitelist = {
#    'cogstacksystems-jupyterhub': 'cogstacksystems/jupyter-singleuser:latest',
#    'cogstacksystems-jupyterhub-dev': 'cogstacksystems/jupyter-singleuser:dev-latest'
#}

# Remove containers once they are stopped
c.DockerSpawner.remove_containers = False
c.DockerSpawner.remove = False
# For debugging arguments passed to spawned containers
c.DockerSpawner.debug = True
c.Spawner.debug = True

# Enable debug-logging of the single-user server
c.LocalProcessSpawner.debug = True

# AUTHENTICATION
#c.Spawner.pre_spawn_hook = pre_spawn_hook
#c.Spawner.ip = "127.0.0.1"
c.DockerSpawner.environment = {"NO_PROXY" : os.environ["NO_PROXY"], "HTTP_PROXY" : os.environ["HTTP_PROXY"], "HTTPS_PROXY" : os.environ["HTTPS_PROXY"]}
c.Spawner.environment = {"NO_PROXY" : os.environ["NO_PROXY"], "HTTP_PROXY" : os.environ["HTTP_PROXY"], "HTTPS_PROXY" : os.environ["HTTPS_PROXY"]}

#c.Authenticator.allowed_users = {"admin"}
c.Authenticator.admin_users = admin = {"admin"}

# By default all users that make sign up on Native Authenticator
# need an admin approval so they can actually log in the system.
c.Authenticator.open_signup = False

c.NotebookApp.allow_root=False

c.LocalAuthenticator.create_system_users = True
c.SystemdSpawner.dynamic_users = True
c.PAMAuthenticator.admin_groups = {"wheel"}
c.Authenticator.whitelist = whitelist = set()

pwd = os.path.dirname(__file__)

# Get active users
userlist_path = os.path.join(pwd, "userlist")
teamlist_path = os.path.join(pwd, "teamlist")

with open(userlist_path) as f:
    for line in f:
        if not line:
            continue
        parts = line.split()
        # in case of newline at the end of userlist file
        if len(parts) >= 1:
            name = parts[0]
            whitelist.add(name)
            if len(parts) > 1 and parts[1] == "admin":
                admin.add(name)

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

# Spawn single-user servers as Docker containers
class DockerSpawner(dockerspawner.DockerSpawner):
    def start(self):
        # username is self.user.name
        self.volumes = {"jupyterhub-user-{}".format(self.user.name): notebook_dir}
        
        if self.user.name not in whitelist:
            whitelist.add(self.user.name)
            with open(userlist_path) as f:
                f.write(self.user.name + "\n")

        if self.user.name in list(team_map.keys()):
            for team in team_map[self.user.name]:
                team_dir_path = os.path.join(shared_content_dir, team)
                self.volumes["jupyterhub-team-{}".format(team)] = {
                    "bind": team_dir_path,
                    "mode": "rw",  # or ro for read-only
                }
        
        self.post_start_cmd = "chmod -R 777 " + shared_content_dir

        return super().start()

# Spawn single-user servers as Docker containers
c.JupyterHub.spawner_class = DockerSpawner
c.DockerSpawner.extra_create_kwargs = {"user": "root"}
c.DockerSpawner.environment = {
  "GRANT_SUDO": "1",
  "UID": "0", # workaround https://github.com/jupyter/docker-stacks/pull/420
}

#c.JupyterHub.authenticator_class = LocalNativeAuthenticator

c.FirstUseAuthenticator.create_users = True
c.JupyterHub.authenticator_class = "firstuseauthenticator.FirstUseAuthenticator" #"nativeauthenticator.NativeAuthenticator"

# User containers will access hub by container name on the Docker network
c.JupyterHub.ip = "0.0.0.0"
c.JupyterHub.hub_ip = "0.0.0.0"


c.JupyterHub.hub_port = 8888

c.ConfigurableHTTPProxy.api_url = "http://127.0.0.1:8887"
# ideally a private network address
# c.JupyterHub.proxy_api_ip = "10.0.1.4"
c.JupyterHub.proxy_api_port = 8887

# TLS config
c.JupyterHub.port = 443
c.JupyterHub.ssl_key = os.environ.get("SSL_KEY", "/etc/jupyterhub/root-ca.key")
c.JupyterHub.ssl_cert = os.environ.get("SSL_CERT", "/etc/jupyterhub/root-ca.pem")

# Persist hub data on volume mounted inside container
data_dir = os.environ.get("DATA_VOLUME_CONTAINER", "./")

c.JupyterHub.cookie_secret_file = os.path.join(data_dir, "jupyterhub_cookie_secret")

#------------------------------------------------------------------------------
# Application(SingletonConfigurable) configuration
#------------------------------------------------------------------------------
## This is an application.

## The date format used by logging formatters for %(asctime)s
#  Default: "%Y-%m-%d %H:%M:%S"
# c.Application.log_datefmt = "%Y-%m-%d %H:%M:%S"   

## The Logging format template
#  Default: "[%(name)s]%(highlevel)s %(message)s"
# c.Application.log_format = "[%(name)s]%(highlevel)s %(message)s"

## Set the log level by value or name.
#  Choices: any of [0, 10, 20, 30, 40, 50, "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]
#  Default: 30
c.Application.log_level = "DEBUG"

## Instead of starting the Application, dump configuration to stdout
#  Default: False
# c.Application.show_config = False

## Instead of starting the Application, dump configuration to stdout (as JSON)
#  Default: False
# c.Application.show_config_json = False

c.JupyterHub.allow_named_servers = True

## Timeout (in seconds) to wait for spawners to initialize
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
c.JupyterHub.init_spawners_timeout = 180

## Timeout (in seconds) before giving up on a spawned HTTP server
#  
#  Once a server has successfully been spawned, this is the amount of time we
#  wait before assuming that the server is unable to accept connections.
#  Default: 30
c.Spawner.http_timeout = 180

## Timeout (in seconds) before giving up on starting of single-user server.
#  
#  This is the timeout for start to return, not the timeout for the server to
#  respond. Callers of spawner.start will assume that startup has failed if it
#  takes longer than this. start should return when the server process is started
#  and its location is known.
#  Default: 60
c.Spawner.start_timeout = 180


#------------------------------------------------------------------------------
# LocalProcessSpawner configuration
#------------------------------------------------------------------------------

# A Spawner that just uses Popen to start local processes as users.
# 
# Requires users to exist on the local system.
# 
# This is the default spawner for JupyterHub.

# Seconds to wait for process to halt after SIGINT before proceeding to SIGTERM
c.LocalProcessSpawner.interrupt_timeout = 60

# Seconds to wait for process to halt after SIGKILL before giving up
c.LocalProcessSpawner.kill_timeout = 60

# Seconds to wait for process to halt after SIGTERM before proceeding to SIGKILL
c.LocalProcessSpawner.term_timeout = 60