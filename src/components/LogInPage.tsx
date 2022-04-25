import React, { useState } from "react";
import "regenerator-runtime/runtime";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  login,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";
import { Button, InputGroup, Dropdown, DropdownButton, FormControl, Form} from 'react-bootstrap';
interface Props {
  logInStatus: boolean;
  setLogInStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const LogInPage = ({ logInStatus, setLogInStatus }: Props) => {

  const [webId, setWebId] = useState<string | undefined>(getDefaultSession().info.webId);
  const [issuer, setIssuer] = useState<string>("https://");
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
    <div className="container">
      
      <Form className="container w-50 px-5 pt-5 pb-5 border border-3 mt-5 rounded border-secondary shadow-lg">
      <h3 className="display-3 text-center mb-5">Solid Planner App</h3>
        <InputGroup>
          <DropdownButton
            variant="outline-secondary"
            title="Choose a provider"
            id="input-group-dropdown-1"
          >
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://inrupt.net")
            }}>inrupt.net</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://broker.pod.inrupt.com")
            }}>Broker Pod Inrupt (Entreprise Solid Server)</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://dev.inrupt.net")
            }}>dev.inrupt.net</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://solidcommunity.net")
            }}>SolidCommunity.net</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://solidweb.org")
            }}>Solidweb.org</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => {
              setIssuer("https://trinpod.us/")
            }}>Trinpod.us</Dropdown.Item>
          </DropdownButton>
          <FormControl aria-label="Text input with dropdown button" value={issuer}
            onChange={(e) => {
              setIssuer(e.target.value);
            }} />
        </InputGroup>
        <div className="d-grid gap-2 mt-2">
        <Button onClick={(e) => handleLogin(e)}>Log In</Button>
        </div>
      </Form>
    </div>

  )
}


export default LogInPage;

