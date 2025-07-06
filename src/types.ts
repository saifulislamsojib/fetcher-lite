type Primitive = string | number | boolean | null | undefined;
type JsonPrimitive = Exclude<Primitive, undefined>;
export type JsonAble = JsonPrimitive | JsonObject | JsonAble[];
export interface JsonObject {
  [key: string]: JsonAble | undefined;
}
export type FetcherParams = Record<string, Primitive | Primitive[]>;
export type RequestBody = JsonAble | FormData;
export type ResponseBody =
  | JsonAble
  | ArrayBuffer
  | ReadableStream
  | Blob
  | Uint8Array<ArrayBufferLike>;

export type Configs = Omit<RequestInit, 'body' | 'signal' | 'method'>;

type Bytes = 'bytes' extends keyof Response ? 'bytes' : never;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type ResponseType = 'json' | 'arrayBuffer' | 'text' | 'stream' | 'blob' | Bytes;

export type MethodOptions = Configs & {
  timeout?: number;
  signal?: AbortSignal | null;
  params?: FetcherParams;
  responseType?: ResponseType;
};

export type FetchOptions = MethodOptions & {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
};

export type FetcherResponse<T extends ResponseBody> = Omit<
  Response,
  ResponseType | 'body' | 'formData' | 'clone'
> & {
  ok: true;
  data: T;
};

export interface FetcherError<T extends JsonAble = JsonAble> extends Error {
  status: number;
  ok: false;
  data?: T;
}

export type OptionExtractor = (options: Configs, url: string | URL) => Configs;

export type FinalError = (err: FetcherError, url: string | URL) => Error | Promise<Error>;

export type FetcherOptions = { baseUrl?: string; timeout?: number };
