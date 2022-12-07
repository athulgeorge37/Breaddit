const determine_order_by = (filter_by) => {
    switch (filter_by) {
        case "NEW":
            return [["updatedAt", "DESC"]];
        case "OLD":
            return [["updatedAt", "ASC"]];
        case "TOP":
            return [
                ["up_votes", "DESC"],
                ["down_votes", "ASC"],
            ];
        case "BOTTOM":
            return [
                ["down_votes", "DESC"],
                ["up_votes", "ASC"],
            ];
        default:
            return [["updatedAt", "DESC"]];
    }
};

module.exports = determine_order_by;
