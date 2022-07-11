import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ContentToRender from "./ContentToRender";
import Test from "./Test";
import { checkPermissions, isWacOrAcp } from "../services/access";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
import { recordDefaultFolder } from "../services/SolidPod";
import { Habit, Note } from "./types";
import { getDefaultFolder, getPrefLink, getPublicTypeIndexUrl, getStoragePref } from "../services/podGetters";
import NoPermissions from "./NoPermissions";
import TestCalendar from "./TestCalendar";
import ColorPickerTest from "./ColorPickerTest";

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
  const [storagePref, setStoragePref] = useState<string>("");
  const [prefFileLocation, setPrefFileLocation] = useState<string>("");
  const [publicTypeIndexUrl, setPublicTypeIndexUrl] = useState<string>("");
  const [podType, setPodType] = useState<string>("");
  const [defFolder, setDefFolder] = useState<string | null>(null);
  useEffect(() => {
    let check = async () => {
      setIsLoading(true);

      let updStoragePref = await getStoragePref(webId, fetch);
      setStoragePref(updStoragePref);

      let updPrefFileLocation = await getPrefLink(webId, fetch);
      setPrefFileLocation(updPrefFileLocation);

      let updPublicTypeIndexUrl = await getPublicTypeIndexUrl(webId, fetch);
      setPublicTypeIndexUrl(updPublicTypeIndexUrl);

      let updPodType = await isWacOrAcp(updStoragePref, fetch);
      setPodType(updPodType);

      let defFolderUpd = await getDefaultFolder(webId, fetch, updPrefFileLocation);
      if (!defFolderUpd) {
        await recordDefaultFolder(webId, fetch, updStoragePref, updPrefFileLocation, updPublicTypeIndexUrl, updPodType);
      }
      defFolderUpd = await getDefaultFolder(webId, fetch, updPrefFileLocation);
      setDefFolder(defFolderUpd);
      let result = await checkPermissions(webId, fetch, updStoragePref, updPodType);
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
          {/* <TestCalendar /> */}
          {/* <ColorPickerTest /> */}
          <Navbar
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
            publicTypeIndexUrl={publicTypeIndexUrl}
            podType={podType}
            prefFileLocation={prefFileLocation}
            defFolder={defFolder}
            storagePref={storagePref}
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