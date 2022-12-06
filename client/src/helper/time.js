export const get_current_date = (date_ISO) => {
    const newDate = new Date(date_ISO);
    const date = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();

    return `${date}/${month}/${year}`;
};

export const get_current_date_since_inception = (date_since) => {
    console.log(new Date(date_since));

    // const date_since_epoch = new Date(date_since / 1000);
    // console.log(date_since_epoch)
    const curr_epoch = new Date().getTime();

    // console.log(curr_epoch / 1000)
    // console.log(date_since / 1000)

    const newDate = new Date(curr_epoch / 1000 - date_since / 1000);

    const date = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();

    return `${date}/${month}/${year}`;
};

export const calculate_time_passed = (date_posted_in_ISO) => {
    // date_posted is in the ISO dateformat, from mySQL

    // converting date_posted and curr_time into milliseconds
    const date_posted = new Date(date_posted_in_ISO).getTime();
    const curr_time = new Date().getTime();

    // converting datetime from milliseconds to seconds
    var seconds_passed = Math.abs(date_posted - curr_time) / 1000 + 1;
    var time_in_units_passed = {}; // eg: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
    var seconds_in_a_unit = {
        yr: 31536000,
        mo: 2592000,
        wk: 604800,
        dy: 86400,
        hr: 3600,
        min: 60,
        sec: 1,
    };

    // calculating time passed in each unit
    Object.keys(seconds_in_a_unit).forEach(function (key) {
        time_in_units_passed[key] = Math.floor(
            seconds_passed / seconds_in_a_unit[key]
        );
        seconds_passed -= time_in_units_passed[key] * seconds_in_a_unit[key];
    });

    let highest_non_zero_digit;
    // finding the first occurrence of a unit not being 0
    for (const key in time_in_units_passed) {
        if (time_in_units_passed[key] !== 0) {
            highest_non_zero_digit = key;
            // return `${time_in_units_passed[key]} ${key}s`;
            break;
        }
    }

    // accounting for singular and plural unit of time
    // eg: 1 second vs 2 seconds
    let return_string = `${time_in_units_passed[highest_non_zero_digit]} ${highest_non_zero_digit}`;
    if (time_in_units_passed[highest_non_zero_digit] > 1) {
        return_string += "s";
    }
    return return_string;
};
