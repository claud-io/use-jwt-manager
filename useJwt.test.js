import Lockr from 'lockr';
import useJWT from './src';
import { renderHook, act } from '@testing-library/react-hooks';

const USER = { id: 1, username: 'finto', password: 'finta', role: 'call center' };
const TOKEN_KEY = 'BANANA';
const REFRESH_TOKEN_KEY = 'BANANA_ROTATE';

function refresh() {
  console.log(`calling refresh`);
  return new Promise((resolve, reject) => {
    resolve({ access_token: 'new_at1', refresh_token: 'new_rt1' });
  });
}

function me() {
  console.log(`calling me`);
  return new Promise((resolve, reject) => {
    resolve(USER);
  });
}

function login(user) {
  console.log(`calling login for ${user.username}`);
  return new Promise((resolve, reject) => {
    if (user.username == 'finto') {
      resolve({ access_token: 'new_at2', refresh_token: 'new_rt2' });
    }
    reject('nope');
  });
}

const config = { TOKEN_KEY, REFRESH_TOKEN_KEY };

test('not authenticated if no jwt present in ls at start', () => {
  const { result } = renderHook(() => useJWT({ login, me, refresh, config }));

  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);

  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
  expect(Lockr.get(REFRESH_TOKEN_KEY)).toBe(undefined);
});

test('authenticated if jw present at start', async () => {
  Lockr.rm(TOKEN_KEY);
  Lockr.rm(REFRESH_TOKEN_KEY);
  Lockr.set(REFRESH_TOKEN_KEY, 'old_rt');
  const { result, waitForNextUpdate } = renderHook(() => useJWT({ login, me, refresh, config }));
  await waitForNextUpdate();
  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(true);
  expect(result.current.user).toEqual(USER);
  expect(result.current.access_token).toEqual('new_at1');
  expect(result.current.refresh_token).toEqual('new_rt1');

  expect(Lockr.get(TOKEN_KEY)).toEqual('new_at1');
  expect(Lockr.get(REFRESH_TOKEN_KEY)).toEqual('new_rt1');
});

test('login with correct user will succeed and can log out', async () => {
  Lockr.rm(TOKEN_KEY);
  Lockr.rm(REFRESH_TOKEN_KEY);
  const { result, waitForNextUpdate } = renderHook(() => useJWT({ login, me, refresh, config }));

  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);

  await act(async () => {
    //log in with existing user
    result.current.login({ username: 'finto', password: 'finta' });
    await waitForNextUpdate();
  });

  //assert user logged in
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(true);
  expect(result.current.user).toEqual(USER);
  expect(result.current.access_token).toEqual('new_at2');
  expect(result.current.refresh_token).toEqual('new_rt2');

  expect(Lockr.get(TOKEN_KEY)).toEqual('new_at2');
  expect(Lockr.get(REFRESH_TOKEN_KEY)).toEqual('new_rt2');

  await act(async () => {
    //log in with existing user
    result.current.logout();
    await waitForNextUpdate();
  });

  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);
  expect(result.current.user).toBe(undefined);
  expect(result.current.access_token).toBe(undefined);
  expect(result.current.refresh_token).toBe(undefined);

  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
  expect(Lockr.get(REFRESH_TOKEN_KEY)).toBe(undefined);
});

test('login with wrong user will fail', async () => {
  Lockr.rm(TOKEN_KEY);
  Lockr.rm(REFRESH_TOKEN_KEY);
  const { result, waitForNextUpdate } = renderHook(() => useJWT({ login, me, refresh, config }));

  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);

  await act(async () => {
    //log in with existing user
    result.current.login({ username: 'vero', password: 'vera' });
    await waitForNextUpdate();
  });

  //assert user fail to log in
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);
  expect(result.current.user).toBe(undefined);
  expect(result.current.access_token).toBe(undefined);
  expect(result.current.refresh_token).toBe(undefined);
  expect(result.current.error).toBeDefined();

  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
  expect(Lockr.get(REFRESH_TOKEN_KEY)).toBe(undefined);
});
