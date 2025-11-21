# 📋 Prerequisites

Please read carefully as there can be many points of failure when installing/deploying everything into a clean environment.

## 🖥️ OS Requirements

Please note that the OSes mentioned below are the versions we support, whatever is not listed here is not supported, and we will not provide support for.

- Linux OS (Ubuntu 24.04 LTS +, Debian 10+ are preffered, RHEL 9+).
- Windows 11+/Windows Server 2022+ (Requires [WSL 2.0](https://learn.microsoft.com/en-us/windows/wsl/about) installation and the installation of an Ubuntu image, for a working setup, follow [this guide](https://documentation.ubuntu.com/wsl/latest/howto/install-ubuntu-wsl2/) to get going, and get back here when things are working).
- macOS 15+ (Sequoia).

## 🧰 Software requirements (Linux/macOS)

Software required on machine (the minimum/basics to get demos running):

- make
- git + git-lfs
- Docker
- python3.11

## 🔐 Other requirements (User Permissions/Firewall)

    - a Linux account with 'admin' rights, if possible, if not, you will need to get your IT team to take a look at this README and install the packages for you using the steps below (make sure they look at [Docker rootless installation steps](https://docs.docker.com/engine/security/rootless))
    - firewall whitelisting of the following addreses:
        - https://github.com/
        - https://hub.docker.com/
        - https://docker.io 
        - http://download.docker.com 
        - https://huggingface.co/
        - https://www.nltk.org
        - https://pypi.org/
        - https://pypi.python.org  
        - https://Files.pythonhosted.org 
        - https://pythonhosted.org

## ⚙️ Installation steps

Assuming you are the system admin, meaning you have`SUDO` rights.
You can use the script with `SUDO` rights, located at `/scripts/installation_utils/install_docker_and_utils.sh`, it can be used on Debian(10+)/Ubuntu(22.04+)/RedHAT RHEL 8/9 only, run it once and everything should be set up.

Execute the following commands in the root directory of the repo:

1. `git-lfs pull`
2. (OPTIONAL, if you already have the software in [this section installed](#-software-requirements-linuxmacos))`sudo bash ./scripts/installation_utils/install_docker_and_utils.sh` , and wait for it to finish, it may take a while to get all the packages..
3. `cd deploy && git-update-submodules`
4. check that docker works correctly : `docker pull hello-world`
5. if no errors, run: `docker run --rm hello-world`, it should run without issues
6. if there are any issues check the below warning section

:::{warning}
IMPORTANT NOTE: Do a `git-lfs pull` so that you have everything downloaded from the repo (including bigger zipped files.).
:::

:::{warning}
Ensure all Git submodules are initialized and updated:
`cd deploy && git-update-submodules`
:::

:::{warning}
Consult the  if there are issues with the docker setup.
If Docker fails to install or `docker pull hello-world` does not work:

    - Follow the official [Docker installation steps](https://docs.docker.com/engine/install/debian/)
    - Ensure your user is in the docker group
    - For non-sudo users, check Docker rootless mode and required post-install steps:
        - https://docs.docker.com/engine/security/rootless/
        - https://docs.docker.com/engine/install/linux-postinstall/

:::

## ⚠️ Essential Elasticsearch Requirement

:::{warning}
**Elasticsearch may fail to start unless `vm.max_map_count` is increased.**

If this value is too low, Elasticsearch will exit with the error:

    ```bash
    bootstrap checks failed
    max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
    ```

If you did **not** run the installation script, set it manually:

**Temporary (until reboot):**
    ```bash
    sudo sysctl -w vm.max_map_count=262144
    ```

**Permanent (persists across reboots):**
Add the line below to `/etc/sysctl.conf`:

    ```bash
    vm.max_map_count=262144
    ```

Or a one-liner:

    ```bash
    sudo sh -c "echo 'vm.max_map_count=262144' >> /etc/sysctl.conf"
    ```

Then apply:

    ```bash
    sudo sysctl -p
    ```

> The `install_docker_and_utils.sh` script automatically configures this.
> You only need to set it manually if the script was skipped.
:::

## 🏅 Deploying services

If everything up to this point is running fine, then, congratulations, you should now be able to start looking at the [deployment section](./deployment.md)
