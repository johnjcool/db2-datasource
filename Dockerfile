FROM grafana/grafana:8.2.3-ubuntu

USER root

RUN apt-get update \
    && apt-get install wget libxml2 libstdc++6

USER grafana

RUN wget https://public.dhe.ibm.com/ibmdl/export/pub/software/data/db2/drivers/odbc_cli/linuxx64_odbc_cli.tar.gz -O /tmp/linuxx64_odbc_cli.tar.gz \
    && mkdir /home/grafana/db2_cli_odbc_driver \
    && mkdir /var/lib/grafana/plugins/johnjcool-db2-datasource \
    && tar xvzf /tmp/linuxx64_odbc_cli.tar.gz -C /home/grafana/db2_cli_odbc_driver

ENV LD_LIBRARY_PATH=/home/grafana/db2_cli_odbc_driver/clidriver/lib

COPY dist /var/lib/grafana/plugins/johnjcool-db2-datasource

RUN ls -lisa /var/lib/grafana/plugins/johnjcool-db2-datasource

