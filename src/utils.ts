import { ScopedVars } from '@grafana/data';
import { FetchError, toDataQueryResponse } from '@grafana/runtime';
import { SyntheticEvent } from 'react';

/*
 * This regex matches 3 types of variable reference with an optional format specifier
 * \$(\w+)                          $var1
 * \[\[([\s\S]+?)(?::(\w+))?\]\]    [[var2]] or [[var2:fmt2]]
 * \${(\w+)(?::(\w+))?}             ${var3} or ${var3:fmt3}
 */
export const variableRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::([^\}]+))?}/g;

export const SEARCH_FILTER_VARIABLE = '__searchFilter';

export const containsSearchFilter = (query: string | unknown): boolean =>
  query && typeof query === 'string' ? query.indexOf(SEARCH_FILTER_VARIABLE) !== -1 : false;

export const getSearchFilterScopedVar = (args: {
  query: string;
  wildcardChar: string;
  options: { searchFilter?: string };
}): ScopedVars => {
  const { query, wildcardChar } = args;
  if (!containsSearchFilter(query)) {
    return {};
  }

  let { options } = args;

  options = options || { searchFilter: '' };
  const value = options.searchFilter ? `${options.searchFilter}${wildcardChar}` : `${wildcardChar}`;

  return {
    __searchFilter: {
      value,
      text: '',
    },
  };
};

export enum PasswordFieldEnum {
  Password = 'password',
  BasicAuthPassword = 'basicAuthPassword',
}

/**
 * Basic shape for settings controllers in at the moment mostly angular data source plugins.
 */
export type Ctrl = {
  current: {
    secureJsonFields: {
      [key: string]: boolean;
    };
    secureJsonData?: {
      [key: string]: string;
    };
    password?: string;
    basicAuthPassword?: string;
  };
};

export const createResetHandler = (ctrl: Ctrl, field: PasswordFieldEnum) => (
  event: SyntheticEvent<HTMLInputElement>
) => {
  event.preventDefault();
  // Reset also normal plain text password to remove it and only save it in secureJsonData.
  ctrl.current[field] = undefined;
  ctrl.current.secureJsonFields[field] = false;
  ctrl.current.secureJsonData = ctrl.current.secureJsonData || {};
  ctrl.current.secureJsonData[field] = '';
};

export const createChangeHandler = (ctrl: any, field: PasswordFieldEnum) => (
  event: SyntheticEvent<HTMLInputElement>
) => {
  ctrl.current.secureJsonData = ctrl.current.secureJsonData || {};
  ctrl.current.secureJsonData[field] = event.currentTarget.value;
};

export function toTestingStatus(err: FetchError): any {
  const queryResponse = toDataQueryResponse(err);
  // POST api/ds/query errors returned as { message: string, error: string } objects
  if (queryResponse.error?.data?.message) {
    return {
      status: 'error',
      message: queryResponse.error.data.message,
      details: queryResponse.error?.data?.error ? { message: queryResponse.error.data.error } : undefined,
    };
  }
  // POST api/ds/query errors returned in results object
  else if (queryResponse.error?.refId && queryResponse.error?.message) {
    return {
      status: 'error',
      message: queryResponse.error.message,
    };
  }

  throw err;
}
