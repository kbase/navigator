import React from 'react';
import { render } from 'react-dom';
import AuthWrapper, { AuthContext, AuthenticationStatus } from './Auth';
import App from './App';
import { AsyncProcessStatus } from '../utils/AsyncProcess';
import ErrorMessage from './ErrorMessage';
import Loading from './generic/Loading';
import Runtime from '../utils/runtime';

export const Main = () => {
  return (
    <AuthWrapper>
      <AuthContext.Consumer>
        {(value) => {
          switch (value.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
              return <Loading message="Authenticating..." />;
            case AsyncProcessStatus.ERROR:
              return <ErrorMessage message={value.message} />;
            case AsyncProcessStatus.SUCCESS:
              switch (value.value.status) {
                case AuthenticationStatus.NONE:
                case AuthenticationStatus.UNAUTHENTICATED:
                  if (/kbase\.us$/.test(document.location.host)) {
                    document.location.href =
                      Runtime.getConfig().host_root + '/#login';
                    return <Loading message="Redirecting to login..." />;
                  } else {
                    return (
                      <ErrorMessage message="The Navigator requires authentication" />
                    );
                  }
                case AuthenticationStatus.AUTHENTICATED:
                  return (
                    <App
                      authInfo={value.value.authInfo}
                      userProfile={value.value.userProfile}
                    />
                  );
              }
          }
        }}
      </AuthContext.Consumer>
    </AuthWrapper>
  );
};

export function main(root: Element | null) {
  render(Main(), root);
}
