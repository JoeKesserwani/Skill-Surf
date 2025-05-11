const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "skillsurf-7c76c.appspot.com",
});

const bucket = admin.storage().bucket();
