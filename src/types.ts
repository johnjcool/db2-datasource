import { BusEventWithPayload, DataQuery, DataSourceJsonData, VariableModel } from '@grafana/data';
import { IconName } from '@grafana/ui';

export interface Db2QueryForInterpolation {
  alias?: any;
  format?: any;
  rawSql?: any;
  refId: any;
  hide?: any;
}

/**
 * These are options configured for each DataSource instance.
 */
export interface Db2Options extends DataSourceJsonData {
  timeInterval: string;
}

export type ResultFormat = 'time_series' | 'table';

export interface Db2Query extends DataQuery {
  alias?: string;
  format?: ResultFormat;
  rawSql?: any;
}

export interface ShowConfirmModalPayload {
  title?: string;
  text?: string;
  text2?: string;
  text2htmlBind?: boolean;
  confirmText?: string;
  altActionText?: string;
  yesText?: string;
  noText?: string;
  icon?: IconName;

  onConfirm?: () => void;
  onAltAction?: () => void;
}

export class ShowConfirmModalEvent extends BusEventWithPayload<ShowConfirmModalPayload> {
  static type = 'show-confirm-modal';
}

export interface VariableWithMultiSupport extends VariableWithOptions {
  multi: boolean;
  includeAll: boolean;
  allValue?: string | null;
}

export interface VariableWithOptions extends VariableModel {
  current: VariableOption;
  options: VariableOption[];
  query: string;
}

export interface VariableOption {
  selected: boolean;
  text: string | string[];
  value: string | string[];
  isNone?: boolean;
}
