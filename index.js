// Import required modules
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import nodemailer from "nodemailer";

// Create an Express application
const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submission
app.post("/form-submission", (req, res) => {
  // Extract form data from the request body
  const { fname, lname, email, phone, msg } = req.body;

  // Log the form data
  console.log("First Name:", fname);
  console.log("Last Name:", lname);
  console.log("Email:", email);
  console.log("Phone:", phone);
  console.log("Message:", msg);

  // Send email using Nodemailer
  sendEmail(fname, lname, email, phone, msg)
    .then(() => {
      console.log("Email sent successfully!");
      res.send("Form submitted successfully!"); // Respond to the client
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to submit form. Please try again later."); // Respond with an error to the client
    });
});

// Serve static files from the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(__dirname));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to send email using Nodemailer
async function sendEmail(fname, lname, email, phone, msg) {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "justinhoang0312@gmail.com", // Registered Email address
      pass: "bftd rapg glnw zeyh", // Registerd Gmail App password
    },
  });

  // Email message options
  let mailOptions = {
    from: email, // Sender address
    to: "justinhoang0312@gmail.com", // Receiver address (your email)
    subject: "Booking", // Subject line
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

  // Send the email
  await transporter.sendMail(mailOptions);
}
