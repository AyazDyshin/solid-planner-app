import React, { useState } from "react";
import "regenerator-runtime/runtime";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  login,
  logout,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";

interface Props {
  logInStatus: boolean;
  setLogInStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const LogInPage = ({ logInStatus, setLogInStatus }: Props) => {

  const [webId, setWebId] = useState<string | undefined>(getDefaultSession().info.webId);
  const [issuer, setIssuer] = useState<string>("https://inrupt.net");
  const [resource, setResource] = useState<string | undefined>(webId);

  function handleLogin(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    // The default behaviour of the button is to resubmit.
    // This prevents the page from reloading.
    e.preventDefault();
    // Login will redirect the user away so that they can log in the OIDC issuer,
    // and back to the provided redirect URL (which should be controlled by your app).
    login({
      oidcIssuer: issuer,
      redirectUrl: window.location.href,
    });
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <main>
        <h1>Solid Planner App</h1>
        <div>
          <form>
            <input
              type="text"
              value={issuer}
              onChange={(e) => {
                setIssuer(e.target.value);
              }}
            />
            <button onClick={(e) => handleLogin(e)}>Log In</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LogInPage;