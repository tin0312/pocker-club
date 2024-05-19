import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { Twilio } from "twilio";
import { nanoid } from "nanoid";
import admin from "firebase-admin";
import "dotenv/config";

const app = express();
const router = Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new Twilio(accountSid, authToken);

const accountService = {
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
};
// Firestore
function initializeFirebaseAdmin() {
  return admin.initializeApp(accountService);
}
initializeFirebaseAdmin();
const db = admin.firestore();

let isSubmitted = false;

// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Handle access to confirmation page
app.get("/confirmation", (req, res) => {
  try {
    if (isSubmitted) {
      res.redirect("/confirmation.html");
    } else {
      // Redirect to home page if isSubmitted is false
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).send("Failed to load confirmation page.");
  }
});

// Handle submission route
router.post("/form-submission", async (req, res) => {
  isSubmitted = true;
  // Extract form data from the request body
  const { fname, lname,phone, msg, game } = req.body;
  // Save user to Firestore
  await saveWaitList(fname, lname, phone, msg, game);
  res.redirect("/confirmation.html");
});

// Set up SMS message
async function sendTwilioMessage(phone, messageBody) {
  try {
    await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_NUMBER,
      to: phone,
    });
    console.log("Twilio message sent successfully.");
  } catch (error) {
    console.error("Error sending Twilio message:", error);
  }
}

// Save user to Firestore
async function saveWaitList(fname, lname, phone, msg, game) {
  const userId = nanoid();
  try {
    const collectionSnapshot = await db.collection("waitlist").get();
    const position = collectionSnapshot.size + 1; // Increment count to get position
    await db.collection("waitlist").doc(userId).set({
      id: userId,
      fname: fname,
      lname: lname,
      phone: phone,
      msg: msg,
      game: game,
      position: position,
    });
    console.log("User added to Firestore");
      // Get user's position in waitlist
    const userPosition = await getCurrentPosition();
    // Send Twilio message
    await sendTwilioMessage(
    phone,
    `Omega Poker T.O.P Club\n Hi ${fname},\nYou have successfully booked a seat with us.Your position is ${userPosition} in the waitlist.We will notify you when the seat is available!\nThank you!\nSee live: https://positionupdate.netlify.app/${userId}`
  ).catch((error) => {
    console.error("Error sending SMS:", error);
  });
    const customerInfoMessage = `New customer information:\nName: ${fname} ${lname}\nPhone: ${phone}\nMessage: ${msg}\nGame: ${game}`;
    await sendTwilioMessage(process.env.PERSONAL_PHONE, customerInfoMessage);
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
}

// Handle user position updates

async function getCurrentPosition() {
  try {
    const collectionSnapshot = await db.collection("waitlist").get();
    const userPosition = collectionSnapshot.size;
    console.log("User position: ", userPosition);
    return userPosition;
  } catch (error) {
    console.error("Error getting current position: ", error);
  }
}
// Use the router middleware for routes under /api/
app.use("/api", router);

// Export the handler for serverless deployment
export const handler = serverless(app);
