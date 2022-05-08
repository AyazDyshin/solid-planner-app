import NotesPage from "./NotesPage";

interface Props {
    active: string;
}
const ContentToRender = ({active}:Props) => {

    switch (active){
        case "notes":
            return (<NotesPage />);
            break;
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;