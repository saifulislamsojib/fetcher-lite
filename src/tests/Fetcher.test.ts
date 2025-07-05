import Fetcher, { type Configs, type FetcherError } from '@/index';
import { getLastFetchCall, mockFetchError, mockFetchResponse, mockFetchStream } from './mockFetch';

const baseUrl = 'https://jsonplaceholder.typicode.com';
const fetcher = new Fetcher({ baseUrl, timeout: 5000 });

type Post = {
  id?: number;
  title: string;
  body: string;
  userId: number;
};

type Comment = {
  postId: number;
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('FetcherJS basic API requests (mocked)', () => {
  it('should GET /posts and return an array of posts', async () => {
    mockFetchResponse([{ id: 1, title: 'Post', body: '...', userId: 1 }]);
    const res = await fetcher.get<Post[]>('/posts');
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const { method, url } = getLastFetchCall() || {};
    expect(url).toContain(baseUrl);
    expect(url).toContain('/posts');
    expect(method).toBe('GET');
  });

  it('should GET /posts/1 and return a post with id = 1', async () => {
    mockFetchResponse({ id: 1, title: 'Post', body: '...', userId: 1 });
    const res = await fetcher.get<Post>('/posts/1');
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.data).toHaveProperty('id', 1);
  });

  it('should POST /posts and receive a created object with id', async () => {
    const postData: Post = { title: 'foo', body: 'bar', userId: 1 };
    mockFetchResponse({ ...postData, id: 101 }, 201);
    const res = await fetcher.post('/posts', postData);
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('id');

    const { url, method } = getLastFetchCall() || {};
    expect(url).toContain('/posts');
    expect(method).toBe('POST');
  });

  it('should throw FetcherError on 404', async () => {
    mockFetchResponse({ error: 'Not found' }, 404);
    try {
      await fetcher.get('/invalid-endpoint');
    } catch (error) {
      const err = error as FetcherError;
      expect(err.ok).toBe(false);
      expect(err.status).toBe(404);
      expect(err.data).toEqual({ error: 'Not found' });

      const { url } = getLastFetchCall() || {};
      expect(url).toContain('/invalid-endpoint');
    }
  });

  it('should apply query parameters correctly', async () => {
    mockFetchResponse([{ postId: 1 }, { postId: 1 }]);
    const res = await fetcher.get<Comment[]>('/comments', {
      params: { postId: 1 },
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.every((c) => c.postId === 1)).toBe(true);
  });
});

describe('FetcherJS advanced cases (mocked)', () => {
  it('should handle FormData request body', async () => {
    const formData = new FormData();
    formData.append('title', 'form-title');
    formData.append('body', 'form-body');
    formData.append('userId', '1');

    mockFetchResponse({ id: 101 }, 201);
    const res = await fetcher.post('/posts', formData);
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('id');
  });

  it('should abort request after timeout', async () => {
    const slowFetcher = new Fetcher({ baseUrl, timeout: 1 });
    mockFetchError('TimeoutError');
    try {
      await slowFetcher.get('/posts/1');
    } catch (err) {
      const fetchErr = err as FetcherError;
      expect(fetchErr.ok).toBe(false);
      expect(fetchErr.status).toBe(408);
      expect(fetchErr.name).toBe('TimeoutError');
    }
  });

  it('should respect responseType: stream (Node.js only)', async () => {
    mockFetchStream('stream content');
    const res = await fetcher.get<ReadableStream>('/posts/1', { responseType: 'stream' });
    expect(typeof res.data?.getReader).toBe('function');
  });

  it('should trigger configExtractor with url', async () => {
    const spy = vi.fn((configs: Configs) => configs);
    const spyFetcher = new Fetcher({ baseUrl });
    spyFetcher.extractConfigs(spy);

    mockFetchResponse({ id: 1 });
    await spyFetcher.get('/posts/1');
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should trigger finalError and return custom error', async () => {
    const customFetcher = new Fetcher({ baseUrl });
    customFetcher.setFinalError((err) => {
      const wrapped = new Error('Custom Error Wrap');
      Object.assign(wrapped, err);
      return wrapped;
    });

    mockFetchResponse({ error: 'not found' }, 404);
    try {
      await customFetcher.get('/404');
    } catch (error) {
      const err = error as FetcherError;
      expect(err.message).toBe('Custom Error Wrap');
      expect(err.status).toBe(404);
    }
  });
});
