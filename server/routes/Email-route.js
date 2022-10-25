const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");
require("dotenv").config();


router.post("/send_verification_code", async (request, response) => {

    try {

        const { email, username } = request.body;

        const verification_code = Math.floor(100000 + Math.random() * 900000);

        const email_subject = "Breddit Sign Up Verification";

        const html_to_send = `
        <div 
            style="
                display: flex;
                flex-direction: column;
                color: blue;
            "
        >
            <h1>Hello ${username}</h1>
            <p>You Verification code is ${verification_code}</p>
        </div>
        `;

        const transport = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transport.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: email_subject,
            html: html_to_send
        }, (err, info) => {
            if (err) {
                response.json({
                    error: err
                })
            }
            response.json({
                msg: "email sent",
                verification_code: verification_code
            })
        })


    } catch (e) {
        response.json({
            error: e
        })
    }

})



module.exports = router