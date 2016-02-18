"use strict";

/* Dependencies */
const MessageHandler = require('./handlemessage.js');
const Mailer         = require('./mailer.js');
const connection     = require('./ircconnect.js');
const file_actions   = require('./file_actions');
const fs             = require('fs');

const config = require('./config.json')

if (!config.irc_server || !config.irc_server_password || !config.mail_transport_string) {
  console.log('Please ensure a valid config.json');
  return ;
}

const client = connection(config.irc_server, config.irc_server_password);
const mailer = new Mailer(config.mail_transport_string);
const handle = new MessageHandler(client, mailer);

/* Handle incoming messages */
client.addListener('message#', handle.message.bind(handle));
client.addListener('pm', handle.pm.bind(handle));

client.addListener('error', function(err) {
  console.log('Error: ' , err);
});

/* Finally, connect */
client.connect();


// ============================
// Auto-join rooms
// ============================

client.addListener('registered', (err) => {
  const rooms = require('./rooms.json')
  rooms.forEach((room) => {
    client.join(room);
  });
});