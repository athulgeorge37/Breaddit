import "../../features/vote/Votes.scss";

function StaticVotes({ up_vote_count, down_vote_count, vote_type }) {
    return (
        <div className="votes">
            <div className="up_votes">{up_vote_count}</div>

            <button
                className="up_arrow"
                // onClick={() => handle_vote_change(true)}
            >
                {vote_type === "post" && <span>Up Vote</span>}
                <img
                    src="../../images/up_arrow_v3.png"
                    alt="up_vote"
                    className={`vote_img up_vote`}
                />
            </button>

            <button
                className="down_arrow"
                // onClick={() => handle_vote_change(false)}
            >
                {vote_type === "post" && <span>Down Vote</span>}
                <img
                    src="../../images/up_arrow_v3.png"
                    alt="up_vote"
                    className={`vote_img down down_vote`}
                />
            </button>

            <div className="down_votes">{down_vote_count}</div>
        </div>
    );
}

export default StaticVotes;
