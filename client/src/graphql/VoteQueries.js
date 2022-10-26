import { gql } from "@apollo/client";

export const GET_VOTE_DATE_DATA = gql`
    query getVotes(
        $dates: [Date!]!
        $up_vote: Boolean!
        $parent_type: String!
        $comment_id: ID
        $post_id: ID
    ) {
        get_total_votes_before_date(
            dates: $dates
            up_vote: $up_vote
            parent_type: $parent_type
            comment_id: $comment_id
            post_id: $post_id
        )
    }
`;
