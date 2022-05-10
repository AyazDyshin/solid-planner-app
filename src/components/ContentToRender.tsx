import ContentPageRender from "./ContentPageRender";

interface Props {
    active: string;
}
const ContentToRender = ( {active} : Props ) => {
    switch (active){
        case "notes":
            return (<ContentPageRender active={active}/>);
            break;
        case "habits":
            return (<ContentPageRender active={active}/>);
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;