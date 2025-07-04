import Fetcher, { convertParams } from '@/index';

it('convertParams test', () => {
  const params = convertParams({ name: 'sojib' });
  expect(params).toBe('name=sojib');
});

it('object test', async () => {
  const fetcher = new Fetcher();
  const response = await fetcher.get('https://jsonplaceholder.typicode.com/todos/1');
  console.log(response);
  expect(response.status).toBe(200);
  expect(response.ok).toBeTruthy();
  expect(response.data).toBeTruthy();
});
