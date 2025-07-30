# Introduction

This repo has been reinstated. The custom jupyter-hub image is specified in the [CogStack-Nifi](https://github.com/CogStack/CogStack-NiFi/tree/main/services/jupyter-hub) project.


This repository contains a custom Jupyter Hub Docker image with example notebooks to play with. \
The notebooks provided are usually kept up to date with the example data that has been generated using Synthea and MTSamples in the [CogStack-NiFi](https://github.com/cogstack/cogstack-nifi) repository. Additionally, the [working with cogstack](https://github.com/CogStack/working_with_cogstack) scripts are included for production use.

All notebooks are available in the [notebooks](./notebooks/) folder.

The previous version of the jupyter notebook provided a simple but common environment for people to work on, the new version operaties in a centralised manner, the hub docker container starts individual containers for each user, it also allows for easier sharing of data between users via groups (this feature needs testing).

There are 3 images built in this repo:

    - jupyter-hub: the hub from which individual user containers are started.
    - jupyter-singleuser: image used for each user's container, an isolated environment.
    - jupyter-singleuser-gpu: same as `jupyter-singleuser` but has GPU packages.

Images are available for both x86/ARM architectures (post version 1.2.7):

    - jupyter-hub ARM64/AMD64: `cogstacksystems/jupyter-hub:latest-arm64`, `cogstacksystems/jupyter-hub:latest-amd64`
    - minimal official image ARM64/AMD64: `jupyterhub/singleuser:latest`
    - jupyter-singleuser ARM64/AMD64: `cogstacksystems/jupyter-singleuser:latest-arm64`, `cogstacksystems/jupyter-singleuser:latest-amd64`
    - jupyter-singleuser-gpu AMD64: `cogstacksystems/jupyter-singleuser-gpu:latest-amd64`

Full and more in-depth knowledge on the configuration itself is available in the primary repository [official documentation](https://cogstack-nifi.readthedocs.io/en/latest/deploy/services.html#id12).


# Usage & configuration

ENV variables are located in: [env/jupyter.env](./env/jupyter.env) and [env/general.env](./env/general.env).\
Please check the ENV file for additional information, every variable is commented and described.

## Python packages installed

Full list found in [requirements.txt](./requirements.txt).

## Security

Certificates used are located in the `./security/` folder, taken from the [Cogstack-NiFi](https://github.com/CogStack-NiFi) security folder, [root-ca.key](https://raw.githubusercontent.com/CogStack/CogStack-NiFi/refs/heads/main/security/root-ca.key) and [root-ca.pem](https://raw.githubusercontent.com/CogStack/CogStack-NiFi/refs/heads/main/security/root-capem), read the [security section](https://cogstack-nifi.readthedocs.io/en/latest/security.html) for more info on how to generate them from the main NiFi repository.

## Setting up your own hub

There are two docker compose files:
`docker-compose-dev.yml` - this will build the build the hub image from scratch, it will not build the singleuser one however.
`docker-compose.yml` - default, for production.

Check the [env/general.env](./env/general.env), set the `CPU_ARCHITECTURE` variable to whatever you need, the default for most Laptops/PCs is `amd64`, if you have an ARM laptop/device then set to `arm64`, that should suffice.

Execute the following in the main repo directory:

```
    bash export_env_vars.sh
    docker compose up -d
```

Updating certificates and env settings from the main repo:

    - sometimes it is necessary to grab new certificates if the old ones expired (from the main Cogstack-NiFi repo)
    - from the main repo directory, execute `bash scripts/update_env_cert_from_nifi_repo.sh`

## Access and account control
To access Jupyter Hub on the host machine (e.g.localhost), one can type in the browser `https://localhost:8888`.

Creating accounts for other users is possible, just go to the admin page `https://localhost:8888/hub/admin#/`, click on add users and follow the instructions (make sure usernames are lower-cased and DO NOT contain symbols, if usernames contain uppercase they will be converted to lower case in the creation process).

The default password is blank, you can set the password for the admin user the first time you LOG IN, remember it.

Or you can set the password is defined by a local variable `JUPYTERHUB_PASSWORD` in `.env` file that is the password SHA-1 value if the authenticator is set to either LocalAuthenticator or Native read more in [jupyter doc](https://jupyterhub.readthedocs.io/en/stable/api/auth.html?highlight#) about this.

<strong><u>Users must use the "/work/"directory for their work, otherwise files might not get saved!</u></strong>

## Enabling GPU support

Pre-requisites (for Linux and Windows): - for Linux, you need to install the nvidia-docker2 package / nvidia toolkit package that adds gpu spport for docker, official documentation here - this also needs to be done for Windows machines, please read the the documentation for WSL2 [here](https://docs.nvidia.com/cuda/wsl-user-guide/index.html).

In [env/jupyter.env](./env/jupyter.env):

    - change `DOCKER_ENABLE_GPU_SUPPORT` from `false` to `true`.
    - change `DOCKER_NOTEBOOK_IMAGE` from `cogstacksystems/jupyter-singleuser:latest` to `cogstacksystems/jupyter-singleuser-gpu:latest`.
    - in the main repo folder, execute the following command in terminal: `source env/jupyter.env`, then `docker compose up -d`.

*Use any release version you want instead of `latest` as necessary .

## User resource limits

Users can have their resources limited (currently only CPU + RAM), there is a default `USER` and `ADMIN` role, future work will add more configurable roles.\
Change the coresponding variables in [env/jupyter.env](./env/jupyter.env):

    *   General user resource cap per container, default 2 cores, 2GB ram:
        - `RESOURCE_ALLOCATION_USER_CPU_LIMIT`="2"
        - `RESOURCE_ALLOCATION_USER_RAM_LIMIT`="2.0G"

    *   Admin resource cap per container, default 2 cores, 4 GB RAM:
        - `RESOURCE_ALLOCATION_ADMIN_CPU_LIMIT`="2"
        - `RESOURCE_ALLOCATION_ADMIN_RAM_LIMIT`="4.0G"

## Sharing storage between users

It is possible to configure a `scratch` folder/partition that is just a volume that will be shared by multiple users belonging to the same group.
This feature is currently experiemntal, it requires admins to add users to the same group and then define a folder to be shared (difficult as it is mainly done via config file at present) .
