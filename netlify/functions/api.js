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
  const { fname, lname, email, phone, msg } = req.body;
  // Send email using Nodemailer
  sendEmail(fname, lname, email, phone, msg)
    .then(() => {
      console.log("Email sent successfully!");
      res.redirect("/confirmation");

      setTimeout(() => {
        isSubmitted = false;
      }, 3000);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to submit form. Please try again later.");
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
    subject: "Booking",
    html: `
            <div class="container">
                <h2 class="title">New appointment</h2>
                <p class="info"><strong>First Name:</strong> ${fname}</p>
                <p class="info"><strong>Last Name:</strong> ${lname}</p>
                <p class="info"><strong>Email:</strong> ${email}</p>
                <p class="info"><strong>Phone:</strong> ${phone}</p>
                <div class="message">
                    <p>${msg}</p>
                </div>
            </div>
        `,
  };

  let userMailOption = {
    from: process.env.EMAIL_APP,
    to: email,
    subject: "Booking",
    html: `
      <div class="container">
        <h2 class="title">Booking Confirmation</h2>
        <p class="info">Thank you for booking with us!</p>
        <div class="message">
          <p>We have received your booking request and will get back to you shortly.</p>
        </div>
      </div>
      <p style="text-align: center;">Toronto Omega Poker - TOP club</p>
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
