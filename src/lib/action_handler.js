import Promise from 'bluebird';
import ConfigFilesLoader, { JSONFiles } from './config_files.js';
import Meme from './meme.js';
import Responses from './responses.js';

import { LentilBase, LentilDep } from 'lentildi';

export default class ActionHandler extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps () {
        return {
            configFilesLoader: ConfigFilesLoader,
            client: LentilDep.Provided('client'),
            logger: LentilDep.Provided('logger'),
            watchlist: {},
            meme: Meme,
            responses: Responses,
        }
    }

    /**
     * A check to ensure action is being performed in a room if specified
     *
     * TODO: Fix this confusing logic
     * 
     * @param {Message} message - Message instance
     * @param {Response=} response - Message response instance. (Optional)
     *
     * @return {boolean}
     * @private
     */
    _checkRoomGuard(message, response) {
        if (message.isPrivateMessage && (!response || (response && response.roomGuard))) {
            this.client.say(message.author, 'You need to be in a room to do this!');
            return false;
        }

        return true;
    }


    /**
     * A check to ensure action is being performed with the 'wafflebot' prefix if specified
     *
     * TODO: Fix this confusing logic
     *
     * @param {Message} message - Message instance
     * @param {Response=} response - Message response instance. (Optional)
     *
     * @return {boolean} Is the message correctly prefixed
     * @private
     */
    _checkPrefixGuard(message, response) {
        if (!message.hasPrefix && (!response || (response && response.requiresPrefix))) {
            return false;
        }

        return true;
    }


    /**
     * Joins an IRC Channel
     *
     * @param {Message} message - Message instance
     * @param {string} channelToJoin - The name of the channel we want to join
     */
    joinRoom(message, channelToJoin) {
        if (channelToJoin.charAt(0) !== '#') {
            this.client.say(message.author, `I cannot join ${channelToJoin}! (Did you mean #${channelToJoin}?)`);
            return;
        }

        // Join room
        this.client.join(channelToJoin);
        this.logger.info(`Joined room ${channelToJoin}`);

        // Make it permanent
        this.configFilesLoader.getFileJson(JSONFiles.ROOMS)
            .then(roomsJson => {
                if (roomsJson.indexOf(channelToJoin) === -1) {
                    roomsJson.push(channelToJoin);
                }

                return this.configFilesLoader.writeFileJson(JSONFiles.ROOMS, roomsJson);
            }).then(() => {
                this.client.say(message.author, `I have joined ${channelToJoin}!`);
                this.logger.debug(`Saved room ${channelToJoin} to file`);
            }).catch(err => {
                this.client.say(message.author, `There was a potential problem permanently joining ${channelToJoin}`);
                this.logger.error(`Error joining room ${channelToJoin} - ${err}`);
            });
    }


    /**
     * Action to engage in deadly combat with the enemy known as 'marley'
     *
     * @param  {Message} message - Message instance
     * @return {Promise} Promise containing the result of the action
     */
    fightMarley(message) {
        // console.log TODO disallow this in eslint (one line if body)
        if (!this._checkRoomGuard(message)) return false;

        this.client.action(message.channel, 'Commencing battle...');

        return Promise.delay(1250).then(() => {
            this.client.say(message.channel, 'marley i feel the need');
        }).delay(2500).then(() => {
            this.client.say(message.channel, 'marley come on and slam');
        });
    }


    /**
     * Handles all other actions (ie the stock responses)
     *
     * @param  {Message} message - Message instance
     * @return {Promise} Promise containing the result of the action
     */
    handleOther(message) {
        const response = this.responses.maybeGetResponse(message);

        if (!response) {
            return false;
        }

        if (!this._checkRoomGuard(message, response)) {
            return false;
        }

        if (!this._checkPrefixGuard(message, response)) {
            return false;
        }

        return Promise.delay(response.delay).then(() => {
            if (message.isPrivateMessage) {
                this.client.say(message.author, response.body);
            } else {
                this.client.say(message.channel, response.body);
            }
        });
    }

    /**
     * Action to set up set up ping notifications
     *
     * @param  {Message} message - Message instance
     * @return {Promise} Promise containing the result of the action
     */
    notifications(message) {
        if (!message.isPrivateMessage) {
            const errorMessage = `${message.author}: Private Message me to set up notifications :)`;
            this.client.say(message.channel, errorMessage);
            return false;
        }

        const email = message.parts[2];

        if (message.parts[1] === 'subscribe' && email) {
            return this.watchlist.subscribe(message.author, email).then(() => {
                this.client.say(message.author, `Successfully set up notifications to ${email}!`);
            }).catch(error => {
                this.client.say(message.author, 'There was a possible error setting up notifications. Please contact markl');
            });
        }

        this.client.say(message.author, 'Invalid command. Usage: notify subscribe myemail@example.com');
    }

    /**
     * Makes a meme
     *
     * @param  {Message} message - Message instance
     * @return {Promise} Promise containing the result of the action
     */
    makeMeme(message) {
        return this.meme.create(message.body).then(result => {
            this.client.say(message.channel, `${message.author}: ${result}`);
        });
    }

}
