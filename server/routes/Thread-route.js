const determine_order_by = require("../helper/FilterBy");
const express = require("express");
const router = express.Router();
const db = require("../models");
const { validate_request } = require("../middlewares/AuthenticateRequests");
const { Op } = require("sequelize");
const { request, response } = require("express");

router.post("/create_thread", validate_request, async (request, response) => {
    try {
        // we are now getting the user_id through the validate_request function
        const user_id = request.user_id;
        const thread_details = request.body;

        const new_thread_details = await db.Thread.create({
            title: thread_details.title,
            description: thread_details.description,
            logo: thread_details.logo,
            theme: thread_details.theme,
            is_innappropriate: false,
            creator_id: user_id,
        });

        const new_list_of_rules = thread_details.list_of_rules.map((rule) => ({
            ...rule,
            thread_id: new_thread_details.id,
        }));

        await db.Rule.bulkCreate(new_list_of_rules);

        response.json({
            msg: "successfully created thread",
            new_thread_details: new_thread_details,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get(
    "/get_thread_details/by_thread_id/:thread_id",
    async (request, response) => {
        try {
            const thread_id = request.params.thread_id;

            console.log("");
            console.log({ thread_id });
            console.log("");

            if (thread_id === "null") {
                response.json({
                    msg: "no thread selected",
                    thread_details: null,
                    thread_id_passed: thread_id,
                });
                return;
            }

            const thread_details = await db.Thread.findOne({
                where: {
                    id: parseInt(thread_id),
                },
                include: [
                    {
                        model: db.User,
                        as: "creator_details",
                        attributes: ["username", "profile_pic"],
                    },
                    {
                        model: db.Rule,
                        as: "thread_rules",
                    },
                ],
            });

            console.log("");
            console.log({ thread_details, thread_id });
            console.log("");

            response.json({
                msg: "successfully found thread details",
                thread_details: thread_details,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get("/get_thread_names", async (request, response) => {
    try {
        const search_input = request.query.search_input;

        const threads = await db.Thread.findAll({
            where: {
                title: {
                    [Op.like]: `%${search_input}%`,
                },
            },
            limit: 10,
        });

        response.json({
            msg: "succesfully got thread names",
            threads: threads,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

module.exports = router;
