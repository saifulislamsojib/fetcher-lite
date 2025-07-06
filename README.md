# 📦 Fetcher Lite – Universal Fetch Wrapper

`fetcher-lite` is a lightweight, universal wrapper around the native `fetch` API for **both browser and Node.js (v18+)**, providing an **Axios-like** developer experience.

## ✨ Features

- ✅ Works in **Node.js v18+** and all modern browsers
- ✅ Fully typed with **TypeScript**
- ✅ Axios-like features:
  - `baseUrl`
  - `timeout` with `AbortSignal`
  - Default request configs
  - Query params (`params`) like Axios
  - JSON-aware error handling
  - Supports `FormData` and JSON request bodies
  - Custom error processor (`onFinalError`)
  - Request config extractor (`configExtractor`)
  - `responseType` support (`json`, `text`, `blob`, `arrayBuffer`, `stream`)

## 🚀 Installation

Install with your preferred package manager:

```bash
# npm
npm install fetcher-lite

# yarn
yarn add fetcher-lite

# pnpm
pnpm add fetcher-lite
```

## 🛠️ Basic Usage

```ts
import { createFetcher } from 'fetcher-lite';

const fetcher = createFetcher({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
});

const response = await fetcher.get('/users');
console.log(response.data);
```

## 📘 API Overview

### `createFetcher({ baseUrl?, timeout? })`

- Create a new instance

### `fetcher.get(url, options)`

### `fetcher.post(url, body, options)`

### `fetcher.put(url, body, options)`

### `fetcher.patch(url, body, options)`

### `fetcher.delete(url, options)`

### `fetcher.head(url, options)`

### `fetcher.options(url, options)`

### Options (Axios-style)

````ts
{
  timeout?: number;
  signal?: AbortSignal;
  params?: Record<string, string | string[]>;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream';
  headers?: Record<string, string>;
  // Native fetch options supported by Next.js
  next?: {
    revalidate?: number;
    tags?: string[];
  };
  cache?: RequestCache;
  // ...plus other native fetch init options
}
```ts
````

## 🔁 Setting Defaults

```ts
fetcher.setDefaultConfigs({
  headers: {
    Authorization: 'Bearer token',
  },
});
```

## ⚙️ Custom Config Extractor

```ts
fetcher.extractConfigs((options, url) => {
  console.log('About to call', url);
  return options;
});
```

## 🧨 Custom Final Error Handler

```ts
fetcher.setFinalError((err, url) => {
  console.error('Failed to fetch:', url);
  return err;
});
```

## 🌐 Query Parameters

```ts
await fetcher.get('/search', {
  params: {
    q: 'fetch',
    page: 2,
    tags: ['typescript', 'node'],
  },
});
```

## 💥 Error Handling

Errors include:

- `status`
- `ok: false`
- Optional `data` (parsed if response is JSON)

```ts
try {
  await fetcher.get('/fail');
} catch (err) {
  console.error(err.status); // e.g., 404
  console.error(err.data); // JSON response body if available
}
```

## 📦 Supported Body Types

- `JSON`
- `FormData`

Automatically sets or removes `Content-Type` header based on body type.

## 📄 Response Shape

```ts
{
  status: number;
  ok: true;
  headers: Headers;
  data: T; // based on responseType
}
```

## 🧪 Advanced: Timeout + AbortSignal

```ts
const abort = new AbortController();
setTimeout(() => abort.abort(), 1000);

await fetcher.get('/users', {
  timeout: 5000,
  signal: abort.signal,
});
```

## 📚 TypeScript Tips

- Use generic to type the response:

```ts
type User { id: number; name: string }
const res = await fetcher.get<User[]>('/users');

// Define your expected error shape
import type { FetcherError } from 'fetcher-lite';

try {
  await fetcher.get('/fail');
} catch (err) {
  const fetcherError = err as FetcherError<{ message: string }>;
  console.error(fetcherError.status); // e.g., 404
  console.error(fetcherError.data.message); // if JSON response with message string
}
```

- Node.js v18+ or modern browser
- If using older Node.js: use a fetch polyfill like `undici`

---

## 🔚 License

MIT
