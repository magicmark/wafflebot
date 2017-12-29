import validator from 'validator';
import Promise from 'bluebird';
import { LentilBase, LentilDep } from 'lentildi';

import Mailer from './mailer.js';
import ConfigFilesLoader, { JSONFiles } from './config_files.js';

/**
 * WatchList, to check all incoming messages to see if we need to notify anyone.
 */
export default class WatchList extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps() {
        return {
            mailer: Mailer,
            configFilesLoader: ConfigFilesLoader,
            logger: LentilDep.Provided('logger'),
        };
    }

    constructor(...args) {
        super(...args);

        this.watchedUsers = {};
        this.watchedUsersRegex = new Map();

        this._loadWatchedUsers();
    }

    _loadWatchedUsers() {
        return this.configFilesLoader.getFileJson(JSONFiles.WATCH_USERS).then((users) => {
            this.watchedUsers = users;
            this._buildRegexCache();
        })
        .catch((error) => {
            this.logger.error(error);
        });
    }

    _getRegexForUser(user) {
        // Escape regexp special characters allowed in IRC nicks: \^|{}[]
        const escapedUser = user.replace(/[\\^|{}[\]]/g, '\\$&');
        return new RegExp(`(^|\\s)${escapedUser}($|[-:\\s])`, 'i');
    }

    _buildRegexCache() {
        this.watchedUsersRegex.clear();

        Object.keys(this.watchedUsers).forEach((user) => {
            const regex = this._getRegexForUser(user);
            this.watchedUsersRegex.set(user, regex);
        });
    }

    /**
     * Creates a subscription in WatchList
     *
     * @param  {string} user  Username to watch for
     * @param  {string} email Email address to send to
     *
     * @return {Promise} Promise containing the result of permanently storing the subscription
     */
    subscribe(user, email) {
        this.logger.info(`Setting up notifications for "${user}" to "${email}"`);

        if (!validator.isEmail(email)) {
            this.logger.error(`${email} is not a valid email address`);
            return Promise.reject('Invalid email addresss');
        }

        this.watchedUsers[user] = {
            email,
        };

        this._buildRegexCache();

        // save users object to file
        return Promise.resolve().then(() => this.configFilesLoader.writeFileJson(
            JSONFiles.WATCH_USERS,
            this.watchedUsers
        ));
    }

    /**
     * Unsubscribes a user from Watchlist
     *
     * @param  {string} user Username
     * @return {Promise} Promise containing the result of removing the subscription
     */
    unsubscribe(user) {
        this.logger.info(`Removing notifications for "${user}"`);

        delete this.watchedUsers[user];

        this._buildRegexCache();

        // save users object to file
        return Promise.resolve().then(() => this.configFilesLoader.writeFileJson(
            JSONFiles.WATCH_USERS,
            this.watchedUsers
        ));
    }

    checkMessage(message) {
        // Check if the message contained the name of a user we're watching
        const emailAddress = this._maybeGetEmail(message);
        if (emailAddress) {
            this.logger.info([
                `Found matched message for user "${message.author}".`,
                `Sending email to "${emailAddress}"`,
            ].join(' '));

            this.mailer.send(emailAddress, message);
        }
    }

    /**
     * Method to check a message for all users that we need to listen for
     *
     * @param  {Message} message The message
     *
     * @return {string|null} If the message matched someone's username, return their email address.
     */
    _maybeGetEmail(message) {
        const matchedUsers = Object.keys(this.watchedUsers).filter((user) => {
            const regex = this.watchedUsersRegex.get(user);
            return regex.test(message.body);
        });

        if (matchedUsers.length) {
            return this.watchedUsers[matchedUsers[0]].email;
        }

        return null;
    }

}
