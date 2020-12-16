interface UserDetails {
  id?: number;
  username?: string;
  password?: string;
  [x: string]: any;
}

interface UserContextReducerParams {
  user?: UserDetails;
  token?: string;
  initialized?: boolean;
  authenticated?: boolean;
  error?: string;
}

interface TokenParams {
  token: string;
  [x: string]: any;
}

interface jwtManagerProps {
  refresh: () => Promise<TokenParams>;
  me: () => Promise<UserDetails>;
  login: (user: UserDetails) => Promise<TokenParams>;
  config: { TOKEN_KEY: string };
}

interface jwtManagerContext extends UserContextReducerParams {
  login: (user: UserDetails) => Promise<UserDetails>;
  logout: () => Promise<boolean>;
  refresh: () => void;
}

class JwtError extends Error {
  cause: any;
  constructor(message: string, cause: any) {
    super(message);
    this.cause = cause;
    this.name = 'JwtError';
  }
}

export { TokenParams, UserDetails, UserContextReducerParams, jwtManagerProps, jwtManagerContext, JwtError };
