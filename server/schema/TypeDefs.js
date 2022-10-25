const { gql } = require("apollo-server-express");

const typeDefs = gql`
    scalar Date

    type User {
        id: ID!
        username: String!
        email: String!
        role: String!
        profile_pic: String
        password: String!
        bio: String
        is_banned: Boolean!
        createdAt: Date!
        Followers(id: ID!, limit: Int!, offset: Int!): [User!]
        Following(id: ID!, limit: Int!, offset: Int!): [User!]
    }

    type Post {
        id: ID!
        title: String!
        text: String!
        image: String
        edited: Boolean!
        updatedAt: Date!
        author_id: ID!
        is_inappropriate: Boolean!
    }

    type Vote_Date_Data {
        date: Date!
        vote_count: Int!
    }

    type Query {
        get_users(limit: Int!, offset: Int!): [User!]!
        get_user_info(id: ID!): User!
        get_follower_count(id: ID!): Int!
        get_following_count(id: ID!): Int!
        get_number_of_user_posts(id: ID!): Int!
        get_profile_visitors_count(id: ID!): Int!
        check_is_online(id: ID!): Boolean!

        get_total_votes_before_date(
            dates: [Date!]!
            up_vote: Boolean!
            parent_type: String!
            post_id: ID
            comment_id: ID
        ): [Int!]!

        get_total_followers_before_date(dates: [Date!]!, id: ID!): [Int!]!
        get_total_following_before_date(dates: [Date!]!, id: ID!): [Int!]!
        get_total_profile_visits_before_date(dates: [Date!]!, id: ID): [Int!]!

        get_posts_by_user_id(user_id: ID!, limit: Int!, offset: Int!): [Post!]!
        get_total_comments_by_post_id(post_id: ID!): Int!
        get_total_up_votes_by_post_id(post_id: ID!): Int!
        get_total_down_votes_by_post_id(post_id: ID!): Int!

        get_profile_visitors_by_user_id(
            user_id: ID!
            limit: Int!
            offset: Int!
        ): [User!]!
    }

    type Mutation {
        update_ban_status(id: ID!, new_ban_status: Boolean!): Boolean!
        update_is_inappropriate_status(
            post_id: ID!
            new_is_inappropriate_status: Boolean!
        ): Boolean!
    }

    type Subscription {
        banned_User: User!
    }
`;

module.exports = {
    typeDefs,
};
