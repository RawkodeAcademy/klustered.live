import firebase from "../firebase/clientApp";
import "firebase/functions";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState } from "react";
import Auth from "../components/Auth";
import ClipLoader from "react-spinners/ClipLoader";

export default function Home() {
  // Firestore
  const db = firebase.firestore();

  // User Authentication
  const [user, loading] = useAuthState(firebase.auth());
  const [entered, setEntered] = useLocalStorage("entered", false);
  const [showEnterButton, setShowEnterButton] = useState(true);

  const enterCompetition = async () => {
    setShowEnterButton(false);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    var submitCompetition = firebase.functions().httpsCallable("app");
    submitCompetition({})
      .then((result) => {
        setEntered(true);
        console.log(result);
      })
      .catch((e) => setShowEnterButton(true));
  };

  const signOut = () => {
    setEntered(true);
    firebase.auth().signOut();
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gridGap: 8,
        background:
          "linear-gradient(180deg, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
      }}
    >
      <h1>Klustered Retweet Competition</h1>

      {user && <button onClick={() => signOut()}>Signout</button>}

      <hr />

      {loading && <h4>Loading...</h4>}
      {!user && <Auth />}

      {user && entered && (
        <>
          <p>You've entered!</p>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/_BFbrrXKMOM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </>
      )}

      {!entered && user && (
        <>
          <div style={{ flexDirection: "row", display: "flex" }}>WARNING:</div>
          <div style={{ flexDirection: "row", display: "flex" }}>
            By clicking "enter" you, this app will follow both the @rawkode and
            @goteleport accounts on Twitter from your account; AS WELL AS
            retweet the live stream tweet.
          </div>
          <div style={{ flexDirection: "row", display: "flex" }}>
            I REALLY HATE THIS.
          </div>
          <div style={{ flexDirection: "row", display: "flex" }}>
            I do this because the Twitter API doesn't allow us to check if you
            follow the accounts, or that you've retweeted the tweet; which I
            need to work around but didn't have time to do so for today's
            episode.
          </div>

          {showEnterButton && (
            <button onClick={enterCompetition}>Enter Competition</button>
          )}
          {!showEnterButton && (
            <ClipLoader color="#ffff00" loading={!showEnterButton} size={150} />
          )}
        </>
      )}
    </div>
  );
}

function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  if (process.browser) {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        // If error also return initialValue
        console.log(error);
        return initialValue;
      }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    };

    return [storedValue, setValue];
  }

  return [false, () => true];
}
