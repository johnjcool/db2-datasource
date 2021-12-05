package db2

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	_ "github.com/ibmdb/go_ibm_db"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"
	"github.com/pkg/errors"
)

type Db2DatasourceIface interface {
	sqlds.Driver
	Schemas(ctx context.Context, options sqlds.Options) ([]string, error)
	Tables(ctx context.Context, options sqlds.Options) ([]string, error)
	Columns(ctx context.Context, options sqlds.Options) ([]string, error)
}

type Db2Datasource struct{}

func New() *Db2Datasource {
	return &Db2Datasource{}
}

func (ds *Db2Datasource) Settings(_ backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{
		FillMode: &data.FillMissing{
			Mode: data.FillModeNull,
		},
	}
}

func (ds *Db2Datasource) Connect(config backend.DataSourceInstanceSettings, _ json.RawMessage) (*sql.DB, error) {

	urlParts := strings.Split(config.URL, ":")

	db, err := sql.Open(
		"go_ibm_db",
		fmt.Sprintf(
			"HOSTNAME=%s;PORT=%s;DATABASE=%s;UID=%s;PWD=%s",
			urlParts[0],
			urlParts[1],
			config.Database,
			config.User,
			config.DecryptedSecureJSONData["password"],
		),
	)

	if err != nil {
		return nil, errors.WithMessage(err, "Failed to connect to database. Is the hostname and port correct?")
	}
	return db, nil
}

func (s *Db2Datasource) Converters() (sc []sqlutil.Converter) {
	return sc
}

// needed for auto completion
func (s *Db2Datasource) Schemas(ctx context.Context, options sqlds.Options) ([]string, error) {

	return []string{}, nil
}

func (s *Db2Datasource) Tables(ctx context.Context, options sqlds.Options) ([]string, error) {

	return []string{}, nil
}

func (s *Db2Datasource) Columns(ctx context.Context, options sqlds.Options) ([]string, error) {

	return []string{}, nil
}
