import React from 'react';
import { useEffect, useState } from "react";
import NavbarSolidApp from "./NavbarSolidApp";
import ContentToRender from "./ContentToRender";
import Test from "./Test";
import { checkPermissions, isWacOrAcp } from "../services/access";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
import { checkPubTypeIndex, recordDefaultFolder } from "../services/SolidPod";
import { Habit, Note } from "./types";
import { getDefaultFolder, getPrefLink, getPublicTypeIndexUrl, getStoragePref } from "../services/podGetters";
import NoPermissions from "./NoPermissions";
import {
  WebsocketNotification,
} from "@inrupt/solid-client-notifications";
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
  const [notesFetched, setNotesFetched] = useState<boolean>(false);
  const [habitsFetched, setHabitsFetched] = useState<boolean>(false);
  const [habitsArray, setHabitsArray] = useState<Habit[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [storagePref, setStoragePref] = useState<string>("");
  const [prefFileLocation, setPrefFileLocation] = useState<string>("");
  const [publicTypeIndexUrl, setPublicTypeIndexUrl] = useState<string>("");
  const [podType, setPodType] = useState<string>("");
  const [defFolder, setDefFolder] = useState<string | null>(null);
  const [contactsFetched, setContactsFetched] = useState<boolean>(false);
  const [contactsFdrStatus, setContactsFdrStatus] = useState<boolean>(false);
  const [refetchNotes, setRefetchNotes] = useState<boolean>(false);
  const [refetchContacts, setRefetchContacts] = useState<boolean>(false);
  const [refetchHabits, setRefetchHabits] = useState<boolean>(false);
  const [refetchNotifications, setRefetchNotifications] = useState<boolean>(false);

  useEffect(() => {
    const check = async () => {
      setIsLoading(true);
      const updStoragePref: string = await getStoragePref(webId, fetch);
      setStoragePref(updStoragePref);
      const updPrefFileLocation: string = await getPrefLink(webId, fetch);
      setPrefFileLocation(updPrefFileLocation);
      const updPublicTypeIndexUrl: string = await getPublicTypeIndexUrl(webId, fetch);
      setPublicTypeIndexUrl(updPublicTypeIndexUrl);
      const updPodType = await isWacOrAcp(updStoragePref, fetch);
      setPodType(updPodType);
      let defFolderUpd = await getDefaultFolder(webId, fetch, updPrefFileLocation);
      await checkPubTypeIndex(updPublicTypeIndexUrl, fetch, updStoragePref);
      if (!defFolderUpd) {
        await recordDefaultFolder(webId, fetch, updStoragePref, updPrefFileLocation, updPublicTypeIndexUrl, updPodType);
      }
      defFolderUpd = await getDefaultFolder(webId, fetch, updPrefFileLocation);
      setDefFolder(defFolderUpd);
      const result = await checkPermissions(webId, fetch, updStoragePref, updPodType);
      setPermissionStatus(result);
      const wssUrl = new URL(updStoragePref);
      wssUrl.protocol = 'wss';
      const inboxUrl = `${updStoragePref}inbox/`;
      const contactsUrl = `${updStoragePref}contacts/`;
      if (updPodType == 'acp') {
        const websocket3 = new WebsocketNotification(
          updPublicTypeIndexUrl,
          { fetch: fetch }
        );
        websocket3.on("message", () => {
          setNotesFetched(false);
          setHabitsFetched(false);
          setRefetchNotes(!refetchNotes);
          setRefetchHabits(!refetchHabits);
        });
        websocket3.connect();

        const websocket4 = new WebsocketNotification(
          `${contactsUrl}people.ttl`,
          { fetch: fetch }
        );
        websocket4.on("message", () => {
          setContactsFdrStatus(false);
          setContactsFetched(false);
        });
        websocket4.connect();
      }
      if (updPodType === 'wac') {
        const socket = new WebSocket(wssUrl, ['solid-0.1']);
        socket.onopen = function () {
          this.send(`sub ${updPublicTypeIndexUrl}`);
          this.send(`sub ${contactsUrl}`);
          this.send(`sub ${inboxUrl}`);
        };
        socket.onmessage = function (msg) {
          if (msg.data && msg.data.slice(0, 3) === 'pub') {
            if (msg.data === `pub ${updPublicTypeIndexUrl}`) {
              setNotesFetched(false);
              setHabitsFetched(false);
              setRefetchNotes(!refetchNotes);
              setRefetchHabits(!refetchHabits);
            }
            if (msg.data === `pub ${contactsUrl}`) {
              setContactsFetched(false);
              setContactsFdrStatus(false);
              setRefetchContacts(!refetchContacts);
            }

            if (msg.data === `pub ${inboxUrl}`) {
              setRefetchNotifications(!refetchNotifications);

            }
          }
        };
      }
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
          <NavbarSolidApp
            links={links}
            active={active}
            setActive={setActive}
            refetchNotifications={refetchNotifications}
            podType={podType}
          />
          <ContentToRender
            refetchHabits={refetchHabits}
            refetchNotes={refetchNotes}
            contactsFetched={contactsFetched}
            setContactsFetched={setContactsFetched}
            contactsFdrStatus={contactsFdrStatus}
            setContactsFdrStatus={setContactsFdrStatus}
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