FROM jupyterhub/jupyterhub:latest

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ARG http_proxy
ARG https_proxy
ARG no_proxy

ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV NO_PROXY=$NO_PROXY
ENV http_proxy=$HTTP_PROXY
ENV https_proxy=$HTTPS_PROXY
ENV no_proxy=$NO_PROXY

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_PRIORITY=critical

USER root

RUN apt-get update && apt-get upgrade -y && \
     apt-get install -y software-properties-common

# add extra repos
RUN apt-add-repository multiverse && \
    apt-add-repository universe && \
    add-apt-repository ppa:graphics-drivers/ppa && \
    apt-get update && apt-get upgrade -y 

# Add latest ubuntu repos to sources.list
RUN echo "deb http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list
RUN echo "deb-src http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list
RUN echo "deb http://archive.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list
RUN echo "deb-src http://archive.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list
RUN echo "deb http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list
RUN echo "deb-src http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list
RUN echo "deb http://archive.canonical.com/ubuntu/ jammy partner" | sudo tee -a /etc/apt/sources.list
RUN echo "deb-src http://archive.canonical.com/ubuntu/ jammy partner" | sudo tee -a /etc/apt/sources.list

RUN apt-get update && apt-get upgrade -y && \
    apt-get  --force-yes -o Dpkg::Options::="--force-confold" --force-yes -o Dpkg::Options::="--force-confdef" -fuy  dist-upgrade  && \
    apt-get install -y \
    gnupg \
    libssl-dev \
    wget \
    curl \
    gnupg \
    gnupg-agent \
    dirmngr \
    ca-certificates \
    apt-transport-https \
    fonts-dejavu \
    build-essential \
    unixodbc \
    unixodbc-dev \
    gfortran \
    gcc \
    git \
    ssh \
    libgssapi-krb5-2 \
    libkrb5-dev \
    libsasl2-modules-gssapi-mit

RUN apt-get install -y python3 python3-pip python3-dev python3.9-dev python3-all-dev ssl-cert --no-install-recommends

RUN pip3 install --upgrade pip

# utils for jupyterhub
RUN pip3 install setuptools wheel virtualenv cython isort netifaces

# jupyterhub stuff
RUN pip3 install sqlalchemy detect simplejson ipywidgets jupyter jupyterhub jupyterlab jupyterlab-git importlib_metadata jupyterhub-firstuseauthenticator dockerspawner jupyterhub-nativeauthenticator
RUN pip3 install jupyterlab_widgets jupyter_contrib_core jupyter_contrib_nbextensions jupyter-server-proxy fastbook
RUN pip3 install jupyterhub-firstuseauthenticator jupyterhub-systemdspawner jupyterhub-jwtauthenticator jupyterhub-client jupyterhub-kerberosauthenticator --ignore-installed PyYAML 
RUN pip3 install jupyterhub-ldapauthenticator jupyterhub-nanowireauthenticator jupyterhub-kubespawner jupyterhub-idle-culler

RUN python3 -m jupyter contrib nbextension install --sys-prefix

RUN mkdir -p /home/jovyan/scratch
RUN chmod -R 777 /home/jovyan/scratch
RUN chmod g+s /home/jovyan/scratch

# copy scripts and config files
COPY config/jupyterhub_config.py /etc/jupyterhub/

# copy notebooks
COPY notebooks /home/jovyan/work/

# clean up
RUN pip3 cache purge
RUN apt-get autoremove -y

USER $NB_UID
