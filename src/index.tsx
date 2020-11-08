import React, { useCallback } from 'react';
import Lockr from 'lockr';
import { useEffect } from 'react';
import axios from 'axios';
import userContextReducer from './userContextReducer';
import { IUserContextReducerParams, jwtManagerContext, ITokenParam, IUser, useJwtManagerProps } from './constants/types';

const initialState: IUserContextReducerParams = {
  initialized: false,
  authenticated: false,
};

const useJwtManager: (props: useJwtManagerProps) => jwtManagerContext = ({ refresh, me, login, config }) => {
  const [state, dispatch] = React.useReducer(userContextReducer, initialState);
  const { TOKEN_KEY, REFRESH_TOKEN_KEY } = config;

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = useCallback(() => {
    const refresh_token: string = Lockr.get(REFRESH_TOKEN_KEY);
    if (state.authenticated || !refresh_token) {
      dispatch({ type: 'LOGOUT' });
    } else {
      axios.defaults.headers.Authorization = 'Bearer ' + refresh_token;
      refresh()
        .then(handleTokenReceived)
        .catch((message: string) => dispatch({ type: 'ERROR', payload: { error: message || 'refresh error' } }));
    }
  }, [state.authenticated]);

  const handleTokenReceived = useCallback(({ access_token, refresh_token }: ITokenParam) => {
    Lockr.set(TOKEN_KEY, access_token);
    if (refresh_token) {
      Lockr.set(REFRESH_TOKEN_KEY, refresh_token);
    }
    axios.defaults.headers.Authorization = 'Bearer ' + access_token;
    me()
      .then((user: IUser) => dispatch({ type: 'LOGIN', payload: { user, access_token, refresh_token } }))
      .catch((message: string) => dispatch({ type: 'ERROR', payload: { error: message || 'me error' } }));
  }, []);

  const _login = useCallback(
    (user: IUser) =>
      login(user)
        .then(handleTokenReceived)
        .catch((message: string) => dispatch({ type: 'ERROR', payload: { error: message || 'login error' } })),
    []
  );

  const _logout = useCallback(() => {
    Lockr.rm(TOKEN_KEY);
    Lockr.rm(REFRESH_TOKEN_KEY);
    axios.defaults.headers.Authorization = null;
    dispatch({ type: 'LOGOUT' });
  }, []);

  return {
    ...state,
    login: _login,
    logout: _logout,
    refrshToken: refreshToken,
  };
};
export default useJwtManager;
