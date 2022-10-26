import "./LineChart.scss";
import { useState } from "react";
import Loading from "../../components/ui/Loading";

import {
    get_dates_for_hour,
    get_dates_for_day,
    get_dates_for_week,
    get_dates_for_month,
    get_dates_for_year,
} from "../../helper_functions/get_list_of_dates";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function LineChart({ chart_data, chart_options, get_data }) {
    const [all_times, set_all_times] = useState({
        selected_time: "hour",
        available_times: ["hour", "day", "week", "month", "year"],
    });

    const [loading, set_loading] = useState(false);

    // useEffect(() => {

    //     handle_time_change("hour")
    //     set_all_times({
    //         ...all_times,
    //         selected_time: "hour"
    //     })

    // }, [get_data])

    const handle_time_change = async (time) => {
        // gets the correct datetimes and labels based on what the user selected
        // datetimes are required to retrieve the appropriate data for the selected time
        // and labels are required for the graph's x axis
        set_loading(true);

        // to change the btn styles
        set_all_times({
            ...all_times,
            selected_time: time,
        });

        let dates_and_labels;
        switch (time) {
            case "hour":
                dates_and_labels = get_dates_for_hour();
                break;
            case "day":
                dates_and_labels = get_dates_for_day();
                break;
            case "week":
                dates_and_labels = get_dates_for_week();
                break;
            case "month":
                dates_and_labels = get_dates_for_month();
                break;
            case "year":
                dates_and_labels = get_dates_for_year();
                break;
        }

        await get_data(dates_and_labels);

        set_loading(false);
    };

    return (
        <div className="LineChart">
            <div className="date_btns">
                {all_times.available_times.map((time) => {
                    return (
                        <button
                            key={time}
                            className={
                                time === all_times.selected_time ? "active" : ""
                            }
                            onClick={() => handle_time_change(time)}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>

            <div className="line_chart">
                {loading === true ? (
                    <Loading />
                ) : (
                    <Line data={chart_data} options={chart_options} />
                )}
            </div>
        </div>
    );
}

export default LineChart;
