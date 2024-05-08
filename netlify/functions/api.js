import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
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
function initializeFirebaseAdmin(){
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
  res.redirect("/confirmation.html");
  // Extract form data from the request body
  const { fname, lname, email, phone, msg, game } = req.body;
  // Send email using Nodemailer
  await sendEmail(fname, lname, email, phone, msg);
  // Save user to Firestore
  await saveWaitList(fname, lname, email, phone, msg, game);
  // Get user's position in waitlist
  const userPosition = await getCurrentPosition();
  // Send Twilio message
  await sendTwilioMessage(
      phone,
      `Hi ${fname},\nYour position in the waitlist is ${userPosition}. We will notify you when the seat is available!`
    ).catch((error) => {
      console.error("Error sending SMS:", error);
    });
});

// Set up Email services
async function sendEmail(fname, lname, email, phone, msg) {
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
        <p style="margin: 30px 0;"><strong>Phone:</strong> ${phone}</p>
    </div>
    <div style="background-color: #fff; padding: 20px; border-radius: 10px;">
        <p>${msg}</p>
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
async function saveWaitList(fname, lname, email, phone, msg, game) {
  const userId = nanoid();
  try {
    const collectionSnapshot = await db.collection("waitlist").get();
    const userPosition = collectionSnapshot.size + 1; // Increment count to get position
    await db.collection("waitlist").doc(userId).set({
      id: userId,
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      msg: msg,
      game: game,
      position: userPosition
    });
    console.log("User added to Firestore");
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