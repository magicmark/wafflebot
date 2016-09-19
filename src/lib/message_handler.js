import { LentilBase, LentilDep } from 'lentildi';

import ActionHandler from './action_handler.js';
import Command from './command.js';
import Mailer from './mailer.js';
import Message from './message.js';
import WatchList from './watchlist.js';

export default class MessageHandler extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps() {
        return {
            logger: LentilDep.Provided('logger'),
            client: LentilDep.Provided('client'),
            mailer: Mailer,
            watchlist: WatchList,
            actions: ActionHandler,
            Message,
        };
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
        }

        if (message.command === Command.JOIN && message.parts[1]) {
            this.actions.joinRoom(message, message.parts[1]);
            return;
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
     * @param {string} author - The username of the message author
     * @param {string} channel - Channel name
     * @param {string} body - The text of the message
     */
    message(author, channel, body) {
        const message = new this.Message({
            body,
            author,
            channel,
        });

        // Possibly perform some action
        this._handleMessage(message);

        // Possibly send out an email to a watched user
        this.watchlist.checkMessage(message);
    }

    /**
     * Handles IRC messages PM'd to wafflebot
     *
     * @param {String} author - The username of the message author
     * @param {String} body   - Message body
     */
    pm(author, body) {
        const message = new this.Message({
            body,
            author,
            channel: null,
        });

        // Possibly perform some action
        this._handleMessage(message);
    }

}
