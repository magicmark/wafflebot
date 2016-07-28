import Promise from 'bluebird';
import request from 'request-promise';

export default class Meme {

    /**
     * Constructs a MemeMaker object
     *
     * @param  {object} options.auth     The username/password object for imgflip
     * @param  {log4js} options.logger   The logger instance
     * @param  {object} options.request  Request API npm module
     */
    constructor({ auth, logger, _request = request, }) {
        this.auth = auth;
        this.logger = logger;
        this.request = _request;
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
            return Promise.reject('Invalid number of meme lines');
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

        this.logger.info('Creating meme', text, params);

        return this.request.post('https://api.imgflip.com/caption_image', {
            form: params,
        }).then(body => {
            const jsonBody = JSON.parse(body);

            if (jsonBody.success && jsonBody.data && jsonBody.data.url) {
                return jsonBody.data.url;
            }

            this.logger.error('Meme API error', jsonBody);
            throw new Error('Meme API Error');
        });
    }
}
