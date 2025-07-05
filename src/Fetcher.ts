import type {
  Configs,
  FetcherError,
  FetcherOptions,
  FetchOptions,
  FetchParams,
  FinalError,
  JsonAble,
  MethodOptions,
  OptionExtractor,
  RequestBody,
  ResponseBody,
  ResponseType,
} from './types';

class Fetcher {
  private configs: Configs = {};
  private baseUrl: string;
  private timeout: number;

  private configsExtractor: OptionExtractor = (configs) => configs;
  private finalError: FinalError = (err) => err;

  constructor({ baseUrl = '', timeout = 0 }: FetcherOptions = {}) {
    if (typeof fetch === 'undefined') {
      throw new Error(
        'The Fetch Web API is not supported in this environment, please use in a browser environment or Node.js version >= 18',
      );
    }

    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  public extractConfigs(optionExtractor: OptionExtractor) {
    this.configsExtractor = optionExtractor;
  }

  public setFinalError(finalError: FinalError) {
    this.finalError = finalError;
  }

  public setDefaultConfigs(configs: Configs) {
    this.configs = configs;
  }

  private isJson(res: Response) {
    return res.headers.get('content-type')?.includes('application/json');
  }

  private async fetcher<TResData extends ResponseBody>(
    url: string | URL,
    options: FetchOptions,
    body?: RequestBody,
  ) {
    const timeout = options.timeout ?? this.timeout;
    const params = options.params;
    const responseType = options.responseType || 'json';
    delete options.responseType;

    if (params) {
      const search = Fetcher.convertParams(params);
      if (url instanceof URL) {
        url.search += (url.search ? '&' : '?') + search;
      } else {
        url += (url.includes('?') ? '&' : '?') + search;
      }
      delete options.params;
    }

    if (timeout) {
      delete options.timeout;
      const timeoutSignal = AbortSignal.timeout(timeout);
      if (options.signal) {
        options.signal = AbortSignal.any([options.signal, timeoutSignal]);
      } else {
        options.signal = timeoutSignal;
      }
    }

    const finalOptions: RequestInit = { ...this.configsExtractor(this.configs, url), ...options };

    if (body instanceof FormData) {
      if (finalOptions.headers) Fetcher.getHeaders(finalOptions).delete('Content-Type');
      finalOptions.body = body;
    } else if (body !== undefined) {
      if (!finalOptions.headers) {
        finalOptions.headers = { 'Content-Type': 'application/json' };
      } else {
        Fetcher.getHeaders(finalOptions).set('Content-Type', 'application/json');
      }
      finalOptions.body = JSON.stringify(body);
    }
    const response = await fetch(
      url instanceof URL ? url : url.startsWith('http') ? url : `${this.baseUrl}${url}`,
      finalOptions,
    ).catch(async (err: Error) => {
      const isTimeout = err.name === 'TimeoutError' || err.message === 'TimeoutError';
      const error = new Error(
        isTimeout ? 'Request timed out' : err.message || 'Failed to fetch',
      ) as FetcherError;
      error.status = 500;
      error.ok = false;
      error.name = isTimeout ? 'TimeoutError' : err.name || 'NetworkError';
      if (isTimeout) error.status = 408;
      throw await this.finalError(error, url);
    });

    if (!response.ok) {
      const error = new Error(
        `Request failed with status code ${response.status} -- ${response.statusText}`,
      ) as FetcherError;
      error.name = response.statusText;
      error.status = response.status;
      error.ok = false;
      if (this.isJson(response)) error.data = (await response.json()) as JsonAble;
      throw await this.finalError(error, url);
    }

    let data: TResData;
    if (
      options.method !== 'HEAD' &&
      options.method !== 'OPTIONS' &&
      (responseType !== 'json' || this.isJson(response))
    ) {
      if (responseType === 'stream') {
        data = response.body as TResData;
      } else {
        data = (await response[responseType]()) as TResData;
      }
    } else {
      data = null as TResData;
    }

    const responseObj: ResponseType<TResData> = {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data,
    };
    return responseObj;
  }

  public get<T extends ResponseBody = JsonAble>(url: string | URL, options: MethodOptions = {}) {
    return this.fetcher<T>(url, { ...options, method: 'GET' });
  }

  public post<T extends ResponseBody = JsonAble>(
    url: string | URL,
    body: RequestBody,
    options: MethodOptions = {},
  ) {
    return this.fetcher<T>(url, { ...options, method: 'POST' }, body);
  }

  public patch<T extends ResponseBody = JsonAble>(
    url: string | URL,
    body: RequestBody,
    options: MethodOptions = {},
  ) {
    return this.fetcher<T>(url, { ...options, method: 'PATCH' }, body);
  }

  public put<T extends ResponseBody = JsonAble>(
    url: string | URL,
    body: RequestBody,
    options: MethodOptions = {},
  ) {
    return this.fetcher<T>(url, { ...options, method: 'PUT' }, body);
  }

  public delete<T extends ResponseBody = JsonAble>(url: string | URL, options: MethodOptions = {}) {
    return this.fetcher<T>(url, { ...options, method: 'DELETE' });
  }

  public head(url: string | URL, options: Omit<MethodOptions, 'responseType'> = {}) {
    return this.fetcher<null>(url, { ...options, method: 'HEAD' });
  }

  public options(url: string | URL, options: Omit<MethodOptions, 'responseType'> = {}) {
    return this.fetcher<null>(url, { ...options, method: 'OPTIONS' });
  }

  static convertParams = (params: FetchParams) => {
    const paramsArr = Object.keys(params);
    if (!paramsArr.length) return '';
    const searchParams = new URLSearchParams();
    paramsArr.forEach((key) => {
      const value = params[key];
      if (value === undefined || value === null || value === '') return;
      if (typeof value === 'string') {
        searchParams.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v === undefined || v === null || v === '') return;
          if (typeof v === 'string') {
            searchParams.append(key, v);
          } else {
            searchParams.append(key, String(v));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  };

  static getHeaders = (init: Pick<RequestInit, 'headers'>): Headers => {
    if (init.headers instanceof Headers) return init.headers;
    init.headers = new Headers(init.headers);
    return init.headers;
  };
}

Object.freeze(Fetcher);
export default Fetcher;
export const { convertParams, getHeaders } = Fetcher;
