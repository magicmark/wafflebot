import request from 'request-promise';
import Promise from 'bluebird';
import { LentilBase, LentilDep } from 'lentildi';

export default class Meme extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps() {
        return {
            logger: LentilDep.Provided('logger'),
            request,
        };
    }

    /**
     * Constructs a MemeMaker object
     *
     * @param {object} auth - The username/password object for imgflip
     */
    constructor(auth, ...args) {
        super(...args);

        this.auth = auth;
    }

    /**
     * Parses and returns the meme lines from the message body
     *
     * @param {string} text - The message body
     * @return {array<string>} Array of meme lines
     * @private
     */
    _parseLines(text) {
        // Syntax: meme me "top line" "bottom line"
        const regexMatch = text.match(/"(.*?)"/g);

        if (regexMatch) {
            return regexMatch.map(lineMatch =>
                lineMatch.substr(1, lineMatch.length - 2)
            ).filter(lineMatch => !!lineMatch);
        }

        return [];
    }

    /**
     * Creates a meme
     *
     * @param  {String} text - String to create meme from
     * @return {Promise} Promise containing the result of the meme
     */
    create(text) {
        const memeLines = this._parseLines(text);

        if ((memeLines.length !== 1) && (memeLines.length !== 2)) {
            return Promise.reject(`Invalid number of meme lines in "${text}"`);
        }

        const params = {
            template_id: '63278523',
            username: this.auth.username,
            password: this.auth.password,
            text0: memeLines[0],
        };

        if (memeLines[1]) {
            params.text1 = memeLines[1];
        }

        const paramsWithoutPassword = Object.assign({}, params, {
            password: '******',
        });
        this.logger.info('Creating meme', text, paramsWithoutPassword);

        return this.request.post('https://api.imgflip.com/caption_image', {
            form: params,
        }).then((body) => {
            const jsonBody = JSON.parse(body);

            if (jsonBody.success && jsonBody.data && jsonBody.data.url) {
                const memeUrl = jsonBody.data.url;
                this.logger.debug(`Meme URL: ${memeUrl}`);

                return memeUrl;
            }

            this.logger.error('Meme API error', jsonBody);
            throw new Error('Meme API Error');
        });
    }
}
