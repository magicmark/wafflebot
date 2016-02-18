"use strict";

const nodemailer = require('nodemailer');
const moment     = require('moment');

class Mailer {

  /**
   * Constructs a Mailer object
   *
   * @param  {String} mail_transport_string The smtp connection to gmail to send out emails
   */
  constructor (mail_transport_string) {
	  this.transporter = nodemailer.createTransport(mail_transport_string);
  }

  /**
   * Sends an email
   *
   * @param  {String} to             Email address to send notification to
   * @param  {String} channel        The IRC Channel the user was mentioned in
   * @param  {String} message        The message 
   * @param  {[type]} message_author The author of the message
   */
  send (to, channel, message, message_author) {

  	let time_now = moment().format(`dddd MMMM Do, [a]t h:mma`);
  	let message_string = `\
You were mentioned in ${channel} on ${time_now}

${message_author} said:

${message}

--
Sent to you by Wafflebot. Here is a horse 🐴`;

  	let mailOptions = {
  	  from: 'Wafflebot <markl+wafflebot@yelp.com>',
  	  to: to,
  	  subject: `💬 IRC Notification | ${channel} 💬`,
  	  text: message_string,
  	  replyTo: `${message_author}@yelp.com`,
  	  priority: 'high'
  	};

  	this.transporter.sendMail(mailOptions, (error, info) => {
  	  if(error){
  	    return console.log(error);
  	  }
  	  console.log('Message sent: ' + info.response);
  	});

  }

}

module.exports = Mailer;
