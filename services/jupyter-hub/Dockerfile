FROM jupyter/datascience-notebook:dc9744740e12
#FROM jupyter/datascience-notebook:latest

USER root

RUN apt-get update && \
    apt-get install -y \
    gnupg \
    libssl1.0.0 \
    libssl-dev

# using Ubuntu 18.04 as base image
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/18.04/prod.list > /etc/apt/sources.list.d/mssql-release.list

# install remaining packages
RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    apt-get -y --no-install-recommends install \
	   unixodbc \ 
	   unixodbc-dev \ 
	   odbcinst


USER $NB_UID

RUN conda install --quiet --yes \
    'elasticsearch=7.*' \
    'psycopg2=2.7.*' \
    'pyodbc=4.*' \
    'pymssql=2.1.*' && \
    conda clean --all -f -y && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

RUN pip install -U medcat && \
      pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.2.4/en_core_sci_md-0.2.4.tar.gz && \
      python -m spacy download en_core_web_sm
