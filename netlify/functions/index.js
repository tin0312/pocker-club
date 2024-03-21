// netlify/functions/api.js

import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import serverless from "serverless-http";

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));

router.post("/form-submission", async (req, res) => {
  const { fname, lname, email, phone, msg } = req.body;

  console.log("First Name:", fname);
  console.log("Last Name:", lname);
  console.log("Email:", email);
  console.log("Phone:", phone);
  console.log("Message:", msg);

  try {
    await sendEmail(fname, lname, email, phone, msg);
    console.log("Email sent successfully!");
    res.status(200).send("Form submitted successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to submit form. Please try again later.");
  }
});

const sendEmail = async (fname, lname, email, phone, msg) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "justinhoang0312@gmail.com",
      pass: "bftd rapg glnw zeyh",
    },
  });

  let mailOptions = {
    from: email,
    to: "justinhoang0312@gmail.com",
    subject: "Booking",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">New appointment</h2>
              <p style="font-size: 18px; color: #666; margin-bottom: 10px;"><strong>First Name:</strong> ${fname}</p>
              <p style="font-size: 18px; color: #666; margin-bottom: 10px;"><strong>Last Name:</strong> ${lname}</p>
              <p style="font-size: 18px; color: #666; margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
              <p style="font-size: 18px; color: #666; margin-bottom: 10px;"><strong>Phone:</strong> ${phone}</p>
              <div style="margin-bottom: 20px;">
                  <p>${msg}</p>
              </div>
          </div>
      </div>
  `,
  };

  await transporter.sendMail(mailOptions);
};

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);
