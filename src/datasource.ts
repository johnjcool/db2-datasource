import { DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { Db2DataSourceOptions, Db2Query } from './types';

export class DataSource extends DataSourceWithBackend<Db2Query, Db2DataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<Db2DataSourceOptions>) {
    super(instanceSettings);
  }
}
