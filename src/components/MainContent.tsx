import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ContentToRender from "./ContentToRender";
import Test from "./Test";
import { checkPermissions } from "../services/access";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
import { ControlledStorage } from "rdf-namespaces/dist/space";
import { recordDefaultFolder } from "../services/SolidPod";
import { Habit, Note } from "./types";
import { getDefaultFolder } from "../services/podGetters";
import NoPermissions from "./NoPermissions";
// This is the root component that first renders NavBar and then other content
// Passes active and setActive hooks, which represent the currently clicked tab
const MainContent = () => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (!webId) {
    throw new Error(`Error, couldn't get user's WebId`);
  }
  const links = ['notes', 'habits', 'contacts'];
  const [active, setActive] = useState("notes");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<boolean>(false);
  const [viewerStatus, setViewerStatus] = useState<boolean>(false);
  const [creatorStatus, setCreatorStatus] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState(false);
  const [notesArray, setNotesArray] = useState<Note[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState<boolean>(true);
  const [notesFetched, setNotesFetched] = useState<boolean>(false);
  const [habitsFetched, setHabitsFetched] = useState<boolean>(false);
  const [habitsArray, setHabitsArray] = useState<Habit[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [defFolder, setDefFolder] = useState<string | null>(null);
  useEffect(() => {
    let check = async () => {
      setIsLoading(true);
      let defFolderUpd = await getDefaultFolder(webId, fetch);
      if (!defFolderUpd) {
        await recordDefaultFolder(webId, fetch);
      }
      defFolderUpd = await getDefaultFolder(webId, fetch);
      setDefFolder(defFolderUpd);
       let result = await checkPermissions(webId, fetch);
      setPermissionStatus(result);
      setIsLoading(false);
    }
    check();
  }, [refresh]);
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
          <Navbar
            notesFetched={notesFetched}
            setNotesFetched={setNotesFetched}
            isLoadingContents={isLoadingContents}
            setIsLoadingContents={setIsLoadingContents}
            notesArray={notesArray}
            setNotesArray={setNotesArray}
            creatorStatus={creatorStatus}
            setCreatorStatus={setCreatorStatus}
            viewerStatus={viewerStatus}
            setViewerStatus={setViewerStatus}
            links={links}
            active={active}
            setActive={setActive}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
          <ContentToRender
            habitsFetched={habitsFetched}
            setHabitsFetched={setHabitsFetched}
            habitsArray={habitsArray}
            setHabitsArray={setHabitsArray}
            notesFetched={notesFetched}
            setNotesFetched={setNotesFetched}
            isLoadingContents={isLoadingContents}
            setIsLoadingContents={setIsLoadingContents}
            notesArray={notesArray}
            setNotesArray={setNotesArray}
            creatorStatus={creatorStatus}
            setCreatorStatus={setCreatorStatus}
            viewerStatus={viewerStatus}
            setViewerStatus={setViewerStatus}
            active={active}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
        </div>
      );
    }
    else {
      return (
        <NoPermissions
          refresh={refresh}
          setRefresh={setRefresh}
        />
      )
    }
  }

};

export default MainContent;