import serverless from "serverless-http";
import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import admin from "firebase-admin";
import { Twilio } from "twilio";
import nodemailer from "nodemailer";
import "dotenv/config";

const app = express();
const router = Router();
let isSubmitted = false;

// Content parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));


// Route handlings
router.post("/form-submission", async (req, res) => {
  isSubmitted = true;
  res.redirect("/confirmation.html");
  // Extract form data from the request body
  const { fname, lname, email, phone, partySize, game } = req.body;
  await sendEmail(fname, lname, email, phone, partySize, game);
  // Get user's position in waitlist
  await saveWaitList(fname, lname, email, phone, partySize, game).catch(
    (error) => {
      console.error("Error saving user to waitlist:", error);
    }
  );

  const userPosition = await getCurrentPosition();

  await sendTwilioMessage(
    phone,
    `Hi ${fname},\nYour position in the waitlist is ${userPosition}.We will notify you when the seat is available!.`
  ).catch((error) => {
    console.error("Error sending SMS:", error);
  });
});

//Routes handling

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

// Send email
async function sendEmail(fname, lname, email, phone, partySize, game) {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email message options
  let adminMailOptions = {
    from: email,
    to: process.env.EMAIL_APP,
    subject: "Omega Poker Club - Booking",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #333; text-align: center; margin-bottom: 50px;">New Appointment</h2>
    <div style="margin-bottom: 20px;">
        <p style="margin: 20px 0;"><strong>First Name:</strong> ${fname}</p>
        <p style="margin: 20px 0;"><strong>Last Name:</strong> ${lname}</p>
        <p style="margin: 20px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 20px 0;"><strong>Phone:</strong> ${phone}</p>
        <p style="margin: 20px 0;"><strong>Game:</strong> ${game}</p>
        <p style="margin: 20px 0;"><strong>Party Size:</strong> ${partySize}</p>
    </div>
</div>
        `,
  };

  let userMailOption = {
    from: process.env.EMAIL_APP,
    to: email,
    subject: "Omega Poker Club - Booking",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Booking Confirmation</h2>
        <p style="color: #666; text-align: center; margin-bottom: 50px;">Thank you for booking with us!</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 50px;">
            <p style="color: #333; margin: 0;text-align: center;">We have received your booking request and will get
                back to you shortly.
            </p>
        </div>
        <p style="color:#14343b; margin-bottom: 20px;font-weight: bold; font-style: italic;">Toronto Omega Poker - TOP
            club</p>
    </div>
    `,
  };

  // Send the email
  await Promise.all([
    transporter.sendMail(userMailOption),
    transporter.sendMail(adminMailOptions),
  ]);
}

// Send SMS message
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new Twilio(accountSid, authToken);

// Function to send Twilio message with user position
export async function sendTwilioMessage(phone, messageBody) {
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

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  const config = {
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
  return admin.initializeApp(config);
};


// Initialize Firebase Admin
initializeFirebaseAdmin();

// Get Firestore instance
const db = admin.firestore();

// Save user to Firestore
async function saveWaitList(fname, lname, email, phone, partySize, game) {
  const userId = nanoid();
  try {
    const collectionSnapshot = await db.collection("waitlist").get();
    const userPosition = collectionSnapshot.size + 1; // Increment count to get position
    await db.collection("waitlist").doc(userId).set({
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      partySize: partySize,
      game: game,
      // date: Timestamp.fromDate(new Date()),
      position: userPosition, // Store user's position in the document
    });
    console.log("User added to Firestore");
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
}

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

async function updateRemainingUsers() {
  try {
    const usersSnapshot = await db.collection("waitlist").get();
    usersSnapshot.forEach(async (userDoc) => {
      const docId = userDoc.id;
      const docData = userDoc.data();
      const { fname, phone, position } = docData;
      const newPosition = position - 1;
      await db
        .collection("waitlist")
        .doc(docId)
        .update({ position: newPosition });
      await sendTwilioMessage(
        phone,
        `Hi ${fname}, \nYour position in the waitlist has been updated to ${newPosition}.`
      );
    });
  } catch (error) {
    console.error("Error updating remaining users: ", error);
  }
}

async function listenForDeletions() {
  try {
    const unsubscribe = db
      .collection("waitlist")
      .onSnapshot(async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "removed") {
            const deletedData = change.doc.data();
            const deletedDocId = change.doc.id;
            console.log("Document deleted:", deletedDocId);
            console.log("Deleted data:", deletedData);
            await sendTwilioMessage(
              deletedData.phone,
              `Hi ${deletedData.fname}, \nYour table is ready. Please come to the front desk to be seated.`
            );
            await updateRemainingUsers();
          }
        });
      });
    // Uncomment if you want to unsubscribe at some point
    // return unsubscribe;
  } catch (error) {
    console.error("Error listening for deletions:", error);
  }
}

// Call the function to start listening for updates
listenForDeletions();

// Use the router middleware for routes under /api/
app.use("/api/", router);

// Export the handler for serverless deployment
export const handler = serverless(app);
