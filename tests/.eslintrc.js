'use strict';

module.exports = {
    'env': {
        'mocha': true,
    },
    'rules': {
        // Passing arrow functions to Mocha is discouraged.
        // https://mochajs.org/#arrow-functions
        'prefer-arrow-callback': 0,
    },
}