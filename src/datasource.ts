import { map as _map } from 'lodash';
import { lastValueFrom, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  BackendDataSourceResponse,
  DataSourceWithBackend,
  FetchResponse,
  getBackendSrv,
  getTemplateSrv,
  TemplateSrv,
} from '@grafana/runtime';
import {
  AnnotationEvent,
  DataSourceInstanceSettings,
  getDefaultTimeRange,
  MetricFindValue,
  ScopedVars,
} from '@grafana/data';
import ResponseParser from './response_parser';
import Db2QueryModel from './db2_query_model';
//Types
import { Db2Options, Db2Query, Db2QueryForInterpolation } from './types';
import { getSearchFilterScopedVar, toTestingStatus, variableRegex } from './utils';

export class Db2Datasource extends DataSourceWithBackend<Db2Query, Db2Options> {
  private regex = variableRegex;

  id: any;
  name: any;
  jsonData: any;
  responseParser: ResponseParser;
  queryModel: Db2QueryModel;
  interval: string;

  constructor(
    instanceSettings: DataSourceInstanceSettings<Db2Options>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.jsonData = instanceSettings.jsonData;
    this.responseParser = new ResponseParser();
    this.queryModel = new Db2QueryModel({});
    const settingsData = instanceSettings.jsonData || ({} as Db2Options);
    this.interval = settingsData.timeInterval || '1m';
  }

  interpolateVariable = (value: string | string[], variable: { multi: any; includeAll: any }) => {
    if (typeof value === 'string') {
      if (variable.multi || variable.includeAll) {
        return this.queryModel.quoteLiteral(value);
      } else {
        return value;
      }
    }

    if (typeof value === 'number') {
      return value;
    }

    const quotedValues = _map(value, (v) => {
      return this.queryModel.quoteLiteral(v);
    });
    return quotedValues.join(',');
  };

  interpolateVariablesInQueries(
    queries: Db2QueryForInterpolation[],
    scopedVars: ScopedVars
  ): Db2QueryForInterpolation[] {
    let expandedQueries = queries;
    if (queries && queries.length > 0) {
      expandedQueries = queries.map((query) => {
        const expandedQuery = {
          ...query,
          datasource: this.getRef(),
          rawSql: this.templateSrv.replace(query.rawSql, scopedVars, this.interpolateVariable),
          rawQuery: true,
        };
        return expandedQuery;
      });
    }
    return expandedQueries;
  }

  filterQuery(query: Db2Query): boolean {
    return !query.hide;
  }

  applyTemplateVariables(target: Db2Query, scopedVars: ScopedVars): Record<string, any> {
    const queryModel = new Db2QueryModel(target, this.templateSrv, scopedVars);
    return {
      refId: target.refId,
      datasource: this.getRef(),
      rawSql: queryModel.render(this.interpolateVariable as any),
      format: target.format,
    };
  }

  async annotationQuery(options: any): Promise<AnnotationEvent[]> {
    if (!options.annotation.rawQuery) {
      return Promise.reject({
        message: 'Query missing in annotation definition',
      });
    }

    const query = {
      refId: options.annotation.name,
      datasource: this.getRef(),
      rawSql: this.templateSrv.replace(options.annotation.rawQuery, options.scopedVars, this.interpolateVariable),
      format: 'table',
    };

    return lastValueFrom(
      getBackendSrv()
        .fetch<BackendDataSourceResponse>({
          url: '/api/ds/query',
          method: 'POST',
          data: {
            from: options.range.from.valueOf().toString(),
            to: options.range.to.valueOf().toString(),
            queries: [query],
          },
          requestId: options.annotation.name,
        })
        .pipe(
          map(
            async (res: FetchResponse<BackendDataSourceResponse>) =>
              await this.responseParser.transformAnnotationResponse(options, res.data)
          )
        )
    );
  }

  metricFindQuery(query: string, optionalOptions: any): Promise<MetricFindValue[]> {
    let refId = 'tempvar';
    if (optionalOptions && optionalOptions.variable && optionalOptions.variable.name) {
      refId = optionalOptions.variable.name;
    }

    const rawSql = this.templateSrv.replace(
      query,
      getSearchFilterScopedVar({ query, wildcardChar: '%', options: optionalOptions }),
      this.interpolateVariable
    );

    const interpolatedQuery = {
      refId: refId,
      datasource: this.getRef(),
      rawSql,
      format: 'table',
    };

    const range = getDefaultTimeRange();
    //const range = this.timeSrv.timeRange();

    return lastValueFrom(
      getBackendSrv()
        .fetch<BackendDataSourceResponse>({
          url: '/api/ds/query',
          method: 'POST',
          data: {
            from: range.from.valueOf().toString(),
            to: range.to.valueOf().toString(),
            queries: [interpolatedQuery],
          },
          requestId: refId,
        })
        .pipe(
          map((rsp) => {
            return this.responseParser.transformMetricFindResponse(rsp);
          }),
          catchError((err) => {
            return of([]);
          })
        )
    );
  }

  getVersion(): Promise<any> {
    return this.metricFindQuery("SELECT current_setting('server_version_num')::int/100", {});
  }

  getTimescaleDBVersion(): Promise<any> {
    return this.metricFindQuery("SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'", {});
  }

  testDatasource(): Promise<any> {
    return this.metricFindQuery('SELECT 1', {})
      .then(() => {
        return { status: 'success', message: 'Database Connection OK' };
      })
      .catch((err: any) => {
        return toTestingStatus(err);
      });
  }

  targetContainsTemplate(target: any) {
    let rawSql = '';

    if (target.rawQuery) {
      rawSql = target.rawSql;
    } else {
      const query = new Db2QueryModel(target);
      rawSql = query.buildQuery();
    }

    rawSql = rawSql.replace('$__', '');

    return this.variableExists(rawSql);
  }

  getVariableName(expression: string) {
    this.regex.lastIndex = 0;
    const match = this.regex.exec(expression);
    if (!match) {
      return null;
    }
    const variableName = match.slice(1).find((match) => match !== undefined);
    return variableName;
  }

  variableExists(expression: string): boolean {
    const name = this.getVariableName(expression);
    const variable = name && this.getVariableAtIndex(name);
    return variable !== null && variable !== undefined;
  }

  private getVariableAtIndex(name: string) {
    if (!name) {
      return;
    }

    //if (!this.index[name]) {
    //  return this.dependencies.getVariableWithName(name);
    //}

    //return this.index[name];
    return null;
  }
}
