'use strict';

module.exports = {
    "extends": [
        "airbnb",
    ],
    "env": {
        "node": true,
        "es6": true,
    },
    "rules": {
        "comma-dangle": ["error", "always"],
        "indent": ["error", 4],

        // Allow private identifiers
        "no-underscore-dangle": 0,

        // Add Lentil API to whitelist
        "new-cap": ["error", {
            "capIsNewExceptions": [
                "LentilDep.Lentil",
                "LentilDep.Regular",
                "LentilDep.Provided",
            ]
        }],
    }
};
