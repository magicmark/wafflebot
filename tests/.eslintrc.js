'use strict';

module.exports = {
    "env": {
        "mocha": true,
    },
    "rules": {
        // Passing arrow functions to Mocha is discouraged.
        // https://mochajs.org/#arrow-functions
        "prefer-arrow-callback": 0,

        // Allow anonymous functions to be passed to mocha
        "func-names": 0,

        // Add Lentil Deps to whitelist
        "new-cap": ["error", {
            "capIsNewExceptions": [
                "AuthStub",
                "ConfigFilesLoaderStub",
                "LoggerStub",
                "MessageStub",
            ]
        }],

        // Allow imported code in tests to be specified in devDependencies
        "import/no-extraneous-dependencies": ["error", {
            "devDependencies": true,
        }]
    }
}
