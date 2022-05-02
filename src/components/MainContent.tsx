import React, { useState, useEffect } from "react";
import { notEqual } from "assert";
import { Note } from './types';
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import Navbar from "./Navbar";
interface Props {
  
}

const MainContent = () => {
  // is there a better practice to handle this passing of an empty note?
  const [note, setNote] = useState<Note>({id:0, title:"", content:""});
  const [notes, setNotes] = useState<Note[]>([]);
  const links = ['notes', 'link2', 'link3'];
  const [active, setActive] = useState("notes");
 
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(note){ 
      setNotes([...notes, {id:  Date.now(), title: note.title, content: note.content}]);
      setNote({id:0, title:"", content:""});
    }
  };
  return (
    <div>
      <Navbar links={links} active={active} setActive={setActive} />     
    </div>

  );
};

export default MainContent;