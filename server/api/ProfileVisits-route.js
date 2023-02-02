const express = require("express");
const router = express.Router();

const db = require("../models");

const { validate_request } = require("../middlewares/AuthenticateRequests");

const { Op } = require("sequelize");


router.post("/make_profile_visit", validate_request, async (request, response) => {

    try {
        // we are now getting the user_id through the validate_request function
        const visited_by = request.user_id;    // the person who is viisitng the profile
        const { profile_username, curr_time, last_minute } = request.body;

        const profile_user_details = await db.User.findOne({
            where: {
                username: profile_username
            }
        })

        const previous_profile_visits = await db.ProfileVisits.findOne({
            where: {
                visited_by: visited_by,
                user_id: profile_user_details.id,
                visit_time: {
                    [Op.between]: [last_minute, curr_time],
                    // getting dates where its less than or equal to the date provided
                    // in order to get it for different time periods
                    // call this and specificy differnt date u want to get for
                }
            }
        })

    

        if (previous_profile_visits === null) {
            const profile_visit = await db.ProfileVisits.create({
                visited_by: visited_by,
                user_id: profile_user_details.id,
                visit_time: curr_time
            })
    
            response.json({
                msg: "successfully created profile visit",
                profile_visit: profile_visit
            })
        } else {
            response.json({
                error: "there is already a profile visit in the last minute",
                curr_time: curr_time,
                last_minute: last_minute
            })
        }

    } catch (e) {
        response.json({
            error: e
        })
    }
})

module.exports = router