import React, { useState, useEffect } from "react";
import { notEqual } from "assert";
import { Note } from './types';
import InputField from "./InputField";
import { Button } from "react-bootstrap";
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";

interface Props {
  
}

const MainContent = () => {
  // is there a better practice to handle this passing of an empty note?
  const [note, setNote] = useState<Note>({id:0, title:"", content:""});
  const [notes, setNotes] = useState<Note[]>([]);
  const { session } = useSession();

 
  const onError = (error: Error) => {
    console.log(error);
  }
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(note){ 
      setNotes([...notes, {id:  Date.now(), title: note.title, content: note.content}]);
      setNote({id:0, title:"", content:""});
    }
  };
  return (
    <div>
      <h1>Hello there!</h1>
      <InputField note={note} setNote={setNote} handleAdd={handleAdd}/>
      <LogoutButton  onError={onError} >
        <Button>Log Out</Button>
      </LogoutButton>        
    </div>

  );
};

export default MainContent;