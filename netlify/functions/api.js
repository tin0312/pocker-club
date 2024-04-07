import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import serverless from "serverless-http";
import { Twilio } from "twilio";
import "dotenv/config";
import { saveWaitList, getUserPosition, updatePosition } from "./waitlist";


const app = express();
const router = Router();
const accountSid = process.env.ACCOUNT_ID;
const authToken = process.env.ACCOUNT_TOKEN;
const twilioClient = new Twilio(accountSid, authToken);
let isSubmitted = false;

// Content parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Handle submission route
router.post("/form-submission", (req, res) => {
  isSubmitted=true;
  res.redirect("/confirmation.html")
  // Extract form data from the request body
  const { fname, lname, email, phone, partySize, game } = req.body;
  // Get user's position in waitlist
  const userPosition = getUserPosition();
  saveWaitList(fname, lname, email, phone, partySize, game);
  sendEmail(fname, lname, email, phone, partySize, game)
    .then(() => {
      // Send Twilio message
      twilioClient.messages
        .create({
          body: `Thank you for booking with us! You are currently in position ${userPosition} in the waitlist. We will notify you when a spot becomes available.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        })
        .then((message) => console.log(message.sid))
        .catch((error) =>
          console.error("Error sending Twilio message:", error)
        );
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to submit form. Please try again later.");
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

//Add user to waitlist in Firestore
async function saveWaitLIst(fname, lname, email, phone, partySize, game) {
  let userId = nanoid();
  try {
    await setDoc(doc(db, "waitlist", userId), {
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      partySize: partySize,
      game: game,
      date: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
}

// Set up Email services
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

// Use the router middleware for routes under /api/
app.use("/api", router);

// Export the handler for serverless deployment
export const handler = serverless(app);
