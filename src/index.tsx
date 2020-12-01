import React, { useCallback } from 'react';
import Lockr from 'lockr';
import { useEffect } from 'react';
import axios from 'axios';
import userContextReducer from './userContextReducer';
import {
  UserContextReducerParams,
  jwtManagerContext,
  TokenParams,
  UserDetails,
  jwtManagerProps,
  JwtError,
} from './constants/types';

const initialState: UserContextReducerParams = {
  initialized: false,
  authenticated: false,
};

/**
 * return the application's authentication status, pass it to a context so that it can be used everywhere
 * @param jwtManagerProps
 * @returns a jwtManagerContext
 */
const useJwtManager: (props: jwtManagerProps) => jwtManagerContext = ({ refresh, me, login, config }) => {
  const [state, dispatch] = React.useReducer(userContextReducer, initialState);
  const { TOKEN_KEY, REFRESH_TOKEN_KEY } = config;

  const refreshToken = useCallback(() => {
    const refresh_token: string = Lockr.get(REFRESH_TOKEN_KEY);
    if (state.authenticated || !refresh_token) {
      dispatch({ type: 'LOGOUT' });
    } else {
      axios.defaults.headers.Authorization = 'Bearer ' + refresh_token;
      refresh()
        .then(handleTokenReceived)
        .catch((cause: any) => {
          throw new JwtError('An error occurred trying to refresh the token', cause);
        });
    }
  }, [state.authenticated]);

  useEffect(refreshToken, []);

  const handleTokenReceived = useCallback(async ({ access_token, refresh_token }: TokenParams) => {
    let rToken = refresh_token;
    Lockr.set(TOKEN_KEY, access_token);
    if (rToken) {
      Lockr.set(REFRESH_TOKEN_KEY, rToken);
    } else {
      rToken = Lockr.get(REFRESH_TOKEN_KEY);
    }
    axios.defaults.headers.Authorization = 'Bearer ' + access_token;
    return await me()
      .then((user: UserDetails) => {
        dispatch({ type: 'LOGIN', payload: { user, access_token, refresh_token: rToken } });
        return user;
      })
      .catch((cause: any) => {
        throw new JwtError('An error occurred retrieving the user information', cause);
      });
  }, []);

  const _login = useCallback(
    async (user: UserDetails) =>
      await login(user)
        .then(handleTokenReceived)
        .then((user) => user)
        .catch((cause: any) => {
          throw new JwtError('An error occurred trying to log in', cause);
        }),
    []
  );

  const _logout = useCallback(async () => {
    Lockr.rm(TOKEN_KEY);
    Lockr.rm(REFRESH_TOKEN_KEY);
    axios.defaults.headers.Authorization = null;
    dispatch({ type: 'LOGOUT' });
    return await true;
  }, []);

  return {
    ...state,
    login: _login,
    logout: _logout,
    refresh: refreshToken,
  };
};
export default useJwtManager;
