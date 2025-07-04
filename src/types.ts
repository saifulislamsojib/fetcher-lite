type FetchParamsValue = string | undefined | null | number | boolean;
export type FetchParams = Record<string, FetchParamsValue | FetchParamsValue[]>;
type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonPrimitive[] | JsonObject[] | JsonArray[];
export interface JsonObject {
  [key: string]: JsonPrimitive | JsonObject | JsonArray;
}
export type JsonAble = JsonPrimitive | JsonObject | JsonArray;
export type RequestBody = JsonAble | FormData;
export type ResponseBody =
  | JsonAble
  | ArrayBuffer
  | ReadableStream<Uint8Array>
  | null
  | string
  | Blob
  | NodeJS.ReadableStream;

export type Configs = Omit<RequestInit, 'body' | 'signal' | 'method'>;

export type MethodOptions = Configs & {
  timeout?: number;
  signal?: AbortSignal | null;
  params?: FetchParams;
  responseType?: 'json' | 'arrayBuffer' | 'text' | 'stream' | 'blob';
};

export type FetchOptions = MethodOptions & {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
};

export type ResponseType<T extends ResponseBody> = {
  status: number;
  ok: true;
  data: T;
  headers: Headers;
};

export interface FetcherError<T extends JsonAble = JsonAble> extends Error {
  status: number;
  ok: false;
  data?: T;
}

export type OptionExtractor = (options: Configs, url: string | URL) => Configs;

export type FinalError = (err: FetcherError, url: string | URL) => Error | Promise<Error>;

export type FetcherOptions = {
  baseUrl?: string;
  timeout?: number;
};
