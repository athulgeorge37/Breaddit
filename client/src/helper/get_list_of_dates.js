import moment from "moment";

export const get_last_minute = () => {
    const curr_datetime = new Date();
    return moment(curr_datetime).minutes(curr_datetime.getMinutes() - 1);
};

export const get_dates_for_day = () => {
    const curr_date = new Date();
    const curr_hr = curr_date.getHours();
    const start_of_day = moment(curr_date)
        .seconds(0)
        .minutes(0)
        .hours(0)
        .toDate();

    const all_labels = [];
    const all_dates = [];
    for (let hour = 0; hour < curr_hr + 1; hour++) {
        const new_date = moment(start_of_day).add(hour, "h").toDate();
        all_dates.push(new_date);

        if (hour === 0) {
            all_labels.push(`${12}am`);
        } else if (hour === 12) {
            all_labels.push(`${hour}pm`);
        } else if (hour > 12) {
            all_labels.push(`${hour - 12}pm`);
        } else {
            all_labels.push(`${hour}am`);
        }
    }

    return { all_dates, all_labels };
};

export const get_dates_for_hour = () => {
    const curr_date = new Date();
    const curr_min = curr_date.getMinutes();
    const start_of_hr = moment(curr_date)
        .seconds(0)
        .subtract(curr_min, "m")
        .toDate();

    const all_labels = [];
    const all_dates = [];
    for (let min = 0; min < curr_min + 1; min++) {
        const new_date = moment(start_of_hr).add(min, "m").toDate();
        all_dates.push(new_date);
        all_labels.push(min);
    }

    return { all_dates, all_labels };
};

export const get_dates_for_week = () => {
    const curr_date = new Date();
    const curr_month = curr_date.getMonth() + 1;
    const one_week_before = moment(curr_date)
        .seconds(0)
        .minutes(0)
        .hours(0)
        .subtract(7, "d")
        .toDate();

    const day_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const all_labels = [];
    const all_dates = [];

    for (let day = 0; day < 7 + 1; day++) {
        const new_date = moment(one_week_before).add(day, "d").toDate();

        all_dates.push(new_date);
        all_labels.push(
            `${
                day_of_week[new_date.getDay()]
            } ${new_date.getDate()}/${curr_month}`
        );
    }

    return { all_dates, all_labels };
};

export const get_dates_for_month = () => {
    const curr_date = new Date();
    const curr_day = curr_date.getDate();
    const curr_month = curr_date.getMonth() + 1;
    const start_of_month = moment(curr_date)
        .seconds(0)
        .minutes(0)
        .hours(0)
        .subtract(curr_day - 1, "d")
        .toDate();

    const all_labels = [];
    const all_dates = [];

    for (let day = 0; day < curr_day; day++) {
        const new_date = moment(start_of_month).add(day, "d").toDate();

        all_dates.push(new_date);
        all_labels.push(`${day + 1}/${curr_month}`);
    }

    return { all_dates, all_labels };
};

export const get_dates_for_year = () => {
    const curr_date = new Date();
    const curr_day = curr_date.getDate();
    const start_of_year = moment(curr_date)
        .seconds(0)
        .minutes(0)
        .hours(0)
        .subtract(curr_day - 1, "d")
        .subtract(12, "months")
        .toDate();

    const all_labels = [];
    const all_dates = [];

    const all_months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    for (let month = 0; month < 12 + 1; month++) {
        const new_date = moment(start_of_year).add(month, "months").toDate();

        all_dates.push(new_date);

        const month_str = all_months[new_date.getMonth()];
        const year = new_date.getFullYear().toString().slice(-2);
        all_labels.push(`${month_str} / ${year}`);
    }
    //console.log(all_dates)

    return { all_dates, all_labels };
};
