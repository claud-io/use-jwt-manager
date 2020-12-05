# use-jwt-manager

[![npm version](https://badge.fury.io/js/use-jwt-manager.svg)](https://badge.fury.io/js/use-jwt-manager)

1)Create a context

```
import React from 'react';
import { jwtManagerContext } from 'use-jwt-manager/dist/constants/types';

export const AuthConext = React.createContext<Partial<jwtManagerContext>>({});
```

2)Create an Interceptor (optional):
```
import axios from 'axios';
import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import{ AuthConext } from '../contexts';

const useInterceptor = (): void => {
  const context = useContext(AuthConext);
  const history = useHistory();
  useEffect(() => {
    axios.interceptors.response.use(
      (response) => response , 
      (error) => {
        const { status } = error.response;
        if (status == 401) {
          if (context.refresh_token) {
            //@ts-ignore 
            context.refresh();
          } else {
            //@ts-ignore 
            context.logout().then(
              ()=> history.push('/login')
            )
           
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);
};

export default useInterceptor;
```


3)Wrap your application with the Context provider

```
export const Root: React.FC<{}> = ({}) => {
  const config = { TOKEN_KEY, REFRESH_TOKEN_KEY };
  const authContext = useJWT({ login, me, refresh, config });
  useInterceptor();
  return (
    <AuthConext.Provider value={authContext}>
      <Router>
        <Switch>
          <Route path="/login" component={Login} exact />
          <PrivateRoute path="/" component={Home} exact />
        </Switch>
      </Router>
    </AuthConext.Provider>
  );
};
```
