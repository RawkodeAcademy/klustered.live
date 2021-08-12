import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../firebase/clientApp";

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: "redirect",
  signInSuccessUrl: "/",
  signInOptions: [firebase.auth.TwitterAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: (authResult, redirectUrl) => {
      const db = firebase.firestore();

      db.collection("users")
        .doc(authResult.user.uid)
        .set(
          {
            accessToken: authResult.credential.accessToken,
            secret: authResult.credential.secret,
          },
          { merge: true }
        )
        .then(() => console.log("OK"))
        .catch((error) => {
          console.log("Error authenticating: ", error);
        });

      return false;
    },
  },
};

function SignInScreen() {
  return (
    <div
      style={{
        maxWidth: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>Klustered Live</h1>
      <p>Please authenticate yourself</p>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default SignInScreen;
