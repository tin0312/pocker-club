import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import serverless from "serverless-http";
import path from "path";

const app = express();
const router = Router();

let isSubmitted = false;

//Parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Handle access to confirmation page
// app.get("/confirmation.html", (req, res) => {
//   const rootDirectory = path.join(__dirname, "../../../../..");


// console.log('Root directory:', rootDirectory);
//   if (isSubmitted){
//     res.sendFile('/dist/confirmation.html', { root: rootDirectory });
//   } else {
//     res.redirect("/");
  
//   }
// });
app.get("/confirmation.html", (req, res) => {
    if(isSubmitted){
      res.sendFile("confirmation.html", { root: "dist" });   
    } else {
      res.redirect("/");
    } 
})

// Handle submission route
router.post("/form-submission", (req, res) => {
  isSubmitted = true;
  // Extract form data from the request bsody
  const { fname, lname, email, phone, msg } = req.body;
  // Send email using Nodemailer
  sendEmail(fname, lname, email, phone, msg)
    .then(() => {
      console.log("Email sent successfully!");
      res.redirect("/confirmation.html");
     setTimeout(()=> {
      isSubmitted = false;
     }, 3000)
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

app.use("/api/", router);


export const handler = serverless(app);
