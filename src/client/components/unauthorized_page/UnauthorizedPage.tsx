import React, { Component } from 'react';
import Runtime from '../../utils/runtime';

const SIGNIN_LINK = Runtime.getConfig().host_root + '/#login';

// Parent page component for the dashboard page
export class Unauthorized extends Component {
  render() {
    return (
      <section className="mt4">
        <h1>Signed out</h1>
        <p>
          <meta httpEquiv="refresh" content={`0;URL='${SIGNIN_LINK}'`} />
          <a href={SIGNIN_LINK}>Sign in or sign up</a>
        </p>
        {/* <SignIn /> */}
      </section>
    );
  }
}
