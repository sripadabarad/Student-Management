const {query} = require("express-validator");

// for paginationValidator

const paginationValidator = [
    query("page")
    .optional()  // agar client nhi bheja to nai chahiye page
    .isInt({ min:1 })
    .withMessage("Page must be a positve number"),

    query("limit")
    .optional()   // agar client nai bheja to nai chahiye limit
    .isInt({ min:1 , max:100 })
    .withMessage("Limit must be between 1 to 100"),

    query("search")
    .optional()   // agar client nai bheja to nai chahiye search
    .trim()
    .notEmpty()
    .withMessage("Search must not be empty")
];

module.exports = paginationValidator;