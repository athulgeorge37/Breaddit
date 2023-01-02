// styles
import "./Votes.scss";

// hooks
import { useState, useRef, useCallback } from "react";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import {
    useMutation,
    useQuery,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../components/ui/Modal";

// api
import {
    get_all_profile_who_voted,
    get_curr_user_vote,
    make_vote,
} from "../../api/VoteRequests";
import Loading from "../../components/ui/Loading";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Modal from "../../components/ui/Modal";
import { follow_or_unfollow_account } from "../../api/FollowerRequests";
import ToolTip from "../../components/ui/ToolTip";

// TODO: making a vote, updates the post table, which affects the edited time
// fix that boii
const VOTERS_PER_PAGE = 2;

const VOTE_COLOR = {
    up_vote: "#238636",
    down_vote: "#d70101",
    no_vote: "#3f8afb",
};

function Votes({
    vote_type,
    vote_id,
    up_votes = 0,
    down_votes = 0,
    img_path = "..",
}) {
    const { current_user } = useCurrentUser();
    const queryClient = useQueryClient();

    const { open_modal, close_modal, show_modal } = useModal();
    const [modal_vote_type, set_modal_vote_type] = useState(true);

    const [up_vote_count, set_up_vote_count] = useState(up_votes);
    const [down_vote_count, set_down_vote_count] = useState(down_votes);
    const [curr_user_vote, set_curr_user_vote] = useState(null);

    // curr user vote query
    useQuery(
        // using vote_id to distinguish vote count for comments,
        // since all vote_id will be differenet
        ["curr_user_vote", { vote_type, vote_id }],
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
                queryClient.invalidateQueries([
                    "curr_user_vote",
                    { vote_type, vote_id },
                ]);
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
            <Modal show_modal={show_modal} close_modal={close_modal}>
                <div className="voter_list_modal">
                    <VoterListInfiniteScroll
                        vote_type={vote_type}
                        vote_id={vote_id}
                        close_modal={close_modal}
                        modal_vote_type={modal_vote_type}
                        up_vote_count={up_vote_count}
                        down_vote_count={down_vote_count}
                    />
                </div>
            </Modal>

            <ToolTip text="Up Voters" spacing={vote_type == "post" ? 10 : 5}>
                <button
                    className="up_votes"
                    onClick={() => {
                        open_modal();
                        set_modal_vote_type(true);
                    }}
                >
                    {up_vote_count}
                </button>
            </ToolTip>

            <ToolTip text="Up Vote" spacing={vote_type == "post" ? 10 : 5}>
                <button
                    className="up_arrow"
                    onClick={() => handle_vote_change(true)}
                >
                    {curr_user_vote !== true ? (
                        <img
                            src={`${img_path}/images/up_arrow_v3.png`}
                            alt="up_vote"
                            className={`vote_img up_vote ${
                                vote_type !== "post" ? "comment_vote_img" : ""
                            }`}
                        />
                    ) : (
                        <svg
                            version="1.2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 2000 2000"
                            style={{
                                width: vote_type === "post" ? "25px" : "15px",
                                height: vote_type === "post" ? "25px" : "15px",
                            }}
                        >
                            <g id="Layer 2">
                                <path
                                    id="Path 0"
                                    style={{
                                        fill: VOTE_COLOR.up_vote,
                                    }}
                                    d="m999.4 13c1.2 0 4.1 1.4 6.6 3.1 2.5 1.8 10.4 9.1 17.5 16.3 7.2 7.2 17.1 18.3 22.1 24.6 4.9 6.3 16.4 20.7 25.4 32 9 11.3 21.8 27.2 28.4 35.5 6.6 8.2 19.4 24.2 28.4 35.5 9 11.3 19.9 24.8 24.1 30 4.3 5.2 12.7 15.8 18.7 23.5 5.9 7.7 14.9 18.9 19.9 25 5 6.1 13.3 16.4 18.5 23 5.1 6.6 18.1 22.8 28.9 36 10.8 13.2 23.5 28.9 28.1 35 4.6 6.1 11 14.1 14.1 18 3.2 3.9 15.8 19.6 28.1 34.9 12.3 15.3 25.2 31.6 28.8 36.1 3.6 4.5 9.6 12 13.4 16.6 3.8 4.6 13.9 17.2 22.4 27.9 8.6 10.7 18.2 22.9 21.5 27 3.2 4.1 8.8 11.1 12.3 15.5 3.5 4.4 14.3 17.9 24 30 9.7 12.1 19.5 24.2 21.8 27 2.3 2.7 8.2 10.2 13.1 16.5 4.9 6.3 14.1 17.8 20.5 25.5 6.4 7.7 16.3 20.1 22 27.5 5.7 7.4 12.5 16.2 15.2 19.5 2.8 3.3 26.4 32.7 52.6 65.4 26.3 32.6 51.4 64.1 56 70 4.6 5.8 12.9 16.2 18.5 23.1 5.6 6.9 14.9 18.6 20.8 26 5.8 7.4 14.8 18.7 20 25 5.1 6.3 11.7 14.7 14.6 18.5 2.8 3.9 6.7 10.4 8.7 14.5 3 6.3 3.6 8.6 3.6 14 0 4.1-0.7 8-1.9 10.5-1 2.2-3.6 5.7-5.7 7.8-2.1 2-6.3 4.6-9.1 5.7-2.9 1.1-9.2 2.4-14 3-5.5 0.6-75.6 1-186.5 1-154.3 0-178.7 0.2-184.8 1.5-3.8 0.8-9.1 2.6-11.7 3.9-2.7 1.3-6.3 3.9-8.2 5.7-1.8 1.9-4.3 5.4-5.4 7.9-1.1 2.5-2.6 7.9-3.3 12-1.1 6.2-1.3 90.7-1.4 470 0 310.1-0.3 466-1 473-0.6 5.8-1.6 13-2.2 16-0.6 3-2.1 7.7-3.4 10.5-1.2 2.7-4.5 8.3-7.3 12.2-2.9 4.2-8 9.6-11.8 12.7-3.8 2.9-10.4 7.2-14.8 9.4-4.4 2.3-10.2 6-12.9 8.4-2.9 2.5-5.9 6.4-7.3 9.3-1.2 2.7-2.3 5.8-2.3 6.7 0 1.7-11.2 1.8-446.1 1.3l-2.4-6c-1.6-4.1-4-7.4-7.2-10.5-2.7-2.5-8.7-6.5-13.3-8.9-4.7-2.4-11.1-6.5-14.4-9-3.2-2.5-8.2-7.8-11.2-11.6-2.9-3.8-6.7-10-8.3-13.8-1.7-3.7-3.9-10.4-4.8-15-1.6-7.6-1.7-40.7-2.8-954.2l-2.2-6.5c-1.2-3.6-3.2-8.1-4.5-9.9-1.3-1.9-4.3-5-6.8-6.9-2.5-1.8-7.4-4.3-17.5-7.7l-374-1-6.7-2.3c-3.8-1.2-8.3-3.4-10-4.9-1.8-1.6-3.9-3.5-4.6-4.3-0.7-0.8-2.2-3.3-3.2-5.5-1.3-2.7-2-6.2-2-10.5 0-5.5 0.6-7.7 3.9-14.5 2.2-4.4 7-12 10.8-17 3.8-5 12-15.5 18.2-23.5 6.3-8 13.5-17 16-20.1 2.5-3.1 10.1-12.3 16.8-20.5 6.7-8.2 15.9-19.7 20.5-25.5 4.6-5.9 18.2-23 30.3-38 12.1-15.1 22.8-28.3 23.7-29.4 0.9-1.1 7.4-9.4 14.4-18.5 7.1-9.1 19.7-24.8 28.2-35 8.4-10.2 20-24.6 25.7-32 5.6-7.4 16-20.5 23.1-29 7.1-8.5 17.3-21.1 22.6-28 5.3-6.9 17-21.7 26-33 9-11.3 20.8-26 26.3-32.6 5.5-6.7 12.1-14.7 14.6-18 2.5-3.2 11.7-14.9 20.4-25.9 8.7-11 18.1-22.7 20.9-26.1 2.8-3.3 8.3-10 12.1-14.8 3.9-4.8 10.2-12.7 14-17.4 3.9-4.8 12.5-15.7 19-24.2 6.6-8.5 16.5-20.9 22-27.5 5.6-6.6 15.5-19 22.1-27.5 6.6-8.5 20.3-25.6 30.5-38 10.1-12.4 21.6-26.5 25.4-31.5 3.8-4.9 13.2-16.9 20.8-26.5 7.7-9.6 18.4-23.1 24-30 5.6-6.9 20.3-25.1 32.6-40.5 12.4-15.4 28.1-35 34.9-43.5 6.8-8.5 15.2-19.1 18.8-23.5 3.5-4.4 10.8-13.7 16.1-20.6 5.4-7 14.6-18.5 20.4-25.5 5.9-7.1 15.8-17.8 22-23.8 6.3-6 13.2-12.2 15.3-13.8 2.2-1.5 4.9-2.8 6-2.8z"
                                />
                                <path
                                    id="Path 1"
                                    // fill-rule="evenodd"
                                    fill="none"
                                    d="m0 0h2000v2000h-388.5c-369.3 0-388.5-0.1-388.5-1.8 0-0.9 1.1-4 2.3-6.7 1.4-2.9 4.4-6.8 7.3-9.3 2.7-2.4 8.5-6.1 12.9-8.4 4.4-2.2 11-6.5 14.8-9.4 3.8-3.1 8.9-8.5 11.8-12.6 2.8-4 6.1-9.5 7.3-12.3 1.3-2.7 2.8-7.5 3.4-10.5 0.6-3 1.6-10.2 2.2-16 0.7-7 1-162.9 1-473 0.1-379.3 0.3-463.8 1.4-470 0.7-4.1 2.2-9.5 3.3-12 1.1-2.5 3.6-6 5.4-7.9 1.9-1.8 5.5-4.4 8.1-5.7 2.7-1.3 8-3.1 11.8-3.9 6.1-1.3 30.5-1.5 184.8-1.5 110.9 0 181-0.4 186.4-1 4.9-0.6 11.2-1.9 14-3 2.9-1.1 7.1-3.7 9.2-5.7 2.1-2.1 4.7-5.6 5.7-7.8 1.2-2.5 1.9-6.4 1.9-10.5 0-5.4-0.6-7.7-3.6-14-2-4.1-5.9-10.6-8.7-14.5-2.9-3.8-9.5-12.2-14.6-18.5-5.2-6.3-14.2-17.6-20-25-5.9-7.4-15.2-19.1-20.8-26-5.6-6.9-13.9-17.3-18.5-23.1-4.6-5.9-29.7-37.4-56-70-26.2-32.7-49.8-62.1-52.6-65.4-2.7-3.3-9.5-12.1-15.2-19.5-5.7-7.4-15.6-19.8-22-27.5-6.4-7.7-15.6-19.2-20.5-25.5-4.9-6.3-10.8-13.7-13.1-16.5-2.3-2.7-12.1-14.9-21.8-27-9.7-12.1-20.5-25.6-24-30-3.5-4.4-9.1-11.4-12.3-15.5-3.3-4.1-12.9-16.3-21.5-27-8.5-10.7-18.6-23.3-22.4-27.9-3.8-4.6-9.8-12.1-13.4-16.6-3.6-4.5-16.5-20.8-28.8-36.1-12.3-15.3-24.9-31-28.1-34.9-3.1-3.9-9.5-11.9-14.1-18-4.6-6.1-17.3-21.8-28.1-35-10.8-13.2-23.8-29.4-28.9-36-5.2-6.6-13.5-16.9-18.5-23-5-6.1-14-17.3-19.9-25-6-7.7-14.4-18.3-18.7-23.5-4.2-5.2-15.1-18.7-24.1-30-9-11.3-21.8-27.2-28.4-35.5-6.6-8.2-19.4-24.2-28.4-35.5-9-11.3-20.5-25.7-25.4-32-5-6.3-12.7-15.2-17.1-19.9-4.4-4.6-11.8-11.7-16.5-15.8-4.7-4.1-9.6-7.7-11-8-1.5-0.4-3.8 0.2-5.9 1.3-1.8 1.1-8.9 7.3-15.8 13.9-6.9 6.6-17.4 17.8-23.2 24.9-5.8 7-15 18.5-20.4 25.5-5.3 6.9-12.6 16.2-16.1 20.6-3.6 4.4-12 15-18.8 23.5-6.8 8.5-22.5 28.1-34.9 43.5-12.3 15.4-27 33.6-32.6 40.5-5.6 6.9-16.3 20.4-24 30-7.6 9.6-17 21.6-20.8 26.5-3.8 4.9-15.3 19.1-25.4 31.5-10.2 12.4-23.9 29.5-30.5 38-6.6 8.5-16.5 20.9-22.1 27.5-5.5 6.6-15.4 19-22 27.5-6.5 8.5-15.1 19.4-19 24.2-3.8 4.7-10.1 12.6-14 17.4-3.9 4.8-9.3 11.5-12.1 14.8-2.8 3.4-12.2 15.1-20.9 26.1-8.7 11-17.9 22.7-20.4 25.9-2.5 3.3-9.1 11.3-14.6 18-5.5 6.6-17.3 21.3-26.3 32.6-9 11.3-20.7 26.1-26 33-5.3 6.9-15.5 19.5-22.6 28-7.1 8.5-17.5 21.6-23.1 29-5.7 7.4-17.3 21.8-25.7 32-8.5 10.2-21.1 25.9-28.2 35-7 9.1-13.5 17.4-14.4 18.5-0.9 1.1-11.6 14.3-23.7 29.4-12.1 15-25.7 32.1-30.3 38-4.6 5.8-13.8 17.3-20.5 25.5-6.7 8.2-14.3 17.4-16.8 20.5-2.5 3.1-9.7 12.1-16 20.1-6.2 8-14.4 18.5-18.2 23.5-3.8 5-8.6 12.6-10.8 17-3.3 6.8-3.9 9-3.9 14.5 0 4.3 0.7 7.8 2 10.5 1 2.2 2.5 4.7 3.2 5.5 0.7 0.8 2.8 2.7 4.5 4.3 1.8 1.5 6.3 3.7 16.8 7.2l374 1 6.5 2.2c3.6 1.2 8.5 3.7 11 5.5 2.5 1.9 5.5 5 6.8 6.9 1.3 1.8 3.3 6.3 6.7 16.4l0.5 473c0.6 440.5 0.7 473.6 2.3 481.3 0.9 4.5 3.1 11.2 4.8 14.9 1.6 3.8 5.4 10 8.3 13.8 3 3.8 8 9.1 11.2 11.6 3.3 2.5 9.5 6.4 13.9 8.7 4.4 2.2 10.2 6 12.9 8.4 2.7 2.4 5.5 5.6 6.4 7.3 0.8 1.7 2.1 4.7 4.2 10.5h-777zm1002 104.6c3.3 0.2 7.9 1.6 11.5 3.4 3.3 1.6 7.4 4.4 9.2 6.2 1.7 1.8 7.8 9.2 13.5 16.4 5.7 7.2 30.9 38.7 56 70 25.2 31.3 49 61 53 66 4 5 13.1 16.4 20.3 25.4 7.2 8.9 17.5 22 23 29 5.5 7 16.6 21 24.8 31.1 8.1 10.1 18.9 23.6 24 30 5 6.4 15.9 19.8 24.2 29.9 8.2 10 20 24.6 26 32.5 6 7.8 16.4 20.9 23 29.1 6.5 8.2 16.1 20.1 21.2 26.4 5 6.3 11.4 14.2 14.1 17.5 2.6 3.3 9.3 11.6 14.8 18.5 5.4 6.9 15.1 18.8 21.4 26.6 6.3 7.7 16.4 20.3 22.4 28 6.1 7.6 15.3 19.3 20.5 25.9 5.2 6.6 13.1 16.5 17.5 22 4.4 5.5 10.9 13.6 14.5 18 3.6 4.4 9.7 11.9 13.6 16.6 3.8 4.7 10.6 13.3 15 19 4.4 5.7 13.9 17.6 21.2 26.4 7.3 8.8 18.3 22.6 24.5 30.6 6.2 8 23.4 29.6 38.1 48 14.8 18.4 29 36.5 31.5 40.4 2.5 3.9 5.7 10.1 7 14 1.8 5.1 2.3 8.6 2.1 12.7-0.3 4.3-1.1 6.6-3.5 10-2 2.8-4.8 5.2-8.5 7-2.9 1.5-7.9 3.2-10.9 3.7-3.8 0.8-52 1.1-152.5 1.1-80.8 0-152.6 0.5-159.5 1-8.5 0.6-14.4 1.6-18.5 3.1-4.5 1.6-7.4 3.6-11.5 7.8-3.8 3.9-6.2 7.4-7.7 11.6-1.3 3.3-2.7 8.5-3.3 11.5-0.7 3.7-1 161.1-1 486.5-0.1 305.7-0.4 483.7-1 488.5-0.6 4.1-1.7 9.5-2.5 12-0.8 2.5-2.8 6.4-4.5 8.8-1.6 2.3-4.9 5.6-7.3 7.2-2.3 1.7-6.7 3.8-9.7 4.8-5.1 1.6-19.4 1.7-208.5 1.7-189.1 0-203.4-0.1-208.5-1.7-3-1-7.4-3.1-9.8-4.8-2.3-1.6-5.6-4.9-7.2-7.2-1.7-2.4-3.7-6.3-4.5-8.8-0.8-2.5-1.9-7.7-2.5-11.5-0.6-4.6-1-173.9-1-489 0-422.4-0.2-482.9-1.5-489-0.8-3.9-2.7-9.5-4.2-12.5-1.5-3-4.2-7-6-8.7-1.8-1.8-5.2-4.3-7.6-5.5-2.3-1.2-6.7-2.8-9.7-3.7-4.8-1.3-27-1.5-325.5-2.6l-6-2.3c-3.3-1.2-7.4-3.3-9-4.6-1.6-1.2-4-4.2-5.2-6.7-1.3-2.6-2.3-6.3-2.3-8.9 0-2.5 0.7-7 1.6-10 0.9-3 2.9-7.7 4.4-10.5 1.6-2.7 8.3-12.2 15-21 6.6-8.8 16.7-21.6 22.3-28.4 5.6-6.8 13.8-16.7 18.2-22.1 4.4-5.3 12.8-15.9 18.7-23.5 5.8-7.7 16.6-21.2 24-30.1 7.3-8.8 16.7-20.5 20.8-25.9 4.1-5.4 11.2-14.3 15.7-19.9 4.4-5.5 13.5-16.8 20.1-25.1 6.6-8.2 16.4-20.5 21.8-27.1 5.5-6.7 15.3-19 21.9-27.5 6.6-8.4 17.2-21.6 23.5-29.3 6.3-7.8 16-19.7 21.4-26.6 5.5-6.9 12.5-15.6 15.6-19.5 3.1-3.9 10.5-13.3 16.5-21 6-7.7 16.3-20.5 23-28.5 6.7-8 16.2-19.9 21.2-26.5 5.1-6.6 15.1-19.2 22.3-28 7.3-8.8 17.8-21.7 23.3-28.6 5.6-7 14.5-18.2 19.7-24.9 5.2-6.8 16.6-21.1 25.3-31.9 8.7-10.8 21.3-26.5 28-35 6.7-8.4 16.5-20.6 21.7-27 5.2-6.4 19.1-23.7 31-38.6 11.9-14.8 25.4-31.9 30-38 4.5-6.1 15.8-20 25-31 9.2-11 20.5-24.9 25.2-31 4.6-6 10-12.3 11.9-13.9 1.9-1.6 5.2-3.8 7.4-4.9 2.2-1.1 5.6-2.4 7.5-2.8 1.9-0.4 6-0.6 9-0.3z"
                                />
                            </g>
                        </svg>
                    )}
                </button>
            </ToolTip>

            <ToolTip text="Down Vote" spacing={vote_type == "post" ? 10 : 5}>
                <button
                    className="down_arrow"
                    onClick={() => handle_vote_change(false)}
                >
                    {curr_user_vote !== false ? (
                        <img
                            src={`${img_path}/images/up_arrow_v3.png`}
                            alt="up_vote"
                            className={`vote_img down down_vote ${
                                vote_type !== "post" ? "comment_vote_img" : ""
                            }`}
                        />
                    ) : (
                        <svg
                            version="1.2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 2000 2000"
                            style={{
                                width: vote_type === "post" ? "25px" : "15px",
                                height: vote_type === "post" ? "25px" : "15px",
                                transform: "rotate(180deg)",
                            }}
                        >
                            <g id="Layer 2">
                                <path
                                    id="Path 0"
                                    style={{
                                        fill: VOTE_COLOR.down_vote,
                                    }}
                                    d="m999.4 13c1.2 0 4.1 1.4 6.6 3.1 2.5 1.8 10.4 9.1 17.5 16.3 7.2 7.2 17.1 18.3 22.1 24.6 4.9 6.3 16.4 20.7 25.4 32 9 11.3 21.8 27.2 28.4 35.5 6.6 8.2 19.4 24.2 28.4 35.5 9 11.3 19.9 24.8 24.1 30 4.3 5.2 12.7 15.8 18.7 23.5 5.9 7.7 14.9 18.9 19.9 25 5 6.1 13.3 16.4 18.5 23 5.1 6.6 18.1 22.8 28.9 36 10.8 13.2 23.5 28.9 28.1 35 4.6 6.1 11 14.1 14.1 18 3.2 3.9 15.8 19.6 28.1 34.9 12.3 15.3 25.2 31.6 28.8 36.1 3.6 4.5 9.6 12 13.4 16.6 3.8 4.6 13.9 17.2 22.4 27.9 8.6 10.7 18.2 22.9 21.5 27 3.2 4.1 8.8 11.1 12.3 15.5 3.5 4.4 14.3 17.9 24 30 9.7 12.1 19.5 24.2 21.8 27 2.3 2.7 8.2 10.2 13.1 16.5 4.9 6.3 14.1 17.8 20.5 25.5 6.4 7.7 16.3 20.1 22 27.5 5.7 7.4 12.5 16.2 15.2 19.5 2.8 3.3 26.4 32.7 52.6 65.4 26.3 32.6 51.4 64.1 56 70 4.6 5.8 12.9 16.2 18.5 23.1 5.6 6.9 14.9 18.6 20.8 26 5.8 7.4 14.8 18.7 20 25 5.1 6.3 11.7 14.7 14.6 18.5 2.8 3.9 6.7 10.4 8.7 14.5 3 6.3 3.6 8.6 3.6 14 0 4.1-0.7 8-1.9 10.5-1 2.2-3.6 5.7-5.7 7.8-2.1 2-6.3 4.6-9.1 5.7-2.9 1.1-9.2 2.4-14 3-5.5 0.6-75.6 1-186.5 1-154.3 0-178.7 0.2-184.8 1.5-3.8 0.8-9.1 2.6-11.7 3.9-2.7 1.3-6.3 3.9-8.2 5.7-1.8 1.9-4.3 5.4-5.4 7.9-1.1 2.5-2.6 7.9-3.3 12-1.1 6.2-1.3 90.7-1.4 470 0 310.1-0.3 466-1 473-0.6 5.8-1.6 13-2.2 16-0.6 3-2.1 7.7-3.4 10.5-1.2 2.7-4.5 8.3-7.3 12.2-2.9 4.2-8 9.6-11.8 12.7-3.8 2.9-10.4 7.2-14.8 9.4-4.4 2.3-10.2 6-12.9 8.4-2.9 2.5-5.9 6.4-7.3 9.3-1.2 2.7-2.3 5.8-2.3 6.7 0 1.7-11.2 1.8-446.1 1.3l-2.4-6c-1.6-4.1-4-7.4-7.2-10.5-2.7-2.5-8.7-6.5-13.3-8.9-4.7-2.4-11.1-6.5-14.4-9-3.2-2.5-8.2-7.8-11.2-11.6-2.9-3.8-6.7-10-8.3-13.8-1.7-3.7-3.9-10.4-4.8-15-1.6-7.6-1.7-40.7-2.8-954.2l-2.2-6.5c-1.2-3.6-3.2-8.1-4.5-9.9-1.3-1.9-4.3-5-6.8-6.9-2.5-1.8-7.4-4.3-17.5-7.7l-374-1-6.7-2.3c-3.8-1.2-8.3-3.4-10-4.9-1.8-1.6-3.9-3.5-4.6-4.3-0.7-0.8-2.2-3.3-3.2-5.5-1.3-2.7-2-6.2-2-10.5 0-5.5 0.6-7.7 3.9-14.5 2.2-4.4 7-12 10.8-17 3.8-5 12-15.5 18.2-23.5 6.3-8 13.5-17 16-20.1 2.5-3.1 10.1-12.3 16.8-20.5 6.7-8.2 15.9-19.7 20.5-25.5 4.6-5.9 18.2-23 30.3-38 12.1-15.1 22.8-28.3 23.7-29.4 0.9-1.1 7.4-9.4 14.4-18.5 7.1-9.1 19.7-24.8 28.2-35 8.4-10.2 20-24.6 25.7-32 5.6-7.4 16-20.5 23.1-29 7.1-8.5 17.3-21.1 22.6-28 5.3-6.9 17-21.7 26-33 9-11.3 20.8-26 26.3-32.6 5.5-6.7 12.1-14.7 14.6-18 2.5-3.2 11.7-14.9 20.4-25.9 8.7-11 18.1-22.7 20.9-26.1 2.8-3.3 8.3-10 12.1-14.8 3.9-4.8 10.2-12.7 14-17.4 3.9-4.8 12.5-15.7 19-24.2 6.6-8.5 16.5-20.9 22-27.5 5.6-6.6 15.5-19 22.1-27.5 6.6-8.5 20.3-25.6 30.5-38 10.1-12.4 21.6-26.5 25.4-31.5 3.8-4.9 13.2-16.9 20.8-26.5 7.7-9.6 18.4-23.1 24-30 5.6-6.9 20.3-25.1 32.6-40.5 12.4-15.4 28.1-35 34.9-43.5 6.8-8.5 15.2-19.1 18.8-23.5 3.5-4.4 10.8-13.7 16.1-20.6 5.4-7 14.6-18.5 20.4-25.5 5.9-7.1 15.8-17.8 22-23.8 6.3-6 13.2-12.2 15.3-13.8 2.2-1.5 4.9-2.8 6-2.8z"
                                />
                                <path
                                    id="Path 1"
                                    // fill-rule="evenodd"
                                    fill="none"
                                    d="m0 0h2000v2000h-388.5c-369.3 0-388.5-0.1-388.5-1.8 0-0.9 1.1-4 2.3-6.7 1.4-2.9 4.4-6.8 7.3-9.3 2.7-2.4 8.5-6.1 12.9-8.4 4.4-2.2 11-6.5 14.8-9.4 3.8-3.1 8.9-8.5 11.8-12.6 2.8-4 6.1-9.5 7.3-12.3 1.3-2.7 2.8-7.5 3.4-10.5 0.6-3 1.6-10.2 2.2-16 0.7-7 1-162.9 1-473 0.1-379.3 0.3-463.8 1.4-470 0.7-4.1 2.2-9.5 3.3-12 1.1-2.5 3.6-6 5.4-7.9 1.9-1.8 5.5-4.4 8.1-5.7 2.7-1.3 8-3.1 11.8-3.9 6.1-1.3 30.5-1.5 184.8-1.5 110.9 0 181-0.4 186.4-1 4.9-0.6 11.2-1.9 14-3 2.9-1.1 7.1-3.7 9.2-5.7 2.1-2.1 4.7-5.6 5.7-7.8 1.2-2.5 1.9-6.4 1.9-10.5 0-5.4-0.6-7.7-3.6-14-2-4.1-5.9-10.6-8.7-14.5-2.9-3.8-9.5-12.2-14.6-18.5-5.2-6.3-14.2-17.6-20-25-5.9-7.4-15.2-19.1-20.8-26-5.6-6.9-13.9-17.3-18.5-23.1-4.6-5.9-29.7-37.4-56-70-26.2-32.7-49.8-62.1-52.6-65.4-2.7-3.3-9.5-12.1-15.2-19.5-5.7-7.4-15.6-19.8-22-27.5-6.4-7.7-15.6-19.2-20.5-25.5-4.9-6.3-10.8-13.7-13.1-16.5-2.3-2.7-12.1-14.9-21.8-27-9.7-12.1-20.5-25.6-24-30-3.5-4.4-9.1-11.4-12.3-15.5-3.3-4.1-12.9-16.3-21.5-27-8.5-10.7-18.6-23.3-22.4-27.9-3.8-4.6-9.8-12.1-13.4-16.6-3.6-4.5-16.5-20.8-28.8-36.1-12.3-15.3-24.9-31-28.1-34.9-3.1-3.9-9.5-11.9-14.1-18-4.6-6.1-17.3-21.8-28.1-35-10.8-13.2-23.8-29.4-28.9-36-5.2-6.6-13.5-16.9-18.5-23-5-6.1-14-17.3-19.9-25-6-7.7-14.4-18.3-18.7-23.5-4.2-5.2-15.1-18.7-24.1-30-9-11.3-21.8-27.2-28.4-35.5-6.6-8.2-19.4-24.2-28.4-35.5-9-11.3-20.5-25.7-25.4-32-5-6.3-12.7-15.2-17.1-19.9-4.4-4.6-11.8-11.7-16.5-15.8-4.7-4.1-9.6-7.7-11-8-1.5-0.4-3.8 0.2-5.9 1.3-1.8 1.1-8.9 7.3-15.8 13.9-6.9 6.6-17.4 17.8-23.2 24.9-5.8 7-15 18.5-20.4 25.5-5.3 6.9-12.6 16.2-16.1 20.6-3.6 4.4-12 15-18.8 23.5-6.8 8.5-22.5 28.1-34.9 43.5-12.3 15.4-27 33.6-32.6 40.5-5.6 6.9-16.3 20.4-24 30-7.6 9.6-17 21.6-20.8 26.5-3.8 4.9-15.3 19.1-25.4 31.5-10.2 12.4-23.9 29.5-30.5 38-6.6 8.5-16.5 20.9-22.1 27.5-5.5 6.6-15.4 19-22 27.5-6.5 8.5-15.1 19.4-19 24.2-3.8 4.7-10.1 12.6-14 17.4-3.9 4.8-9.3 11.5-12.1 14.8-2.8 3.4-12.2 15.1-20.9 26.1-8.7 11-17.9 22.7-20.4 25.9-2.5 3.3-9.1 11.3-14.6 18-5.5 6.6-17.3 21.3-26.3 32.6-9 11.3-20.7 26.1-26 33-5.3 6.9-15.5 19.5-22.6 28-7.1 8.5-17.5 21.6-23.1 29-5.7 7.4-17.3 21.8-25.7 32-8.5 10.2-21.1 25.9-28.2 35-7 9.1-13.5 17.4-14.4 18.5-0.9 1.1-11.6 14.3-23.7 29.4-12.1 15-25.7 32.1-30.3 38-4.6 5.8-13.8 17.3-20.5 25.5-6.7 8.2-14.3 17.4-16.8 20.5-2.5 3.1-9.7 12.1-16 20.1-6.2 8-14.4 18.5-18.2 23.5-3.8 5-8.6 12.6-10.8 17-3.3 6.8-3.9 9-3.9 14.5 0 4.3 0.7 7.8 2 10.5 1 2.2 2.5 4.7 3.2 5.5 0.7 0.8 2.8 2.7 4.5 4.3 1.8 1.5 6.3 3.7 16.8 7.2l374 1 6.5 2.2c3.6 1.2 8.5 3.7 11 5.5 2.5 1.9 5.5 5 6.8 6.9 1.3 1.8 3.3 6.3 6.7 16.4l0.5 473c0.6 440.5 0.7 473.6 2.3 481.3 0.9 4.5 3.1 11.2 4.8 14.9 1.6 3.8 5.4 10 8.3 13.8 3 3.8 8 9.1 11.2 11.6 3.3 2.5 9.5 6.4 13.9 8.7 4.4 2.2 10.2 6 12.9 8.4 2.7 2.4 5.5 5.6 6.4 7.3 0.8 1.7 2.1 4.7 4.2 10.5h-777zm1002 104.6c3.3 0.2 7.9 1.6 11.5 3.4 3.3 1.6 7.4 4.4 9.2 6.2 1.7 1.8 7.8 9.2 13.5 16.4 5.7 7.2 30.9 38.7 56 70 25.2 31.3 49 61 53 66 4 5 13.1 16.4 20.3 25.4 7.2 8.9 17.5 22 23 29 5.5 7 16.6 21 24.8 31.1 8.1 10.1 18.9 23.6 24 30 5 6.4 15.9 19.8 24.2 29.9 8.2 10 20 24.6 26 32.5 6 7.8 16.4 20.9 23 29.1 6.5 8.2 16.1 20.1 21.2 26.4 5 6.3 11.4 14.2 14.1 17.5 2.6 3.3 9.3 11.6 14.8 18.5 5.4 6.9 15.1 18.8 21.4 26.6 6.3 7.7 16.4 20.3 22.4 28 6.1 7.6 15.3 19.3 20.5 25.9 5.2 6.6 13.1 16.5 17.5 22 4.4 5.5 10.9 13.6 14.5 18 3.6 4.4 9.7 11.9 13.6 16.6 3.8 4.7 10.6 13.3 15 19 4.4 5.7 13.9 17.6 21.2 26.4 7.3 8.8 18.3 22.6 24.5 30.6 6.2 8 23.4 29.6 38.1 48 14.8 18.4 29 36.5 31.5 40.4 2.5 3.9 5.7 10.1 7 14 1.8 5.1 2.3 8.6 2.1 12.7-0.3 4.3-1.1 6.6-3.5 10-2 2.8-4.8 5.2-8.5 7-2.9 1.5-7.9 3.2-10.9 3.7-3.8 0.8-52 1.1-152.5 1.1-80.8 0-152.6 0.5-159.5 1-8.5 0.6-14.4 1.6-18.5 3.1-4.5 1.6-7.4 3.6-11.5 7.8-3.8 3.9-6.2 7.4-7.7 11.6-1.3 3.3-2.7 8.5-3.3 11.5-0.7 3.7-1 161.1-1 486.5-0.1 305.7-0.4 483.7-1 488.5-0.6 4.1-1.7 9.5-2.5 12-0.8 2.5-2.8 6.4-4.5 8.8-1.6 2.3-4.9 5.6-7.3 7.2-2.3 1.7-6.7 3.8-9.7 4.8-5.1 1.6-19.4 1.7-208.5 1.7-189.1 0-203.4-0.1-208.5-1.7-3-1-7.4-3.1-9.8-4.8-2.3-1.6-5.6-4.9-7.2-7.2-1.7-2.4-3.7-6.3-4.5-8.8-0.8-2.5-1.9-7.7-2.5-11.5-0.6-4.6-1-173.9-1-489 0-422.4-0.2-482.9-1.5-489-0.8-3.9-2.7-9.5-4.2-12.5-1.5-3-4.2-7-6-8.7-1.8-1.8-5.2-4.3-7.6-5.5-2.3-1.2-6.7-2.8-9.7-3.7-4.8-1.3-27-1.5-325.5-2.6l-6-2.3c-3.3-1.2-7.4-3.3-9-4.6-1.6-1.2-4-4.2-5.2-6.7-1.3-2.6-2.3-6.3-2.3-8.9 0-2.5 0.7-7 1.6-10 0.9-3 2.9-7.7 4.4-10.5 1.6-2.7 8.3-12.2 15-21 6.6-8.8 16.7-21.6 22.3-28.4 5.6-6.8 13.8-16.7 18.2-22.1 4.4-5.3 12.8-15.9 18.7-23.5 5.8-7.7 16.6-21.2 24-30.1 7.3-8.8 16.7-20.5 20.8-25.9 4.1-5.4 11.2-14.3 15.7-19.9 4.4-5.5 13.5-16.8 20.1-25.1 6.6-8.2 16.4-20.5 21.8-27.1 5.5-6.7 15.3-19 21.9-27.5 6.6-8.4 17.2-21.6 23.5-29.3 6.3-7.8 16-19.7 21.4-26.6 5.5-6.9 12.5-15.6 15.6-19.5 3.1-3.9 10.5-13.3 16.5-21 6-7.7 16.3-20.5 23-28.5 6.7-8 16.2-19.9 21.2-26.5 5.1-6.6 15.1-19.2 22.3-28 7.3-8.8 17.8-21.7 23.3-28.6 5.6-7 14.5-18.2 19.7-24.9 5.2-6.8 16.6-21.1 25.3-31.9 8.7-10.8 21.3-26.5 28-35 6.7-8.4 16.5-20.6 21.7-27 5.2-6.4 19.1-23.7 31-38.6 11.9-14.8 25.4-31.9 30-38 4.5-6.1 15.8-20 25-31 9.2-11 20.5-24.9 25.2-31 4.6-6 10-12.3 11.9-13.9 1.9-1.6 5.2-3.8 7.4-4.9 2.2-1.1 5.6-2.4 7.5-2.8 1.9-0.4 6-0.6 9-0.3z"
                                />
                            </g>
                        </svg>
                    )}
                </button>
            </ToolTip>

            <ToolTip text="Down Voters" spacing={vote_type == "post" ? 10 : 5}>
                <button
                    className="down_votes"
                    onClick={() => {
                        open_modal();
                        set_modal_vote_type(false);
                    }}
                >
                    {down_vote_count}
                </button>
            </ToolTip>
        </div>
    );
}

function VoterListInfiniteScroll({
    vote_type,
    vote_id,
    close_modal,
    modal_vote_type,
    up_vote_count,
    down_vote_count,
}) {
    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        error,
    } = useInfiniteQuery(
        ["voter_info", { vote_type, vote_id, is_up_vote: modal_vote_type }],
        ({ pageParam = 0 }) =>
            get_all_profile_who_voted(
                vote_type,
                vote_id,
                modal_vote_type,
                VOTERS_PER_PAGE,
                pageParam
            ),
        {
            getNextPageParam: (lastPage, allPages) => {
                // when the last page retrieved has no posts in it
                // we return undefined so hasNextPage becomes false

                // when the last page's posts does have posts in it, it indicates
                // there are more posts, so we set the page number to
                // all_pages.length

                // we do not add 1 since, page numbers in the server start from
                // 0 and go up

                return lastPage.all_voters.length ? allPages.length : undefined;
            },
            onError: (data) => {
                console.log({ infinite_voters: data });
            },
        }
    );

    const intObserver = useRef();
    const lastPostRef = useCallback(
        (voter) => {
            // not requesting next page if current page is loading
            if (isFetchingNextPage) {
                return;
            }

            // disconnecting previous intersection observers
            if (intObserver.current) {
                intObserver.current.disconnect();
            }

            // fetching next intersection observer
            intObserver.current = new IntersectionObserver((voters) => {
                // console.log({
                //     isIntersecting: posts[0].isIntersecting,
                //     hasNextPage,
                // });
                if (voters[0].isIntersecting && hasNextPage) {
                    console.log("Fetching more voters");
                    fetchNextPage();
                }
            });

            if (voter) {
                intObserver.current.observe(voter);
            }
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    const list_of_voters = data?.pages.map((pg) => {
        const length_of_voters = pg.all_voters.length;

        return pg.all_voters.map((voter_data, i) => {
            if (i + 1 === length_of_voters) {
                return (
                    <div ref={lastPostRef} key={voter_data.id}>
                        <VoterCard
                            voter_data={voter_data}
                            close_modal={close_modal}
                            voter_info_query={{
                                vote_type,
                                vote_id,
                                is_up_vote: modal_vote_type,
                            }}
                        />
                    </div>
                );
            }
            return (
                <div key={voter_data.id}>
                    <VoterCard
                        voter_data={voter_data}
                        close_modal={close_modal}
                        voter_info_query={{
                            vote_type,
                            vote_id,
                            is_up_vote: modal_vote_type,
                        }}
                    />
                </div>
            );
        });
    });

    return (
        <div className="VoterListInfiniteScroll">
            <div className="header">
                <h2>
                    {modal_vote_type
                        ? `${up_vote_count} Up Voter${
                              up_vote_count !== 1 ? "s" : ""
                          }`
                        : `${down_vote_count} Down Voter${
                              down_vote_count !== 1 ? "s" : ""
                          }`}
                </h2>
                <ToolTip text="Close Modal">
                    <button
                        className="close_modal_btn"
                        onClick={() => close_modal()}
                    >
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </ToolTip>
            </div>
            {error && <span>Error: {JSON.stringify(error)}</span>}

            <div className="voter_content">
                <div className="list_of_voters">
                    {list_of_voters}
                    <div className="end_of_voters_lists">
                        {isFetchingNextPage && <Loading />}

                        {hasNextPage === false && <p>No more voters</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function VoterCard({ voter_data, close_modal, voter_info_query }) {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const queryClient = useQueryClient();
    const [is_following, set_is_following] = useState(voter_data.is_following);

    const follow_or_unfollow_account_mutation = useMutation(
        (account_id) => {
            return follow_or_unfollow_account(account_id);
        },
        {
            onSuccess: (data) => {
                console.log({ data });
                queryClient.invalidateQueries(["voter_info", voter_info_query]);
                set_is_following(data.is_following);
            },
        }
    );

    return (
        <div className="VoterCard">
            <div className="left_side">
                <ProfilePicture
                    username={voter_data.dataValues.username}
                    profile_picture_url={voter_data.dataValues.profile_pic}
                />
                <button
                    className="username"
                    onClick={() => {
                        close_modal();
                        setTimeout(() => {
                            navigate(
                                `/profile/${voter_data.dataValues.username}`
                            );
                        }, 500);
                    }}
                >
                    {voter_data.dataValues.username}
                </button>
            </div>
            {current_user.username === voter_data.dataValues.username ? null : (
                <button
                    className={`follower_following_btn ${
                        is_following ? "following_btn" : "follower_btn"
                    }`}
                    onClick={() => {
                        follow_or_unfollow_account_mutation.mutate(
                            voter_data.dataValues.id
                        );
                    }}
                >
                    {is_following ? "Following" : "Follow"}
                </button>
            )}
        </div>
    );
}

export default Votes;
