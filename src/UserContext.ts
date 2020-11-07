interface IUser {
  id?: number;
  username?: string;
  password?: string;
  [x: string]: any;
}

interface IUserContextReducerParams {
  user?: IUser;
  access_token?: string;
  refresh_token?: string;
  initialized?: boolean;
  authenticated?: boolean;
  error?: string;
}

interface IUserContext extends IUserContextReducerParams {
  login: (user: IUser) => void;
  logout: () => void;
  refrshToken: () => void;
}

interface ITokenParam {
  access_token: string;
  refresh_token?: string;
}

export { ITokenParam, IUser, IUserContext, IUserContextReducerParams };
