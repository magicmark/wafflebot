import fs from 'fs';
import path from 'path';
import WAFFLE from './waffle.js';

const WaffleHistory =
`Established in 2015, Wafflebot is Yelp's foremost and best loved wafflebot.
He quickly rose to popularity by delighting users with his zany waffle-related antics and amusing Britishisms.
Wafflebot's true origins are shrouded in mystery, however many have claimed that he is the work of {author}.
For more information, please contact your team's Wafflebot deputy.`;


export default class Responses {

    constructor ({
        logger,
        _fs = fs,
        _path = path,
    }) {
        this.logger = logger;
        this.fs = _fs;
        this._responses = new Map();
        this._loadResponses();
    }

    _loadResponses () {
        const responsesPath = path.join(__dirname, '../responses.json');
        return this.fs.readFileAsync(responsesPath, 'utf8').then(data => {
            const responsesJson = JSON.parse(data);
            for (const response of responsesJson) {
                this.add(response);
            }
        });
    }

    _parseResponse(response, message) {
        return response.body
            .replace(/{waffle me}/gi, WAFFLE)
            .replace(/{waffleHistory}/gi, WaffleHistory)
            .replace(/{author}/gi, response.author);
    }

    add ({match, body, roomGuard = False, delay = 0}) {
        const regex = new RegExp(match, 'i');
        this._responses.set(match, {
            regex: regex,
            body: body,
            roomGuard: roomGuard,
            delay: delay,
        });
    }

    maybeGetResponse (message) {
        for (const response of this._responses.values()) {
            if (response.regex.test(message.body)) {
                // Return clone of the response object, with the body property
                // replaced with the compiled response body.
                return Object.assign({}, response, {
                    body: this._parseResponse(response, message)
                });
            }
        }
    }

}