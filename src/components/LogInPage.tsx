import React, { useState } from "react";
import "regenerator-runtime/runtime";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  login,
  logout,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";
import { Button, Card, InputGroup, Dropdown, DropdownButton, FormControl } from 'react-bootstrap';
interface Props {
  logInStatus: boolean;
  setLogInStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const LogInPage = ({ logInStatus, setLogInStatus }: Props) => {

  const [webId, setWebId] = useState<string | undefined>(getDefaultSession().info.webId);
  const [issuer, setIssuer] = useState<string>("");
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
      <div>
        <h3 className="display-3 text-center mt-4">Solid Planner App</h3>
      <div className="position-absolute top-50 start-50 translate-middle ">

        <InputGroup>
          <div className="row">
          <DropdownButton
            variant="outline-secondary"
            title="Choose a provider"
            id="input-group-dropdown-1"
          >
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://inrupt.net");
            }}>inrupt.net</Dropdown.Item>
            <Dropdown.Item href="#">Another action</Dropdown.Item>
            <Dropdown.Item href="#">Something else here</Dropdown.Item>
            <Dropdown.Item href="#">Separated link</Dropdown.Item>
          </DropdownButton>
          <FormControl aria-label="Text input with dropdown button" value={issuer}
            onChange={(e) => {
              setIssuer(e.target.value);
            }} />
            </div>
        </InputGroup>

        <div className="row">
          <Button onClick={(e) => handleLogin(e)}>Log In</Button>
          </div>
      </div>
      </div>
    
  )
}


export default LogInPage;

