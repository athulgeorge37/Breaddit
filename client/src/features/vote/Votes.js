import { useState } from "react";
import "./Votes.scss";

import {
    get_curr_user_vote,
    make_vote,
} from "../../rest_api_requests/VoteRequests";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useMutation, useQuery } from "@tanstack/react-query";

function Votes({
    vote_type,
    vote_id,
    up_votes = 0,
    down_votes = 0,
    img_path = "..",
}) {
    const { current_user } = useCurrentUser();

    const [up_vote_count, set_up_vote_count] = useState(up_votes);
    const [down_vote_count, set_down_vote_count] = useState(down_votes);
    const [curr_user_vote, set_curr_user_vote] = useState(null);

    // curr user vote query
    useQuery(
        // using vote_id to distinguish vote count for comments,
        // since all vote_id will be differenet
        ["curr_user_vote", vote_type, vote_id],
        () => get_curr_user_vote(vote_id, vote_type),
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log(data);
                }

                set_curr_user_vote(data.curr_user_vote);
            },
        }
    );

    const update_vote = useMutation(
        (new_vote) => {
            return make_vote(vote_id, vote_type, new_vote);
        },
        {
            onSuccess: (data) => {
                console.log(data);
            },
        }
    );

    const handle_vote_change = async (new_vote) => {
        if (current_user.role !== "user") {
            console.log({
                msg: "non users cannot make a vote",
            });
            return;
        }

        const vote_to_send = new_vote === curr_user_vote ? null : new_vote;

        update_vote.mutate(vote_to_send);

        // updating the up and down vote counters in the UI to reflect changes in DB
        if (new_vote === true) {
            if (curr_user_vote === true) {
                // changing curr_vote from true to null
                set_up_vote_count(up_vote_count - 1);
            } else if (curr_user_vote === false) {
                // changing curr_vote from false to true
                set_down_vote_count(down_vote_count - 1);
                set_up_vote_count(up_vote_count + 1);
            } else if (curr_user_vote === null) {
                // changing curr_vote from null to true
                set_up_vote_count(up_vote_count + 1);
            }
        } else if (new_vote === false) {
            if (curr_user_vote === false) {
                // changing curr_vote from false to null
                set_down_vote_count(down_vote_count - 1);
            } else if (curr_user_vote === true) {
                // changing curr_vote from true to false
                set_down_vote_count(down_vote_count + 1);
                set_up_vote_count(up_vote_count - 1);
            } else if (curr_user_vote === null) {
                // changing curr_vote from null to false
                set_down_vote_count(down_vote_count + 1);
            }
        }

        // to change the UI color for which vote is currently selected
        set_curr_user_vote(vote_to_send);
    };

    return (
        <div className="votes">
            <div className="up_votes">{up_vote_count}</div>

            <button
                className="up_arrow"
                onClick={() => handle_vote_change(true)}
            >
                {vote_type === "post" && <span>Up Vote</span>}
                <img
                    src={`${img_path}/images/up_arrow_v3.png`}
                    alt="up_vote"
                    className={`vote_img up_vote ${
                        curr_user_vote === true ? "active" : ""
                    } ${vote_type !== "post" ? "comment_vote_img" : ""}`}
                />
            </button>

            <button
                className="down_arrow"
                onClick={() => handle_vote_change(false)}
            >
                {vote_type === "post" && <span>Down Vote</span>}
                <img
                    src={`${img_path}/images/up_arrow_v3.png`}
                    alt="up_vote"
                    className={`vote_img down down_vote ${
                        curr_user_vote === false ? "active" : ""
                    } ${vote_type !== "post" ? "comment_vote_img" : ""}`}
                />
            </button>

            <div className="down_votes">{down_vote_count}</div>
        </div>
    );
}

export default Votes;
