import Command from './command.js';

const BODY_REGEX = /^\s*wafflebot\s*:?\s*/i;
const COMMAND_MAP = {
    notify: Command.NOTIFY,
    join: Command.JOIN,
    meme: Command.MEME,
    fight: Command.FIGHT,
};

export default class Message {

    /**
     * Creates a Message instance.
     * 
     * // TODO(magicmark):
     * This is a class I would like to make more static and possibly immutable.
     * Object.freeze(this) possibly inside constructor. Using getters for now
     * for ease of testing and speed of development.
     * 
     * @param  {string} options.body - Raw message text
     * @param  {string} options.author - Message author
     * @param  {string} options.channel - Channel name
     */
    constructor({ body, author, channel, }) {
        this._body = body;

        // TODO: Investigate why the body might not be a string from time to time
        if (!body) {
            this._body = '';
        }

        this.author = author;

        if (channel) {
            this.channel = channel;
            this.isPrivateMessage = false;
        } else {
            this.isPrivateMessage = true;
        }
    }

    /**
     * Get the formatted body (without the wafflebot: prefix)
     *
     * @return {string} message body
     */
    get body() {
        // remove wafflebot prefix
        let messageBody = this._body.replace(BODY_REGEX, '');
        // remove excess spacings and make lower case
        messageBody = messageBody.trim().replace(/(\s){2,}/g, ' ').toLowerCase();

        return messageBody;
    }

    /**
     * Returns the split formatted message for later processing
     * 
     * @return {array} array of strings
     */
    get parts() {
        return this.body.split(' ');
    }

    /**
     * Determines if the message was prefixed with wafflebot: prefix
     *
     * @return {boolean}
     */
    get hasPrefix() {
        return BODY_REGEX.test(this._body);
    }

    /**
     * Return the raw message body without any formatting
     *
     * @return {string} raw body
     */
    get rawBody() {
        return this._body;
    }

    /**
     * Message command (usually the first argument)
     *
     * @return {string}
     */
    get command() {
        const mappedCommand = COMMAND_MAP[this.parts[0]];
        if (mappedCommand) {
            return mappedCommand;
        }

        return Command.DEFAULT;
    }

}
