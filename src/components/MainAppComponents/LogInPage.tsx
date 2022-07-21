import React, { useState } from "react";
import "regenerator-runtime/runtime";
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginButton } from "@inrupt/solid-ui-react";
import { Button, InputGroup, Dropdown, DropdownButton, FormControl, Form } from 'react-bootstrap';
import { AiOutlineLink } from "react-icons/ai";
import ProviderModal from "../../modals/ProviderModal";
import { RiArrowDropDownLine } from 'react-icons/ri';
import "../../styles.css";

/**
 * Component that renders Log in page of the application
 *
 * @category Main app components
 */
const LogInPage = () => {
  const [issuer, setIssuer] = useState<string>("https://");
  const [providerModalState, setProviderModalState] = useState<boolean>(false);

  return (
    <div className="adjust-2">
      <Form className="container px-5 pt-5 pb-4 border border-3 mt-5 rounded border-secondary">
        <h3 className="display-3 text-center mb-5">Solid Planner App</h3>
        <InputGroup>
          <DropdownButton
            variant="secondary"
            title={<div>Choose a provider <RiArrowDropDownLine /></div>}
            id="input-group-dropdown-1">
            <Dropdown.Item onClick={() => {
              setIssuer("https://inrupt.net")
            }}>Inrupt.net</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://broker.pod.inrupt.com")
            }}>Broker Pod Inrupt</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://solidcommunity.net")
            }}>SolidCommunity.net</Dropdown.Item>
            <Dropdown.Item onClick={() => {
              setIssuer("https://solidweb.org")
            }}>Solidweb.org</Dropdown.Item>
          </DropdownButton>
          <FormControl className="provider-input" aria-label="Text input with dropdown button" value={issuer}
            onChange={(e) => {
              setIssuer(e.target.value);
            }} />
        </InputGroup>
        <div className="d-grid gap-2 mt-2">
          <LoginButton
            oidcIssuer={issuer}
            redirectUrl={window.location.href}
          >
            <Button variant="secondary"
              className="login-button w-100">Log in</Button></LoginButton>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <a href="https://solidproject.org/" target="_blank"
            className="link-primary mx-2" rel="noreferrer">What is Solid? <AiOutlineLink /></a>
          <a onClick={() => { setProviderModalState(true) }} className="link-primary mx-2 cursor">Which provider to pick?</a>
        </div>
      </Form>
      <ProviderModal
        providerModalState={providerModalState}
        setProviderModalState={setProviderModalState}
      />
    </div>
  )
}

export default LogInPage

