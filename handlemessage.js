 "use strict";

const ActionHandler = require('./actionhandler.js');
const WatchList     = require('./watchlist');

class MessageHandler {

  /**
   * Constructor for MessageHandler
   *
   * @param  {Client} client The Client object created by irc.Client
   * @param  {Mailer} mailer The Mailer class to send out emails
   */
  constructor (client, mailer) {
    this.client    = client;
    this.mailer    = mailer;

    this.watchlist = new WatchList();
    this.actions   = new ActionHandler(client, this.watchlist);
  };

  /**
   * Takes a raw message and checks if wafflebot should do stuff about it
   *
   * @param   {String}  from    The username of the message author
   * @param   {String}  message Some text about some stuff
   * @param   {String}  room    The IRC room the message was sent from
   *                            (empty string if it was a PM to wafflebot)
   * @param   {Boolean} prefix  Was the message formally addressed to wafflebot?
   *                            (eg: 'wafflebot waffle me' vs 'waffle me')
   *
   * @private
   */
  _handle_message (from, message, room, prefix) {
    var command, msg_parts;

    message   = message.trim().replace(/(\s){2,}/g, ' ').toLowerCase();
    msg_parts = message.split(' ');
    command   = msg_parts[0];

    // ============================
    // Handle Commands
    // ============================

    if (command === 'wafflebot') {
      msg_parts.shift();
      this._handle_message(from, msg_parts.join(' '), room, true);
      return ;
    }

    if (command === 'join' && msg_parts[1] && prefix) {
      this.actions.join_room(from, msg_parts[1]);
      return ;
    }

    if (command === 'fight' && msg_parts[1] === 'marley') {
      this.actions.fight_marley(from, room);
      return ;
    }

    if (command === 'notify' && prefix) {
      this.actions.notifications(from, message, room);
      return ;
    }

    // ============================
    // Handle Stock Responses
    // ============================
    
    this.actions.handle_other(from, message, room);

  };

  /**
   * Handles IRC messages to a channel
   *
   * @param  {String} from    The username of the message author
   * @param  {String} room    Channel name
   * @param  {String} message The text of the message
   */
  message (from, room, message) {
    // Check if the message contained the name of a user we're watching
    let email_address = this.watchlist.check(message);
    if (email_address) {
      this.mailer.send(email_address, room, message, from);
    }

    // TODO: Investigate why message might not be a string from time to time
    message = message || '';
    this._handle_message(from, message, room, false);
  };

  /**
   * Handles IRC messages PM'd to wafflebot
   *
   * @param  {String} from    The username of the message author
   * @param  {String} message Channel name
   */
  pm (from, message) {  
    this._handle_message(from, message, null, true);
  };

}

module.exports = MessageHandler;
