import { accessObject } from "../components/types";

interface Props {
    title: string;
    readOnChange: () => void;
    appendOnChange: () => void;
    writeOnChange: () => void;
    readStatus: boolean;
    appendStatus: boolean;
    writeStatus: boolean;

}
const AccessElement = ({ title, readOnChange, appendOnChange, writeOnChange, readStatus, appendStatus, accUpdObj, setAccUpdObj,
    writeStatus }: Props) => {
    return (
        <div className="my-2" key={Date.now() + Math.floor(Math.random() * 1000)}>
            <div className="text-center">{title}</div>
            <div className="d-flex justify-content-around">

                <div className="form-check form-switch">
                    <label className="form-check-label"
                        htmlFor="flexSwitchCheckDefault1">read</label>
                    <input className="form-check-input" type="checkbox"
                        onChange={readOnChange}
                        checked={readStatus}
                        role="switch" id="flexSwitchCheckDefault" />
                </div>
                <div className="form-check form-switch">
                    <label className="form-check-label"
                        htmlFor="flexSwitchCheckDefault1">append</label>
                    <input className="form-check-input" type="checkbox"
                        onChange={appendOnChange}
                        checked={appendStatus}
                        role="switch" id="flexSwitchCheckDefault" />
                </div>
                <div className="form-check form-switch">
                    <label className="form-check-label"
                        htmlFor="flexSwitchCheckDefault2">write</label>
                    <input className="form-check-input" type="checkbox"
                        onChange={writeOnChange}
                        checked={writeStatus}
                        role="switch" id="flexSwitchCheckDefault2" />
                </div>
            </div>
        </div>
    )
}

export default AccessElement