import { UserDetails, UserContextReducerParams } from './constants/types';

type Actions =
  | { type: 'LOGIN'; payload: { user: UserDetails; access_token: string; refresh_token: string } | {} }
  | { type: 'LOGOUT' };

const userContextReducer = (state: UserContextReducerParams, action: Actions): UserContextReducerParams => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        ...action.payload,
        authenticated: true,
        initialized: true,
      };
    case 'LOGOUT':
      return { authenticated: false, initialized: true };
  }
};

export default userContextReducer;
