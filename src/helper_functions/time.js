
export const get_current_date = () => {

    const newDate = new Date()
    const date = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    
    return `${date}/${month}/${year}`
}


export const calculate_time_passed = (date_posted) => {

    // const date_posted = post_details.post_date_time;
    const curr_time = new Date().getTime()

    // converting datetime from milliseconds to seconds
    var seconds_passed = (Math.abs(date_posted - curr_time) / 1000) + 1;                       
    var time_in_units_passed = {}; // eg: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}                                                               
    var seconds_in_a_unit = {                                                                  
        year: 31536000,
        month: 2592000,
        week: 604800, 
        day: 86400,   
        hour: 3600,
        minute: 60,
        second: 1
    };

    // calculating time passed in each unit
    Object.keys(seconds_in_a_unit).forEach(function(key){
        time_in_units_passed[key] = Math.floor(seconds_passed / seconds_in_a_unit[key]);
        seconds_passed -= time_in_units_passed[key] * seconds_in_a_unit[key];
    });

    let highest_non_zero_digit
    // finding the first occurrence of a unit not being 0
    for (const key in time_in_units_passed) {
        if (time_in_units_passed[key] !== 0) {
            highest_non_zero_digit = key
            // return `${time_in_units_passed[key]} ${key}s`;
            break;
        }
    }

    // accounting for singular and plural unit of time
    // eg: 1 second vs 2 seconds
    if (time_in_units_passed[highest_non_zero_digit] === 1) {
        return `${time_in_units_passed[highest_non_zero_digit]} ${highest_non_zero_digit}`;
    } else {
        return `${time_in_units_passed[highest_non_zero_digit]} ${highest_non_zero_digit}s`;
    }
}