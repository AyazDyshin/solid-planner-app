import React, { useState, useEffect } from "react";
import {
    logout,
    getDefaultSession,
  } from "@inrupt/solid-client-authn-browser";

  interface Props {
    logInStatus : boolean;
    setLogInStatus : React.Dispatch<React.SetStateAction<boolean>>;
  } 

const MainContent = ({logInStatus, setLogInStatus} : Props) => {
    const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    logout();
    // The following has no impact on the logout, it just resets the UI.
    setLogInStatus(false);
  };
    return (
        <div>
            <h1>Hello there!</h1>
            <button onClick={(e) => handleLogout(e)}>Log Out</button>
        </div>

    );
};

export default MainContent;