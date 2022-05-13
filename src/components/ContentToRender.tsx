import ContentPageRender from "./ContentPageRender";

interface Props {
    active: string;
}
// this component decides what to render based on "active" property ie clicked tab
// while seems redundant at the moment will be useful once other tabs will be implemented
const ContentToRender = ({ active }: Props) => {

    switch (active) {
        case "notes":
        case "habits":
            return (<ContentPageRender active={active} />);
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;