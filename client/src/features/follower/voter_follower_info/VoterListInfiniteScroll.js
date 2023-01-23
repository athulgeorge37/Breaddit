// styles
import "./VoterListInfiniteScroll.scss";

// hooks
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useCallback } from "react";

// api
import { get_all_profile_who_voted } from "../../../api/VoteRequests";

// ui
import Loading from "../../../components/ui/Loading";
import ToolTip from "../../../components/ui/ToolTip";

// components
import VoterFollowerCard from "./VoterFollowerCard";

// constants
const VOTERS_PER_PAGE = 2;

function VoterListInfiniteScroll({
    vote_type,
    vote_id,
    close_modal,
    modal_vote_type,
    set_modal_vote_type,
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
                        <VoterFollowerCard
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
                    <VoterFollowerCard
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
                <div className="tabs">
                    <h2>
                        <button
                            className={`${
                                modal_vote_type === true
                                    ? "active_up_vote_tab"
                                    : ""
                            }`}
                            onClick={() => set_modal_vote_type(true)}
                        >
                            Up Voters
                        </button>
                    </h2>
                    <h2>
                        <button
                            className={`${
                                modal_vote_type === false
                                    ? "active_down_vote_tab"
                                    : ""
                            }`}
                            onClick={() => set_modal_vote_type(false)}
                        >
                            Down Voters
                        </button>
                    </h2>
                </div>
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

                        {hasNextPage === false && (
                            <p>
                                No More {modal_vote_type ? "Up" : "Down"} Voters
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VoterListInfiniteScroll;
