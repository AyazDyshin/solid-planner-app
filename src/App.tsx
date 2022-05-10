import "regenerator-runtime/runtime";
import React, { useState } from "react";
import LogInPage from "./components/LogInPage";
import MainContent from "./components/MainContent";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
const App: React.FC = () => {
  const [logInStatus, setLogInStatus] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { session,sessionRequestInProgress } = useSession();
  const render = () => {
    if (sessionRequestInProgress) {
      return (
        <div className="h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
    </div>
      )
    }
    else {
      if (!session.info.isLoggedIn) {
        return (
          <div>
            <LogInPage />
          </div>
        );
      }
      else {
        return (
          <MainContent />
          )
      }
    }
  }

  return render();
}

export default App;

