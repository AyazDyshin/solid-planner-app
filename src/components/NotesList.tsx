import 'bootstrap/dist/css/bootstrap.css';
import { getInteger, getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { schema } from "rdf-namespaces";
import { RefAttributes, useState } from "react";
import { Dropdown, DropdownButton, Badge, Overlay, Tooltip, OverlayTrigger, TooltipProps, Popover, PopoverProps, Button } from "react-bootstrap";
import SaveModal from "./SaveModal";
import { Note } from "./types";
import { RiArrowDropDownLine, RiArrowGoBackFill } from "react-icons/ri";
import { AiOutlinePlus } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import { BiFolder } from "react-icons/bi";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { GoPrimitiveDot } from "react-icons/go";
interface Props {
  notesArray: (Note | null)[];
  setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
  noteToView: Note | null;
  setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string | null>>;
  currentCategory: string | null;
  setCurrentAccess: React.Dispatch<React.SetStateAction<string | null>>;
  currentAccess: string | null;
  isLoadingContents: boolean;
  setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotesList = ({ notesArray, setNotesArray, noteToView, setNoteToView,
  viewerStatus, setViewerStatus, setCreatorStatus, isEdit, setIsEdit, categoryArray, setCategoryArray,
  setCurrentCategory, currentCategory, setCurrentAccess, currentAccess, isLoadingContents, setIsLoadingContents }: Props) => {

  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [saveModalState, setSaveModalState] = useState<boolean>(false);

  let accessArray = ["public", "private", "shared"];
  const renderTooltip = (props: JSX.IntrinsicAttributes & PopoverProps & RefAttributes<HTMLDivElement>) => (
    <Popover id="popover-basic" {...props}>
      <Popover.Header as="h3">Popover right</Popover.Header>
      <Popover.Body>
        And here's some <strong>amazing</strong> content. It's very engaging.
        right?
      </Popover.Body>
    </Popover>
  );


  const handleCreate = () => {
    if (isEdit) {
      setSaveModalState(true);
    }
    else {
      setViewerStatus(false);
      setCreatorStatus(true);
    }
  }

  return (
    <div className="w-100 h-100">
      <div className="d-flex">
        <OverlayTrigger placement="right" overlay={renderTooltip}>
          <DropdownButton
            variant="outline-secondary"
            title={<div><VscTypeHierarchySuper /> {currentAccess ? currentAccess : "access type"} <RiArrowDropDownLine /></div>}
          >
            {
              accessArray.map((access) => {
                return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
                  onClick={() => {
                    setViewerStatus(false);
                    setCreatorStatus(false);
                    setCurrentAccess(access);
                  }}><GoPrimitiveDot /> {access}</Dropdown.Item>
              })
            }
            {currentAccess && (
              <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentAccess(null)}><RiArrowGoBackFill /> reset</Dropdown.Item></>)}
          </DropdownButton>
        </OverlayTrigger>
        {
          categoryArray.length !== 0 && <DropdownButton
            variant="outline-secondary"
            title={<div><BiFolder /> {currentCategory ? currentCategory : "Category"} <RiArrowDropDownLine /></div>}
          >
            {
              categoryArray.map((category) => {
                return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
                  onClick={() => {
                    setViewerStatus(false);
                    setCreatorStatus(false);
                    setCurrentCategory(category);

                  }}><GoPrimitiveDot /> {category}</Dropdown.Item>
              })
            }

            {currentCategory && (
              <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentCategory(null)}><RiArrowGoBackFill /> reset</Dropdown.Item></>)}
          </DropdownButton>
        }

        <a className="btn btn-primary ms-auto d-flex align-items-center justify-content-center" onClick={handleCreate}><BsPlusLg /></a>

      </div>
      <div className="list-group w-100 h-100">
        {
          notesArray.map((note) => {
            if (note) {
              return <a
                key={`${note.id}${Date.now() + Math.floor(Math.random() * 1000)}`}
                className={`list-group-item px-1 list-group-item-action ${activeNote === note.id ? 'active' : ''}`}
                onClick={(e) => {
                  console.log(viewerStatus);
                  e.preventDefault();
                  setIsEdit(false);
                  setActiveNote(note.id);
                  setNoteToView(note);
                  setViewerStatus(true);
                  setCreatorStatus(false);
                }}
              >
                {note.category && <Badge pill bg="primary" className="me-1">{note.category}</Badge>}
                {!note.category && <Badge pill bg="secondary" className="me-1">no category</Badge>}
                {note.access && <Badge pill bg="secondary" className="me-1">{Object.keys(note.access)[0]}</Badge>}
                {note.shareList && <Badge pill bg="secondary" className="me-1">shared</Badge>}
                {note.title}
              </a>
            }
          })
        }
        <SaveModal saveModalState={saveModalState} setSaveModalState={setSaveModalState}
          setCreatorStatus={setCreatorStatus}
          setViewerStatus={setViewerStatus} />
      </div>
    </div>
  )
};

export default NotesList;