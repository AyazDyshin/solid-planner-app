import { useState } from "react";
import Navbar from "./Navbar";
import ContentToRender from "./ContentToRender";
import Test from "./Test";
// This is the root component that first renders NavBar and then other content
// Passes active and setActive hooks, which represent the currently clicked tab
const MainContent = () => {

  const links = ['notes', 'categories', 'habits'];
  const [active, setActive] = useState("notes");

  return (
    <div>
      <Navbar links={links} active={active} setActive={setActive} />
      <ContentToRender active={active} />
    </div>
  );
};

export default MainContent;