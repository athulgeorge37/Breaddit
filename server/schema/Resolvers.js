const db = require("../models");

const { Op } = require("sequelize");

const { GraphQLScalarType, Kind } = require("graphql");

const SUBSCRIPTIONS = {
    BANNED_USER: "BANNED_USER",
};

const resolvers = {
    Query: {
        get_users: async (parent, args) => {
            // console.log("limit", args.limit);
            // console.log("offset", args.offset)
            return await db.User.findAll({
                where: {
                    role: "user",
                },
                // order: [["createdAt", "DESC"]],
                limit: args.limit,
                offset: args.offset,
            });
        },
        get_user_info: async (parent, args) => {
            return await db.User.findByPk(args.id);
        },
        get_follower_count: async (parent, args) => {
            const follower_count = await db.Follower.count({
                where: {
                    user_id: args.id,
                },
            });

            return follower_count;
        },
        get_following_count: async (parent, args) => {
            const following_count = await db.Follower.count({
                where: {
                    followed_by: args.id,
                },
            });

            return following_count;
        },
        get_number_of_user_posts: async (parent, args) => {
            const number_of_user_posts = await db.Post.count({
                where: {
                    author_id: args.id,
                },
            });
            return number_of_user_posts;
        },
        get_profile_visitors_count: async (parent, args) => {
            return await db.ProfileVisits.count({
                where: {
                    user_id: args.id,
                },
            });
        },
        check_is_online: async (parent, args) => {
            const user_activity = await db.UserActivity.findOne({
                where: {
                    user_id: args.id,
                    logout_time: null,
                },
            });

            if (user_activity) {
                return true;
            }
            return false;
        },
        get_total_votes_before_date: async (parent, args) => {
            const all_date_vote_data = [];
            for (const date of args.dates) {
                const total_votes = await db.Vote.count({
                    where: {
                        parent_type: args.parent_type,
                        up_vote: args.up_vote,
                        comment_id: args.comment_id,
                        post_id: args.post_id,
                        updatedAt: {
                            [Op.lte]: date,
                            // getting dates where its less than or equal to the date provided
                            // in order to get it for different time periods
                            // call this and specificy differnt date u want to get for
                        },
                    },
                });

                all_date_vote_data.push(total_votes);
            }

            // console.log("all_date_vote_data ====", all_date_vote_data)
            return all_date_vote_data;
        },
        get_total_followers_before_date: async (parent, args) => {
            const all_date_follower_data = [];
            for (const date of args.dates) {
                const total_followers = await db.Follower.count({
                    where: {
                        user_id: args.id,
                        updatedAt: {
                            [Op.lte]: date,
                            // getting dates where its less than or equal to the date provided
                            // in order to get it for different time periods
                            // call this and specificy differnt date u want to get for
                        },
                    },
                });

                all_date_follower_data.push(total_followers);
            }

            return all_date_follower_data;
        },
        get_total_following_before_date: async (parent, args) => {
            const all_date_following_data = [];
            for (const date of args.dates) {
                const total_following = await db.Follower.count({
                    where: {
                        followed_by: args.id,
                        updatedAt: {
                            [Op.lte]: date,
                            // getting dates where its less than or equal to the date provided
                            // in order to get it for different time periods
                            // call this and specificy differnt date u want to get for
                        },
                    },
                });

                all_date_following_data.push(total_following);
            }

            return all_date_following_data;
        },
        get_total_profile_visits_before_date: async (parent, args) => {
            const all_date_profile_visit_data = [];
            for (const date of args.dates) {
                const total_visitors = await db.ProfileVisits.count({
                    where: {
                        user_id: args.id,
                        visit_time: {
                            [Op.lte]: date,
                            // getting dates where its less than or equal to the date provided
                            // in order to get it for different time periods
                            // call this and specificy differnt date u want to get for
                        },
                    },
                });

                all_date_profile_visit_data.push(total_visitors);
            }

            return all_date_profile_visit_data;
        },
        get_posts_by_user_id: async (parent, args) => {
            return await db.Post.findAll({
                where: {
                    author_id: args.user_id,
                },
                limit: args.limit,
                offset: args.offset,
            });
        },
        get_total_comments_by_post_id: async (parent, args) => {
            return await db.Comment.count({
                where: {
                    post_id: args.post_id,
                },
            });
        },
        get_total_up_votes_by_post_id: async (parent, args) => {
            return await db.Vote.count({
                where: {
                    post_id: args.post_id,
                    up_vote: true,
                },
            });
        },
        get_total_down_votes_by_post_id: async (parent, args) => {
            return await db.Vote.count({
                where: {
                    post_id: args.post_id,
                    up_vote: false,
                },
            });
        },
        get_profile_visitors_by_user_id: async (parent, args) => {
            const profile_visitors = await db.ProfileVisits.findAll({
                where: {
                    user_id: args.user_id,
                },
                limit: args.limit,
                offset: args.offset,
            });

            const profile_visitor_ids = profile_visitors.map(
                (row) => row.visited_by
            );

            const all_users = await db.User.findAll({
                where: {
                    id: profile_visitor_ids,
                },
            });

            return all_users;
        },
    },
    Mutation: {
        update_ban_status: async (parent, args, { pubsub }) => {
            await db.User.update(
                {
                    is_banned: args.new_ban_status,
                },
                {
                    where: {
                        id: args.id,
                    },
                }
            );

            const user_details = await db.User.findByPk(args.id);

            // every time this mutation is called
            // we trigger a subscription publish to tell
            // the listening subscription that a user has been banned
            // with the same key, that the listener is listening to
            pubsub.publish(SUBSCRIPTIONS.BANNED_USER, {
                banned_User: user_details,
            });

            return args.new_ban_status;
        },
        update_is_inappropriate_status: async (parent, args) => {
            await db.Post.update(
                {
                    is_inappropriate: args.new_is_inappropriate_status,
                },
                {
                    where: {
                        id: args.post_id,
                    },
                }
            );
            return args.new_is_inappropriate_status;
        },
    },
    Subscription: {
        banned_User: {
            subscribe: (parent, args, { pubsub }) => {
                // pubsub is coming from the context we send,
                // look at where we defined the apollo server

                // the string is a key for this subscription
                return pubsub.asyncIterator(SUBSCRIPTIONS.BANNED_USER);

                // anyone subscribed to this,
                // will get an alert that this event happned
            },
        },
    },
    User: {
        Followers: async (parent, args) => {
            const all_followers = await db.Follower.findAll({
                where: {
                    user_id: args.id,
                },
                limit: args.limit,
                offset: args.offset,
            });

            const all_follower_ids = [];
            for (const row of all_followers) {
                all_follower_ids.push(row.followed_by);
            }

            const all_user_info = await db.User.findAll({
                where: {
                    id: all_follower_ids,
                },
            });
            return all_user_info;
        },
        Following: async (parent, args) => {
            const all_following = await db.Follower.findAll({
                where: {
                    followed_by: args.id,
                },
                limit: args.limit,
                offset: args.offset,
            });

            const all_following_ids = [];
            for (const row of all_following) {
                all_following_ids.push(row.user_id);
            }

            const all_user_info = await db.User.findAll({
                where: {
                    id: all_following_ids,
                },
            });
            return all_user_info;
        },
    },
    Date: new GraphQLScalarType({
        name: "Date",
        description: "Date custom scalar type",
        serialize(value) {
            return value; // Convert outgoing Date to integer for JSON
        },
        parseValue(value) {
            // console.log(new Date(value))
            //   return new Date(value); // Convert incoming integer to Date
            return value;
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
            }
            return null; // Invalid hard-coded value (not an integer)
        },
    }),
};

module.exports = {
    resolvers,
};
