import Lockr from 'lockr';
import useJWT from './src';
import { renderHook, act } from '@testing-library/react-hooks';
import { TokenParams, UserDetails, JwtError } from './src/constants/types';

const USER = { id: 1, username: 'finto', password: 'finta', role: 'call center' };
const TOKEN_KEY = 'BANANA';

function refresh(forceFail = false) {
  return new Promise<TokenParams>((resolve, reject) => {
    forceFail ? reject({ code: 'B4N4N41', description: 'refresh stuff' }) : resolve({ token: 'new_at1' });
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
      resolve({ token: 'new_at2' });
    }
    reject({ code: 'B4N4N43' });
  });
}

const config = { TOKEN_KEY };

test('not authenticated if no jwt present in ls at start', () => {
  const { result } = renderHook(() => useJWT({ login, me, refresh, config }));

  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);

  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
});

test('authenticated if jw present at start', async () => {
  Lockr.set(TOKEN_KEY, 'old_token');
  const { result, waitForNextUpdate } = renderHook(() => useJWT({ login, me, refresh, config }));
  console.log(result.current);
  await waitForNextUpdate();
  // assert initial state
  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(true);
  expect(result.current.user).toEqual(USER);
  expect(result.current.token).toEqual('new_at1');

  expect(Lockr.get(TOKEN_KEY)).toEqual('new_at1');
});

test('login with correct user will succeed and can log out', async () => {
  Lockr.rm(TOKEN_KEY);
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
  expect(result.current.token).toEqual('new_at2');
  expect(Lockr.get(TOKEN_KEY)).toEqual('new_at2');

  await act(async () => {
    result.current.logout().then((response) => expect(response).toBeTruthy());
    await waitForNextUpdate();
  });

  expect(result.current.initialized).toBe(true);
  expect(result.current.authenticated).toBe(false);
  expect(result.current.user).toBe(undefined);
  expect(result.current.token).toBe(undefined);
  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
});

test('login with wrong user will fail', () => {
  Lockr.rm(TOKEN_KEY);
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
  expect(result.current.token).toBe(undefined);

  expect(Lockr.get(TOKEN_KEY)).toBe(undefined);
});
