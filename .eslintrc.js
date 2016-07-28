'use strict';

module.exports = {
    "extends": "airbnb",
    "env": {
        "node": true,
        "es6": true,
    },
    "rules": {
        "indent": ["error", 4],
        "comma-dangle": ["error", "always"],
        // Allow private identifiers
        "no-underscore-dangle": 0,
    }
};
