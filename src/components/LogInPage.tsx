import React, { useState } from "react";
import "regenerator-runtime/runtime";
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginButton } from "@inrupt/solid-ui-react";
import { Button, InputGroup, Dropdown, DropdownButton, FormControl, Form } from 'react-bootstrap';
// Login page, Dropdown menu for the user to choose the issuer
// The login functionality itself is done by LoginButton component from @inrupt/solid-ui-react
const LogInPage = () => {
  const [issuer, setIssuer] = useState<string>("https://");

  return (
    <div className="container">
      <Form className="container w-50 px-5 pt-5 pb-5 border border-3 mt-5 rounded border-secondary shadow-lg">
        <h3 className="display-3 text-center mb-5">Solid Planner App</h3>
        <InputGroup>
          <DropdownButton
            variant="secondary"
            title="Choose a provider"
            id="input-group-dropdown-1">
            <Dropdown.Item onClick={() => {
              setIssuer("https://inrupt.net")
            }}>inrupt.net</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://broker.pod.inrupt.com")
            }}>Broker Pod Inrupt (Entreprise Solid Server)</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://dev.inrupt.net")
            }}>dev.inrupt.net</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://solidcommunity.net")
            }}>SolidCommunity.net</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://solidweb.org")
            }}>Solidweb.org</Dropdown.Item>
          </DropdownButton>
          <FormControl aria-label="Text input with dropdown button" value={issuer}
            onChange={(e) => {
              setIssuer(e.target.value);
            }} />
        </InputGroup>
        <div className="d-grid gap-2 mt-2">
          <LoginButton
            oidcIssuer={issuer}
            redirectUrl={window.location.href}
          >
            <Button className="w-100">Log in</Button></LoginButton>
        </div>
      </Form>
    </div>
  )
}

export default LogInPage;

