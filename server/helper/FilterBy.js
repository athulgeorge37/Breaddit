const determine_order_by = (filter_by) => {
    switch (filter_by) {
        case "New":
            return [["updatedAt", "DESC"]];
        case "Old":
            return [["updatedAt", "ASC"]];
        case "Top":
            return [
                ["up_votes", "DESC"],
                ["down_votes", "ASC"],
            ];
        case "Bottom":
            return [
                ["down_votes", "DESC"],
                ["up_votes", "ASC"],
            ];
        default:
            return [["updatedAt", "DESC"]];
    }
};

module.exports = determine_order_by;
