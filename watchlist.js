"use strict";

const fs           = require('fs');
const file_actions = require('./file_actions');


class WatchList {

  /**
   * Creates a WatchList, to check all incoming messages to see if we need to notify anyone
   */
  constructor () {
    fs.readFile(file_actions.WATCH_USERS, 'utf8', (err, data) => {
      if (err) {
        console.log('There was an error reading: ' + file_actions.WATCH_USERS);
        console.log(err);
        throw err;
        return ;
      }

      this.users = JSON.parse(data);
    });
  }

  /**
   * Creates a subscription in WatchList
   *
   * @param  {String} user  Username to watch for
   * @param  {String} email Email address to send to
   *
   * @return {Promise} Promise containing the result of permanently storing the subscription
   */
  subscribe (user, email) {
    this.users[user] = {
      email: email
    };

    return file_actions.add_user_watch(user, email);
  }


  /**
   * Method to check a message for all users that we need to listen for
   * @param  {String} message The message text
   *
   * @return {String|null} If the message matched someone's username, return their email address.
   */
  check (message) {
    // TODO: factor this regex out into a small testable function
    for (let user in this.users) {
      if (RegExp('(^| +)' + user, 'ig').test(message)) {
        return this.users[user].email;
      }
    }
  }

}

module.exports = WatchList;
