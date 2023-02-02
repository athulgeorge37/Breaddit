const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");
const { validate_role } = require("../middlewares/AuthenticateRequests");
require("dotenv").config();
const db = require("../models");

router.post("/send_verification_code", async (request, response) => {
    try {
        const { email, username } = request.body;

        const verification_code = Math.floor(100000 + Math.random() * 900000);

        const email_subject = `Breddit Sign Up Verification Code For ${username}`;

        const html_to_send = `
        <div 
            style="
                color: blue;
            "
        >
            <h1>Hello ${username}</h1>
            <p>Your Verification code is ${verification_code}</p>
        </div>
        `;

        const transport = nodemailer.createTransport({
            // service: "hotmail",
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        transport.sendMail(
            {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: email_subject,
                html: html_to_send,
            },
            (err, info) => {
                if (err) {
                    response.json({
                        error: err,
                    });
                    return;
                }
                response.json({
                    msg: "email sent",
                    verification_code: verification_code,
                });
            }
        );
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.post(
    "/report_issue_request",
    validate_role,
    async (request, response) => {
        try {
            const { topic, description } = request.body;

            let email_subject = "";
            if (request.role === "user") {
                const user_details = await db.User.findByPk(request.user_id);
                email_subject = `${user_details.username} has reported an issue.`;
            }

            if (request.role === "public_user") {
                email_subject = `A Public User has reported an issue.`;
            }

            const html_to_send = `
        <div 
            style="
                color: red;
            "
        >
            <h1>Hello Breaddit</h1>
            <h2>${email_subject}</h2>
            <span>Topic:</span>
            <p>${topic}</p>
            <span>Description:</span>
            <p>${description}</p>
        </div>
        `;

            const transport = nodemailer.createTransport({
                // service: "hotmail",
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            transport.sendMail(
                {
                    from: process.env.EMAIL_FROM,
                    to: process.env.EMAIL_FROM,
                    subject: email_subject,
                    html: html_to_send,
                },
                (err, info) => {
                    if (err) {
                        response.json({
                            error: err,
                        });
                        return;
                    }
                    response.json({
                        msg: "issue has been reported, thankyou for helping us improve breaddit",
                    });
                }
            );
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

module.exports = router;
