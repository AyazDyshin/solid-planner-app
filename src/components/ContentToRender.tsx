import ContentPageRender from "./ContentPageRender";

interface Props {
    active: string;
}
const ContentToRender = ({active}:Props) => {

    switch (active){
        case "notes":
            return (<ContentPageRender whatToRender={"notes"}/>);
            break;
        case "habits":
            return (<ContentPageRender whatToRender={"habits"}/>);
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;