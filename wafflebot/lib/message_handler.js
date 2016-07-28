import Command from './command.js';
import Message from './message.js';

export default class MessageHandler {

    /**
     * Constructor for MessageHandler. Router for the messages.
     *
     * @param  {Client} options.client - The Client object created by irc.Client
     * @param  {Mailer} options.mailer - The Mailer class to send out emails
     * @param  {log4js} options.logger - Logger instance
     * @param  {WatchList} options.watchlist - Watchlist class
     * @param  {ActionHandler} options.actionhandler - ActionHandler class
     * @param  {Message} options._Message - Message class used to store a message
     */
    constructor({
        client,
        mailer,
        logger,
        watchlist,
        actionhandler,
        _Message = Message,
    }) {
        this.client = client;
        this.mailer = mailer;
        this.logger = logger;
        this.watchlist = watchlist;
        this.actions = actionhandler;

        this.Message = _Message;
    }

    /**
     * Takes a message and checks if wafflebot should do stuff about it.
     *
     * @param {Message} message - A message; hopefully waffle-related.
     * @private
     */
    _handleMessage(message) {
        if (message.hasPrefix) {
            if (message.command === Command.NOTIFY) {
                this.actions.notifications(message);
                return;
            }

            if (message.command === Command.JOIN && message.parts[1]) {
                this.actions.joinRoom(message);
                return;
            }
        }

        if (message.command === Command.FIGHT && message.parts[1] === 'marley') {
            this.actions.fightMarley(message);
            return;
        }

        if (message.command === Command.MEME && message.parts[1] === 'me') {
            this.actions.makeMeme(message);
            return;
        }

        this.actions.handleOther(message);
    }

    /**
     * Handles IRC messages to a channel
     *
     * @param  {String} from    The username of the message author
     * @param  {String} room    Channel name
     * @param  {String} message The text of the message
     */
    message(author, channel, body) {
        const message = new this.Message({
            body,
            author,
            channel,
        });

        // Check if the message contained the name of a user we're watching
        const emailAddress = this.watchlist.check(message);
        if (emailAddress) {
            this.mailer.send(emailAddress, message);
        }

        this._handleMessage(message);
    }

    /**
     * Handles IRC messages PM'd to wafflebot
     *
     * @param  {String} author - The username of the message author
     * @param  {String} body - Message body
     */
    pm(author, body) {
        const message = new this.Message({
            body,
            author,
            channel: null,
        });
        this._handleMessage(message);
    }

}
