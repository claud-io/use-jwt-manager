import { IUser, IUserContextReducerParams } from './UserContext';

type Actions =
  | { type: 'LOGIN'; payload: { user: IUser; access_token: string; refresh_token: string } | {} }
  | { type: 'ERROR'; payload: { error: string } }
  | { type: 'LOGOUT' };

const userContextReducer = (state: IUserContextReducerParams, action: Actions): IUserContextReducerParams => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        ...action.payload,
        authenticated: true,
        initialized: true,
      };
    case 'ERROR':
      return { ...state, ...action.payload };
    case 'LOGOUT':
      return { authenticated: false, initialized: true };
  }
};

export default userContextReducer;
