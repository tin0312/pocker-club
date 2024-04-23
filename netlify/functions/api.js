import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import serverless from "serverless-http";
import "dotenv/config";

const app = express();
const router = Router();

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
router.post("/form-submission", (req, res) => {
  isSubmitted = true;
  // Extract form data from the request body
  const { fname, lname, email, phone, partySize } = req.body;
  // Send email using Nodemailer
  sendEmail(fname, lname, email, phone, partySize)
    .then(() => {
      console.log("Email sent successfully!");
      res.redirect("/confirmation");

      setTimeout(() => {
        isSubmitted = false;
      }, 6000);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to submit form. Please try again later.");
    });
});

// Set up Email services
async function sendEmail(fname, lname, email, phone, partySize) {
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
        <p>${partySize}</p>
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