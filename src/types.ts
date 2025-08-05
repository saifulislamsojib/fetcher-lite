type Primitive = string | number | boolean | null | undefined;
type JsonPrimitive = Exclude<Primitive, undefined>;
export type JsonAble = JsonPrimitive | JsonObject | JsonAble[];
export type JsonStringAble = JsonPrimitive | Date | JsonStringObject | JsonStringAble[];
export interface JsonObject {
  [key: string]: JsonAble | undefined;
}
export interface JsonStringObject {
  [key: string]: JsonStringAble | undefined;
}
export type FetcherParams = Record<string, Primitive | Primitive[]>;
export type RequestBody = JsonStringAble | FormData;
export type ResponseBody =
  | JsonAble
  | ArrayBuffer
  | ReadableStream
  | Blob
  | Uint8Array<ArrayBufferLike>;

export type Configs = Omit<RequestInit, 'body' | 'signal' | 'method'>;

type Bytes = 'bytes' extends keyof Response ? 'bytes' : never;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ResponseType = 'json' | 'arrayBuffer' | 'text' | 'stream' | 'blob' | Bytes;

export type BaseMethodOptions = Configs & {
  timeout?: number;
  signal?: AbortSignal | null;
  params?: FetcherParams;
};

export type MethodOptions = BaseMethodOptions & {
  responseType?: ResponseType;
};

export type FetcherResponse<B extends ResponseBody> = Omit<
  Response,
  ResponseType | 'body' | 'formData' | 'clone'
> & {
  ok: true;
  data: B;
};

export interface FetcherError<T extends JsonAble = JsonAble> extends Error {
  status: number;
  ok: false;
  data?: T;
}

export type ConfigsExtractor = (options: Configs, url: string | URL) => Configs;

export type FinalError = (err: FetcherError, url: string | URL) => Error | Promise<Error>;

export type FetcherOptions = { baseUrl?: string; timeout?: number };
