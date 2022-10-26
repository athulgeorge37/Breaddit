import { gql } from "@apollo/client";

export const GET_POST_DATA = gql`
    query get_post_data($post_id: ID!) {
        get_total_comments_by_post_id(post_id: $post_id)
        get_total_up_votes_by_post_id(post_id: $post_id)
        get_total_down_votes_by_post_id(post_id: $post_id)
    }
`;

export const POSTS_BY_USER = gql`
    query get_posts_by_user($user_id: ID!, $limit: Int!, $offset: Int!) {
        get_posts_by_user_id(
            user_id: $user_id
            limit: $limit
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

export const UPDATE_IS_INAPPROPRIATE_STATUS = gql`
    mutation change_is_inapropriate(
        $post_id: ID!
        $new_is_inappropriate_status: Boolean!
    ) {
        update_is_inappropriate_status(
            post_id: $post_id
            new_is_inappropriate_status: $new_is_inappropriate_status
        )
    }
`;
