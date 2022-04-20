import React, { useState } from "react";
import "regenerator-runtime/runtime";
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

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    logout();
    setWebId(undefined);
    setResource("");
    setLogInStatus(false);
  };

  return (
    <div>
      <main>
        <h1>Sandbox app</h1>
        <p>{logInStatus ? "You are logged in!" : "Not logged in yet"}</p>
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
            <button onClick={(e) => handleLogout(e)}>Log Out</button>
          </form>
        </div>
        <hr />
        <div>
          <input
            type="text"
            value={resource}
            onChange={(e) => {
              setResource(e.target.value);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default LogInPage;