import "regenerator-runtime/runtime";
import React, { useEffect, useState } from "react";
import LogInPage from "./components/LogInPage";
import { handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser";
import MainContent from "./components/MainContent";
import { useSession } from "@inrupt/solid-ui-react";

const App: React.FC = () => {
  const [logInStatus, setLogInStatus] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { session,sessionRequestInProgress } = useSession();

  // useEffect(() => {
  //   const handle = async () => {
  //     await handleIncomingRedirect({
  //       restorePreviousSession: true,
  //     }).then((info) => {
  //      // setLogInStatus(info?.isLoggedIn ?? false);
  //       setLoading(false);
  //     });
  //   }
  //   handle();
  // }, [logInStatus]);

  const render = () => {
    if (sessionRequestInProgress) return <div></div>;
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
