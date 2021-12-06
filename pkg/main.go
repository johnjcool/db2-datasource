package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/sqlds/v2"
	"github.com/johnjcool/db2-datasource/pkg/db2"
)

func main() {
	log.DefaultLogger.Info("Starting DB2 plugin....")

	s := db2.New()
	ds := sqlds.NewDatasource(s)
	//ds.Completable = s

	if err := datasource.Manage(
		"johnjcool-db2-datasource",
		ds.NewDatasource,
		datasource.ManageOpts{},
	); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}

}
