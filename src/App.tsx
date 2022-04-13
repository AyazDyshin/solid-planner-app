import React, { useState, useEffect } from "react";
import "regenerator-runtime/runtime";

import {
  login,
  logout,
  handleIncomingRedirect,
  fetch,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";

const REDIRECT_URL = "http://localhost:3113/";
const CLIENT_APP_WEBID =
  "https://raw.githubusercontent.com/inrupt/solid-client-authn-js/main/packages/browser/examples/single/bundle/client-app-profile.ttl#app";

const App: React.FC = () => {
  const [webId, setWebId] = useState<string | undefined>(getDefaultSession().info.webId);
  const [issuer, setIssuer] = useState<string>("https://inrupt.net");
  const [resource, setResource] = useState<string | undefined>(webId);
  const [data, setData] = useState("");

  // The useEffect hook is executed on page load, and in particular when the user
  // is redirected to the page after logging in the identity provider.
  useEffect(() => {
    // After redirect, the current URL contains login information.
    handleIncomingRedirect({
      restorePreviousSession: true,
    }).then((info) => {
      setWebId(info?.webId);
      setResource(webId);
    });
  }, [webId]);

//   const errorHandle = (error, errorDescription) => {
//     console.log(`${error} has occured: `, errorDescription);
//   };

  function handleLogin(e:React.MouseEvent<HTMLButtonElement, MouseEvent>){
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
    // The following has no impact on the logout, it just resets the UI.
    setWebId(undefined);
    setData("");
    setResource("");
  };

  const handleFetch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    fetch(resource??"", { headers: new Headers({ Accept: "text/turtle" }) })
      .then((response) => response.text())
      .then(setData);
  };

  return (
    <div>
      <main>
        <h1>Sandbox app</h1>
        <p>{webId ? `Logged in as ${webId}` : "Not logged in yet"}</p>
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
          <button onClick={(e) => handleFetch(e)}>Fetch</button>
        </div>
        <pre>{data}</pre>
      </main>
    </div>
  );
}
export default App;