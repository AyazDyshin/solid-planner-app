import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ContentToRender from "./ContentToRender";
import Test from "./Test";
import { checkPermissions } from "../services/access";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
import { ControlledStorage } from "rdf-namespaces/dist/space";
// This is the root component that first renders NavBar and then other content
// Passes active and setActive hooks, which represent the currently clicked tab
const MainContent = () => {
  const { session, fetch } = useSession();



  const links = ['notes', 'habits', 'contacts', 'settings'];
  const [active, setActive] = useState("notes");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<boolean>(false);

  const { webId } = session.info;
  useEffect(() => {
    let check = async () => {
      setIsLoading(true);
      //handle
      let result = await checkPermissions(webId ?? "", fetch);
      console.log("after result");
      setPermissionStatus(result);
      setIsLoading(false);
    }
    check();
  }, []);
  if (isLoading) {
    return (
      <div className="h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }
  else {
    if (permissionStatus) {
      return (
        <div>
          <Test />
          <Navbar links={links} active={active} setActive={setActive} />
          <ContentToRender active={active} />
        </div>
      );
    }
    else {
      return (
        <div> You didn't grant us permissions!!!</div>
      )
    }
  }

};

export default MainContent;