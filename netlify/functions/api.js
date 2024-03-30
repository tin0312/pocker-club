import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import serverless from "serverless-http";
import path from "path";

const app = express();
const router = Router();

let isSubmitted = false;

// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Handle access to confirmation page
app.get("/confirmation.html", (req, res) => {
    try {
        if (isSubmitted) {
            // Serve confirmation.html if isSubmitted is true
            const filePath = path.resolve(__dirname, '..','..','..', '..', '..', 'dist', 'confirmation.html');

            res.sendFile(filePath);
        } else {
            // Redirect to home page if isSubmitted is false
            res.redirect("/");
        }
    } catch (error) {
        console.error("Error reading confirmation.html:", error);
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
            res.redirect("/confirmation.html");
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
            user: "justinhoang0312@gmail.com",
            pass: "bftd rapg glnw zeyh",
        },
    });

    // Email message options
    let mailOptions = {
        from: email,
        to: "justinhoang0312@gmail.com",
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

    // Send the email
    await transporter.sendMail(mailOptions);
}

// Use the router middleware for routes under /api/
app.use("/api", router);

// Export the handler for serverless deployment
export const handler = serverless(app);
