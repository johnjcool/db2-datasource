# Grafana DB2 Data Source Backend Plugin

[![Build](https://github.com/johnjcool/db2-datasource/workflows/CI/badge.svg)](https://github.com/johnjcool/db2-datasource/actions?query=workflow%3A%22CI%22)

It is based on the great work of https://github.com/jcnnrts/db-2-datasource

## What is Grafana Data Source Backend Plugin?

Grafana supports a wide range of data sources, including Prometheus, MySQL, and even Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana Data Source Plugins enables integrating such solutions with Grafana.

For more information about backend plugins, refer to the documentation on [Backend plugins](https://grafana.com/docs/grafana/latest/developers/plugins/backend/).

## Getting started

A data source backend plugin consists of both frontend and backend components.

### Frontend

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

### Backend

1. Preparing docker container to build the backend on Linux:

  ```bash
  docker run -it -v $(pwd):/app -w /app golang:1.13 /bin/bash
  apt-get update
  apt-get install wget libxml2 libstdc++6
  ```

2. Update [Grafana plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/backend/grafana-plugin-sdk-for-go/) dependency to the latest minor version:

  ```bash  
  go get -u github.com/grafana/grafana-plugin-sdk-go
  go mod tidy
  ```

3. Install DB2 [clidriver](https://github.com/ibmdb/go_ibm_db#how-to-install-in-linuxmac):

  ```bash
  cd $GOPATH/pkg/mod/github.com/ibmdb/go_ibm_db@v0.4.1/installer
  go run setup.go
  export CGO_CFLAGS="-I$GOPATH/pkg/mod/github.com/ibmdb/clidriver/include"
  export CGO_LDFLAGS="-L$GOPATH/pkg/mod/github.com/ibmdb/clidriver/lib"
  export LD_LIBRARY_PATH="$GOPATH/pkg/mod/github.com/ibmdb/clidriver/lib"
  ```

4. Build backend plugin binaries for Linux (we couldn't use mage becaus we couldn't build static):

  ```bash
  cd /app
  go build -o dist/gpx_db2_linux_amd64 ./pkg
  ```

### Run all together

1. Build and run docker image:

  ```bash
  docker build -t johnjcool/grafana:8.3.2 .
  docker run -p 3000:3000 -v "$(pwd)/dev/grafana.ini":/etc/grafana/grafana.ini -v "$(pwd)"/dist:/var/lib/grafana/plugins/johnjcool-db2-datasource johnjcool/grafana:8.3.2
  ```

2. Open the browser on http://localhost:3000

## Learn more

- [Build a data source backend plugin tutorial](https://grafana.com/tutorials/build-a-data-source-backend-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
- [Grafana plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/backend/grafana-plugin-sdk-for-go/)
