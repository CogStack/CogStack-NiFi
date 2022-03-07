FROM jupyterhub/jupyterhub:latest

ARG http_proxy
ARG https_proxy
ARG no_proxy

ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV no_proxy=$no_proxy

USER root

RUN apt-get update && apt-get upgrade -y && \
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
    software-properties-common \
    fonts-dejavu \
    build-essential \
    python3-dev \
    python3-pip \
    unixodbc \
    unixodbc-dev \
    r-cran-rodbc \
    gfortran \
    gcc \
    git \
    ssh \
    jq \
    htop \
    libgl1-mesa-glx libegl1-mesa libxrandr2 libxrandr2 libxss1 \
    libxcursor1 libxcomposite1 libasound2 libxi6 libxtst6 \
    r-base 

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/21.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
 
# install remaining packages
RUN apt-get update && apt-get upgrade -y
RUN apt-get -y --no-install-recommends install unixodbc unixodbc-dev odbcinst
RUN ACCEPT_EULA=Y apt-get install -y msodbcsql18
RUN ACCEPT_EULA=Y apt-get install -y mssql-tools18
RUN echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc

# Install miniconda
ENV CONDA_DIR /opt/conda
RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda

# Put conda in path so we can use conda activate
ENV PATH=$CONDA_DIR/bin:$PATH

RUN conda update conda
RUN conda install --quiet --yes \
    elasticsearch \
    psycopg2 \
    pyodbc \
    pymssql

RUN conda clean --all -f -y

# RUN fix-permissions $CONDA_DIR && fix-permissions /home/$NB_USER

# deps for psycopg2
RUN apt-get install -y postgresql-server-dev-all python3 python3-pip python3-dev python3.9-dev python3-all-dev ssl-cert --no-install-recommends 

RUN pip3 install --upgrade pip
RUN pip3 install virtualenv pytesseract ipyparallel py7zr cython isort opensearch-py html2text jsoncsv simplejson detect wheel nltk keras bokeh seaborn matplotlib graphviz plotly tqdm 
RUN pip3 install medcat && pip install ipywidgets jupyter jupyterlab jupyterlab-git
RUN pip3 install dvc jupyterlab_widgets jupyter_contrib_core jupyter_contrib_nbextensions jupyter-server-proxy fastbook
RUN pip3 install setuptools flask GitPython elasticsearch opensearch-py neo4j --ignore-installed PyYAML 
RUN pip3 install pymssql mysql-connector-python cx-Oracle dataclasses numpy matplotlib pandas dill jsonpickle jsonext psycopg2 psycopg2-binary pyodbc
RUN pip3 install dockerspawner jupyterhub-firstuseauthenticator jupyterhub-systemdspawner jupyterhub-jwtauthenticator jupyterhub-client jupyterhub-kerberosauthenticator jupyterhub-nanowireauthenticator jupyterhub-ldapauthenticator jupyterhub-sdp jupyterhub-kubespawner jupyterhub-nativeauthenticator

RUN python3 -m jupyter contrib nbextension install --sys-prefix

RUN pip3 install medcat && \
    python3 -m spacy download en_core_web_md && \
    pip3 install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.4.0/en_core_sci_md-0.4.0.tar.gz && \
    pip3 install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.4.0/en_core_sci_lg-0.4.0.tar.gz

COPY r_kernel_install.sh /etc/jupyterhub/

RUN Rscript /etc/jupyterhub/r_kernel_install.sh

RUN mkdir /home/$NB_USER/notebooks

# copy scripts and config files
COPY config/jupyterhub_config.py /etc/jupyterhub/

# create jupyterhub shared folder

RUN mkdir -p /home/jovyan/scratch
RUN chmod -R 777 /home/jovyan/scratch
RUN chmod g+s /home/jovyan/scratch
RUN chmod 0777 /home/jovyan/scratch

# copy notebooks
COPY notebooks /home/jovyan/work/

# clean up
RUN pip3 cache purge
RUN apt-get autoremove -y

USER $NB_UID
