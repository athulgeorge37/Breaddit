const determine_order_by = (filter_by) => {
    switch (filter_by.toLowerCase()) {
        case "new":
            return [["edited_time", "DESC"]];
        case "old":
            return [["edited_time", "ASC"]];
        case "top":
            return [
                ["up_votes", "DESC"],
                ["down_votes", "ASC"],
            ];
        case "bottom":
            return [
                ["down_votes", "DESC"],
                ["up_votes", "ASC"],
            ];
        default:
            return [["edited_time", "DESC"]];
    }
};

module.exports = determine_order_by;
