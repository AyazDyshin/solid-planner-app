import { useSession } from '@inrupt/solid-ui-react';
import { useEffect, useState } from 'react';
import { fetchAllEntries } from '../services/SolidPod';
import { BsPlusLg } from "react-icons/bs";

interface Props {
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  creatorStatus: boolean;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const HabitsList = ({ viewerStatus, setViewerStatus, creatorStatus, setCreatorStatus }: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (webId === undefined) {
    throw new Error("error when trying to get webId");
  }
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentAccess, setCurrentAccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newEntryCr, setNewEntryCr] = useState<boolean>(false);
  useEffect(() => {

    // const perfSave = async () => {
    //   if (doNoteSave || arrOfChanges.length !== 0) {
    //     if (doNoteSave) {
    //       await saveNote(webId, fetch, NoteInp);
    //     }
    //     else if (arrOfChanges.length !== 0) {
    //       await editNote(webId, fetch, NoteInp, arrOfChanges);
    //     }

    //     if (Object.keys(accUpdObj).length !== 0) {
    //       if (accUpdObj["public"]) {
    //         await setPubAccess(webId, publicAccess, noteToView!.url, fetch);
    //       }
    //       else if (accUpdObj["agent"]) {
    //         for (let item in agentsToUpd) {
    //           await shareWith(webId, noteToView!.url, fetch, agentsToUpd[item], item);

    //         }
    //       }

    //     }

    //     setCreatorStatus(false);
    //     setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
    //     setIsEdit(false);
    //     setArrOfChanges([]);
    //     setDoNoteSave(false);
    //   }
    // }
    const fetchNotes = async (otherId?: string) => {
      // await perfSave();
      setIsLoading(true);
      let ret = await fetchAllEntries(webId, fetch, "habit");
      //handle
      //const [updNotesArray, updCategoriesArray] = ret!;
      // let transformedArr = await Promise.all(updNotesArray.map(async (thing) => {
      //   return await thingToHabit();
      // }));
      // setNotesArray(transformedArr.filter((item) => item !== null));
      // setCategoryArray(updCategoriesArray);
      // setDoNoteSave(false);
      setIsLoading(false);

    }

    fetchNotes();

  }, [newEntryCr, currentCategory, currentAccess]);
  const handleCreate = () => {
    setViewerStatus(false);
    setCreatorStatus(true);
  };
  return (
    <div className="w-100 h-100">
      <div className="d-flex">
        <a className="btn btn-secondary ms-auto my-1 d-flex align-items-center justify-content-center" onClick={handleCreate}><BsPlusLg /></a>
      </div>
    </div>
  )
}

export default HabitsList