import { useState } from "react";
import "./Votes.scss";

import { useEffect } from "react";
import {
    get_curr_user_vote,
    get_vote_count,
    make_vote,
} from "../../rest_api_requests/VoteRequests";
import { useCurrentUser } from "../../Contexts/CurrentUser/CurrentUserProvider";

function Votes({
    vote_type,
    post_id = null,
    comment_id = null,
    img_path = "..",
}) {
    const { current_user } = useCurrentUser();

    const [up_vote_count, set_up_vote_count] = useState(0);
    const [down_vote_count, set_down_vote_count] = useState(0);

    const [curr_user_vote, set_curr_user_vote] = useState(null);

    useEffect(() => {
        initalise_vote_counts();
        initialise_curr_user_vote();
    }, []);

    const initalise_vote_counts = async () => {
        // console.log("getting vote counts")

        let parent_id_to_use;
        if (vote_type === "post") {
            parent_id_to_use = post_id;
        } else if (vote_type === "comment" || vote_type === "reply") {
            parent_id_to_use = comment_id;
        } else {
            console.log({
                error: "invalid vote_type in Votes Component",
            });
            return;
        }

        const up_vote_response = await get_vote_count(
            parent_id_to_use,
            vote_type,
            true
        );
        const down_vote_response = await get_vote_count(
            parent_id_to_use,
            vote_type,
            false
        );

        if (up_vote_response.error || down_vote_response.error) {
            console.log("up_vote_response", up_vote_response);
            console.log("down_vote_response", down_vote_response);
            return;
        }
        set_up_vote_count(up_vote_response.vote_count);
        set_down_vote_count(down_vote_response.vote_count);
    };

    const initialise_curr_user_vote = async () => {
        let parent_id_to_use;
        if (vote_type === "post") {
            parent_id_to_use = post_id;
        } else if (vote_type === "comment" || vote_type === "reply") {
            parent_id_to_use = comment_id;
        } else {
            console.log({
                error: "invalid vote_type in Votes Component",
            });
            return;
        }

        const response = await get_curr_user_vote(parent_id_to_use, vote_type);
        if (response.error) {
            if (response.error.name === "JsonWebTokenError") {
                console.log({
                    msg: "User is not logged in, cannot get user vote",
                });
            } else {
                console.log(response);
            }
            return;
        }
        // console.log("curr_user_vote", response.curr_user_vote)
        set_curr_user_vote(response.curr_user_vote);
    };

    const handle_vote_change = async (new_vote) => {
        if (current_user.role !== "user") {
            console.log({
                msg: "non users cannot make a vote",
            });
            return;
        }

        let vote_to_send;
        if (new_vote === curr_user_vote) {
            // if the new vote and current vote are the same
            // we will remove the vote altogether
            vote_to_send = null;
        } else {
            // otherwise
            vote_to_send = new_vote;
        }

        const response = await make_vote(
            post_id,
            comment_id,
            vote_type,
            vote_to_send
        );
        if (response.error) {
            if (response.error.name === "JsonWebTokenError") {
                console.log({
                    msg: "User is not logged in, cannot make vote",
                });
            } else {
                console.log(response);
            }
            return;
        }

        console.log(response);

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
