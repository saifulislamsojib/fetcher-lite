import type { JsonAble } from '../';

type HeadersInit = Exclude<RequestInit['headers'], undefined>;
type MockFetchCall = {
  method: string;
  url: string;
  body?: unknown;
  headers?: HeadersInit;
};

let lastCall: MockFetchCall | null = null;

export function getLastFetchCall() {
  return lastCall;
}

export function mockFetchResponse(
  body: JsonAble,
  status = 200,
  headers?: HeadersInit,
  method = 'GET',
) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL, init?: RequestInit) => {
      lastCall = {
        method: init?.method || method,
        url: typeof input === 'string' ? input : input.toString(),
        headers: init?.headers,
        body: init?.body
          ? init.body instanceof FormData
            ? init.body
            : JSON.parse(init.body as string)
          : undefined,
      };
      return new Promise<Response>((re) =>
        setTimeout(
          () =>
            re(
              new Response(JSON.stringify(body), {
                status,
                headers: {
                  'Content-Type': 'application/json',
                  ...headers,
                },
              }),
            ),
          500,
        ),
      );
    }),
  );
}

export function mockFetchText(text: string, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(text, {
          status,
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    ),
  );
}

export function mockFetchStream(data = 'stream data', status = 200) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(data));
      controller.close();
    },
  });

  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(stream, {
          status,
          headers: { 'Content-Type': 'application/octet-stream' },
        }),
      ),
    ),
  );
}

export function mockFetchError(message = 'Network Error') {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error(message))),
  );
}
