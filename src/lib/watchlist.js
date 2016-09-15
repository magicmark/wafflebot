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
    static lentilDeps () {
        return {
            mailer: Mailer,
            configFilesLoader: ConfigFilesLoader,
            logger: LentilDep.Provided('logger'),
        }
    }

  /**
   * Creates a subscription in WatchList
   *
   * @param  {String} user  Username to watch for
   * @param  {String} email Email address to send to
   *
   * @return {Promise} Promise containing the result of permanently storing the subscription
   */
    subscribe(user, email) {
        this.users[user] = {
            email,
        };

        return file_actions.add_user_watch(user, email);
    }


    checkMessage (message) {
        // Check if the message contained the name of a user we're watching
        const emailAddress = this.watchlist.check(message);
        if (emailAddress) {
            this.mailer.send(emailAddress, message);
        }


    }


  /**
   * Method to check a message for all users that we need to listen for
   * @param  {String} message The message text
   *
   * @return {String|null} If the message matched someone's username, return their email address.
   */
    _check(message) {
      // TODO: factor this regex out into a small testable function
        for (const user in this.users) {
            if (RegExp('(^| +)' + user, 'ig').test(message)) {
                return this.users[user].email;
            }
        }
    }

}