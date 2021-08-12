import * as cors from "cors";
import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import TwitterApi from "twitter-api-v2";

admin.initializeApp();

const db = admin.firestore();
const app = express();

const validateFirebaseIdToken = async (req: any, res: any, next: any) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header.",
      "Make sure you authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>",
      'or by passing a "__session" cookie.'
    );
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
    return;
  }
};

app.use(cors({ origin: true }));
app.use(validateFirebaseIdToken);
app.post("/", async (request, response) => {
  const consumerKey = functions.config().twitter.consumer_key;
  const consumerSecret = functions.config().twitter.consumer_secret;
  const tweetId = functions.config().twitter.tweet_id;

  // @ts-ignore
  const user = await db.collection("users").doc(request.user.uid).get();

  const client = new TwitterApi({
    appKey: consumerKey,
    appSecret: consumerSecret,
    // @ts-ignore
    accessToken: user.data()["accessToken"],
    // @ts-ignore
    accessSecret: user.data()["secret"],
  });

  // @ts-ignore
  const currentUid = user.data()["providerData"][0]["uid"];

  console.log(`Current user is ${currentUid}`);

  if (currentUid != "22761152") {
    client.v2
      .follow(currentUid, "22761152")
      .then((result) => console.log("Successfully followed @rawkode"))
      .catch((e) => console.error(`Failed to follow Rawkode: ${e}`));
  }

  if (currentUid != "3318194690") {
    client.v2
      .follow(currentUid, "3318194690")
      .then((result) => console.log("Successfully followed @goteleport"))
      .catch((e) => console.error(`Failed to follow Teleport: ${e}`));
  }

  console.log(`Attempting to retweet ${tweetId}`);
  client.v1
    .post(`statuses/retweet/${tweetId}.json`, {}, {})
    .then((result) => console.log("Successfully retweeted"))
    .catch((e) => console.error(`Failed to retweet: ${e}`));

  db.collection("entries")
    // @ts-ignore
    .doc(user.data()["uid"])
    .set(
      {
        // @ts-ignore
        displayName: user.data()["displayName"],
        twitter_uid: currentUid,
        timestamp: new Date().toISOString(),
      },
      { merge: true }
    );

  response.send({
    data: `Done`,
  });
});

exports.app = functions.https.onRequest(app);

export const createUserDocument = functions.auth.user().onCreate((user) => {
  db.collection("users")
    .doc(user.uid)
    .set(JSON.parse(JSON.stringify(user)));
});
