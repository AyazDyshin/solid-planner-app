import React, { useState, useEffect } from "react";
import {
  logout
} from "@inrupt/solid-client-authn-browser";
import { notEqual } from "assert";
import { Note } from './types';
import InputField from "./InputField";
import { Button } from "react-bootstrap";
interface Props {
  logInStatus: boolean;
  setLogInStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainContent = ({ logInStatus, setLogInStatus }: Props) => {
  // is there a better practice to handle this passing of an empty note?
  const [note, setNote] = useState<Note>({id:0, title:"", content:""});
  const [notes, setNotes] = useState<Note[]>([]);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    logout();
    setLogInStatus(false);
    window.location.reload();
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      console.log(e);
    if (note) {
      setNotes([...notes, {id:  Date.now(), title: note.title, content: note.content}]);
    }
  };

  return (
    <div>
      <h1>Hello there!</h1>
      <InputField note={note} setNote={setNote} handleAdd={handleAdd}/>
      <Button onClick={(e) => handleLogout(e)}>Log Out</Button>
    </div>

  );
};

export default MainContent;