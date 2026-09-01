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

Assuming you are the system admin, meaning you have `sudo` rights.
You can use the script located at `scripts/installation_utils/install_docker_and_utils.sh`; it can be used on Debian(10+)/Ubuntu(22.04+)/RedHAT RHEL 8/9 only. Run it once and everything should be set up. The script resolves its helper files relative to its own location, so it can be run from any directory.

Execute the following commands in the root directory of the repo:

1. `git-lfs pull`
2. (OPTIONAL, if you already have the software in [this section installed](#software-requirements-linuxmacos)) `bash ./scripts/installation_utils/install_docker_and_utils.sh`, and wait for it to finish. It may take a while to get all the packages, and it will prompt for `sudo` when needed.
3. `cd deploy`
4. `make git-update-submodules`
5. `make init-security`
6. check that docker works correctly : `docker pull hello-world`
7. if no errors, run: `docker run --rm hello-world`, it should run without issues
8. if there are any issues check the below warning section

!!! warning

    Run `git-lfs pull` to download all repository assets, including larger files.

!!! warning

    Ensure all Git submodules are initialized and updated with `make git-update-submodules`.

!!! warning

    If Docker fails to install or `docker pull hello-world` does not work:

    - Follow the official [Docker installation steps](https://docs.docker.com/engine/install/debian/).
    - Ensure your user is in the Docker group.
    - For non-sudo users, check [Docker rootless mode](https://docs.docker.com/engine/security/rootless/) and the [Linux post-install steps](https://docs.docker.com/engine/install/linux-postinstall/).

## ⚠️ Essential Elasticsearch Requirement

!!! warning

    **Elasticsearch may fail to start unless `vm.max_map_count` is increased.**

    If this value is too low, Elasticsearch will exit with the error:

    ```bash
    bootstrap checks failed
    max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
    ```

    If you did **not** run the installation script, set it manually.

    **Temporary (until reboot):**

    ```bash
    sudo sysctl -w vm.max_map_count=262144
    ```

    **Permanent (persists across reboots):**

    Add the line below to `/etc/sysctl.conf`:

    ```bash
    vm.max_map_count=262144
    ```

    Or use this one-liner:

    ```bash
    sudo sh -c "echo 'vm.max_map_count=262144' >> /etc/sysctl.conf"
    ```

    Then apply it:

    ```bash
    sudo sysctl -p
    ```

    The `install_docker_and_utils.sh` script configures this automatically; set it manually only if the script was skipped.

## 🏅 Deploying services

If everything up to this point is running fine, then, congratulations, you should now be able to start looking at the [deployment section](./deployment.md)
