import React from 'react'

interface Props {
    title: string;
    readOnChange: () => void;
    appendOnChange: () => void;
    writeOnChange: () => void;
    readStatus: boolean;
    appendStatus: boolean;
    writeStatus: boolean;
}

/**
 * helper component for AccessModal that renders access rights setting UI
 *
 * @category Modals
 * @component
 */
const AccessElement = ({ title, readOnChange, appendOnChange, writeOnChange, readStatus, appendStatus, writeStatus }: Props) => {
    return (
        <div className="my-2" key={Date.now() + Math.floor(Math.random() * 1000)}>
            <div className="text-center">{title}</div>
            <div className="d-flex justify-content-around">
                <div className="form-check form-switch">
                    <label className="form-check-label"
                        htmlFor="flexSwitchCheckDefault1">Read</label>
                    <input className="set-read form-check-input" type="checkbox"
                        onChange={readOnChange}
                        checked={readStatus}
                        role="switch" id="flexSwitchCheckDefault" />
                </div>
                <div className="form-check form-switch">
                    <label className="form-check-label"
                        htmlFor="flexSwitchCheckDefault1">Append</label>
                    <input className="form-check-input" type="checkbox"
                        onChange={appendOnChange}
                        checked={appendStatus}
                        role="switch" id="flexSwitchCheckDefault" />
                </div>
                <div className="form-check form-switch">
                    <label className="form-check-label"
                        htmlFor="flexSwitchCheckDefault2">Write</label>
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