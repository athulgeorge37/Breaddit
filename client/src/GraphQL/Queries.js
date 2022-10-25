import { gql } from "@apollo/client";

export const GET_ALL_USER_DATA = gql`

    query GetAll(
        $limit: Int!,
        $offset: Int!
    ) {
        get_users(
            limit: $limit,
            offset: $offset
        ) {
            id
            role
            username
            email
            profile_pic
            createdAt
            is_banned
        }
    }

`;


export const GET_ALL_FOLLOWER_DATA = gql`

    query GetFollowers(
        $user_id: ID!
        $limit: Int!,
        $offset: Int!
    ) {
        get_user_info(
            id: $user_id
        ) {
            username
            Followers(
                id: $user_id
                limit: $limit,
                offset: $offset
            ) {
                id
                role
                username
                email
                profile_pic
                createdAt
                is_banned
            }
        }
    }

`;

export const GET_ALL_FOLLOWING_DATA = gql`

    query GetFollowing(
        $user_id: ID!
        $limit: Int!,
        $offset: Int!
    ) {
        get_user_info(
            id: $user_id
        ) {
            username
            Following(
                id: $user_id
                limit: $limit,
                offset: $offset
            ) {
                id
                role
                username
                email
                profile_pic
                createdAt
                is_banned
            }
        }
    }

`;

export const GET_VOTE_DATE_DATA = gql`
    query getVotes(
        $dates: [Date!]!, 
        $up_vote: Boolean!, 
        $parent_type: String!, 
        $comment_id: ID, 
        $post_id: ID
    ) {
        get_total_votes_before_date (
            dates: $dates, 
            up_vote: $up_vote,
            parent_type: $parent_type, 
            comment_id: $comment_id, 
            post_id: $post_id
        )
    }
`;

export const GET_FOLLOWER_DATE_DATA = gql`
    query getFollowerDateData(
        $dates: [Date!]!, 
        $user_id: ID!
    ) {
        get_total_followers_before_date (
            dates: $dates, 
            id: $user_id
        )
    }
`;

export const GET_FOLLOWING_DATE_DATA = gql`
    query getFollowingDateData(
        $dates: [Date!]!, 
        $user_id: ID!
    ) {
        get_total_following_before_date (
            dates: $dates, 
            id: $user_id
        )
    }
`;

export const GET_PROFILE_VISIT_DATE_DATA = gql`
    query getProfileVisitDateData(
        $dates: [Date!]!, 
        $user_id: ID!
    ) {
        get_total_profile_visits_before_date (
            dates: $dates, 
            id: $user_id
        )
    }
`;


export const GET_USER_DATA = gql`
    query getUserData($user_id: ID!) {
        get_user_info(id: $user_id) {
            username
            profile_pic
            email
            bio
            createdAt
            is_banned
        }
        get_follower_count(id: $user_id)
        get_following_count(id: $user_id)
        get_number_of_user_posts(id: $user_id)
        get_profile_visitors_count(id: $user_id)
        check_is_online(id: $user_id)
    }
`;


export const GET_PROFILE_STATS = gql`
    query getProfileStats($user_id: ID!) {
        get_follower_count(id: $user_id)
        get_following_count(id: $user_id)
        get_number_of_user_posts(id: $user_id)
        check_is_online(id: $user_id)
    }
`;

export const UPDATE_BAN_STATUS = gql`
    mutation change_ban($user_id: ID!, $new_ban_status: Boolean!) {
        update_ban_status(id: $user_id, new_ban_status: $new_ban_status)
    }
`;

export const UPDATE_IS_INAPPROPRIATE_STATUS = gql`
    mutation change_is_inapropriate($post_id: ID!, $new_is_inappropriate_status: Boolean!) {
        update_is_inappropriate_status(post_id: $post_id, new_is_inappropriate_status: $new_is_inappropriate_status)
    }
`;


export const POSTS_BY_USER = gql`
    query get_posts_by_user(
        $user_id: ID!,
        $limit: Int!,
        $offset: Int!
    ) {
        get_posts_by_user_id(
            user_id: $user_id,
            limit: $limit,
            offset: $offset
        ) {
            id
            title
            text
            image
            edited
            updatedAt
            author_id
            is_inappropriate
        }
    }
`;

export const GET_PROFILE_VISITORS = gql`
    query get_profile_visitors(
        $user_id: ID!,
        $limit: Int!,
        $offset: Int!
    ) {
        get_profile_visitors_by_user_id (
            user_id: $user_id,
            limit: $limit,
            offset: $offset
        ) {
            id
            username
            role
            profile_pic
            email
            createdAt
            is_banned
        }
    }
`;
 
export const GET_POST_DATA = gql`
    query get_post_data($post_id: ID!) {
        get_total_comments_by_post_id(post_id: $post_id)
        get_total_up_votes_by_post_id(post_id: $post_id)
        get_total_down_votes_by_post_id(post_id: $post_id)
    }
`;