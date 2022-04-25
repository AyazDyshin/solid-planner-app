import React, { useState, useEffect } from "react";
import {
    logout
  } from "@inrupt/solid-client-authn-browser";
import { notEqual } from "assert";
import { Note } from './types';
import InputField from "./InputField";
import { Button } from "react-bootstrap";
  interface Props {
    logInStatus : boolean;
    setLogInStatus : React.Dispatch<React.SetStateAction<boolean>>;
  } 

const MainContent = ({logInStatus, setLogInStatus} : Props) => {
    const [note, setNote] = useState<string>("");
    const [notes, setNotes] = useState<Note[]>([]);
    const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    logout();
    setLogInStatus(false);
    window.location.reload();
  };

const handleAdd = () => {

};
    return (
        <div>
            <h1>Hello there!</h1>
            <InputField />
            <Button onClick={(e) => handleLogout(e)}>Log Out</Button>
        </div>

    );
};

export default MainContent;