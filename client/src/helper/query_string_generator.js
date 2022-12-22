// method from
// https://howchoo.com/javascript/how-to-turn-an-object-into-query-string-parameters-in-javascript

const query_string_generator = (params) => {
    return Object.keys(params)
        .map((key) => key + "=" + params[key])
        .join("&");
};

export default query_string_generator;
