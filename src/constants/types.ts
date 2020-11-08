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

interface useJwtManagerProps {
  refresh: () => Promise<ITokenParam>;
  me: { (): Promise<any>; (): Promise<IUser> };
  login: { (user: any): Promise<any>; (arg0: IUser): Promise<ITokenParam> };
  config: { TOKEN_KEY: string; REFRESH_TOKEN_KEY: string };
}

interface jwtManagerContext extends IUserContextReducerParams {
  login: (user: IUser) => void;
  logout: () => void;
  refrshToken: () => void;
}

export { ITokenParam, IUser, IUserContext, IUserContextReducerParams, useJwtManagerProps, jwtManagerContext };
