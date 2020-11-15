import Lockr from 'lockr';
import useJWT from './src';
import { renderHook, act } from '@testing-library/react-hooks';
import { TokenParams, UserDetails, JwtError } from './src/constants/types';

const USER = { id: 1, username: 'finto', password: 'finta', role: 'call center' };
const TOKEN_KEY = 'BANANA';
const REFRESH_TOKEN_KEY = 'BANANA_ROTATE';

function refresh(forceFail = false) {
  return new Promise<TokenParams>((resolve, reject) => {
    forceFail
      ? reject({ code: 'B4N4N41', description: 'refresh stuff' })
      : resolve({ access_token: 'new_at1', refresh_token: 'new_rt1' });
  });
}

function me(forceFail = false) {
  return new Promise((resolve, reject) => {
    forceFail ? reject({ code: 'B4N4N42', description: 'me stuff' }) : resolve(USER);
  });
}

function login(user: UserDetails) {
  return new Promise<TokenParams>((resolve, reject) => {
    if (user.username == 'finto') {
      resolve({ access_token: 'new_at2', refresh_token: 'new_rt2' });
    }
    reject({ code: 'B4N4N43', description: 'login stuff' });
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
    result.current.login({ username: 'finto', password: 'finta' }).then((respnse) => expect(respnse).toEqual(USER));
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
    result.current.logout().then((response) => expect(response).toBeTruthy());
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

test('login with wrong user will fail', () => {
  Lockr.rm(TOKEN_KEY);
  Lockr.rm(REFRESH_TOKEN_KEY);
  const { result, waitForNextUpdate } = renderHook(() => useJWT({ login, me, refresh, config }));

  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);

  act(() => {
    //log in with existing user
    result.current.login({ username: 'vero', password: 'vera' }).catch((error: JwtError) => {
      expect(error.cause.code).toBe('B4N4N43');
    });
  });

  //assert user fail to log in
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);
  expect(result.current.user).toBe(undefined);
  expect(result.current.access_token).toBe(undefined);
  expect(result.current.refresh_token).toBe(undefined);

  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
  expect(Lockr.get(REFRESH_TOKEN_KEY)).toBe(undefined);
});
