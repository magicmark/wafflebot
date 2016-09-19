import path from 'path';
import BigWaffle from './../bin/waffle.js';
import WaffleHistory from './../bin/waffle_history.js';


import Promise from 'bluebird';
import fs from 'fs';
Promise.promisifyAll(fs);

import { LentilBase, LentilDep, } from 'lentildi';

export default class Responses extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps() {
        return {
            logger: LentilDep.Provided('logger'),
            BigWaffle,
            WaffleHistory,
            path,
            fs,
        };
    }

    constructor(...args) {
        super(...args);

        this._responses = new Map();
        this._loadResponses();
    }

    _loadResponses() {
        const responsesPath = this.path.join(__dirname, '../responses.json');

        return this.fs.readFileAsync(responsesPath, 'utf8').then(data => {
            const responsesJson = JSON.parse(data);
            for (const response of responsesJson) {
                this.add(response);
            }
        });
    }

    _compileResponseBody(responseBody, message, regexMatches, depth) {
        depth = depth || 1;

        if (depth > 2) {
            return responseBody;
        }

        const wafffleHistory = this._compileResponseBody(this.WaffleHistory, message, regexMatches, ++depth);

        return responseBody
            .replace(/{waffle}/gi, this.BigWaffle)
            .replace(/{author}/gi, message.author)
            .replace(/{waffleHistory}/i, wafffleHistory)
            .replace(/{\$[0-9]+}/gi, (match) => regexMatches.shift());
    }

    _getCompiledResponse(response, message, regexMatches) {
        return this._compileResponseBody(response.body, message, regexMatches);
    }

    /**
     * Turn `{$0} blah blah {$1}` into `(\w+) blah blah (\w+)`
     *
     * @param  {Response} response - Response object
     * @return {RegExp} Compiled regex object
     */
    _getCompiledRegexString(response) {
        const compiledRegexString = response.regex.replace(/{\$[0-9]+}/gi, '(\\w+)');
        return new RegExp(compiledRegexString, 'i');
    }

    add({ match, body, roomGuard = false, requiresPrefix = false, delay = 0, }) {
        this._responses.set(match, {
            regex: match,
            body,
            roomGuard,
            requiresPrefix,
            delay,
        });
    }

    maybeGetResponse(message) {
        // Loop through each response object
        for (const response of this._responses.values()) {
            // Compile and test message body
            const regex = this._getCompiledRegexString(response);
            const match = message.body.match(regex);

            if (match) {
                // Get compiled body
                const compiledResponseBody = this._getCompiledResponse(response, message, match.slice(1));

                // Return clone of the response object, with the body property
                // replaced with the compiled response body.
                return Object.assign({}, response, {
                    body: compiledResponseBody,
                });
            }
        }
    }

}
