import React, { useState, useEffect } from "react";
import { notEqual } from "assert";
import { Note } from './types';
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import Navbar from "./Navbar";
import ContentToRender from "./ContentToRender";
import Test from "./Test";

interface Props {
  
}

const MainContent = () => {
  // is there a better practice to handle this passing of an empty note?
  const [note, setNote] = useState<Note>({id:0, title:"", content:""});
  const [notes, setNotes] = useState<Note[]>([]);
  const links = ['notes', 'categories', 'habits'];
  const [active, setActive] = useState("notes");
  const { session, fetch} = useSession();
  const { webId } = session.info;
  
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // if(note){ 
    //   setNotes([...notes, {id:  Date.now(), title: note.title, content: note.content}]);
    //   setNote({id:0, title:"", content:""});
    // }
  };

  return (
    <div>
      <Test />
      <Navbar links={links} active={active} setActive={setActive} /> 
      <ContentToRender active={active}/>   
    </div>

  );
};

export default MainContent;