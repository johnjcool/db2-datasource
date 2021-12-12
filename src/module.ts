import { DataSourcePlugin } from '@grafana/data';
import { Db2Options, Db2Query } from './types';
import { Db2Datasource } from 'datasource';
import { Db2QueryCtrl } from 'query_ctrl';
import { Db2ConfigCtrl } from 'config_ctrl';

const defaultQuery = `SELECT
  extract(epoch from time_column) AS time,
  text_column as text,
  tags_column as tags
FROM
  metric_table
WHERE
  $__timeFilter(time_column)
`;

class Db2AnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';

  declare annotation: any;

  /** @ngInject */
  constructor($scope: any) {
    this.annotation = $scope.ctrl.annotation;
    this.annotation.rawQuery = this.annotation.rawQuery || defaultQuery;
  }
}

export const plugin = new DataSourcePlugin<Db2Datasource, Db2Query, Db2Options>(Db2Datasource)
  .setConfigCtrl(Db2ConfigCtrl)
  .setQueryCtrl(Db2QueryCtrl)
  .setAnnotationQueryCtrl(Db2AnnotationsQueryCtrl);
