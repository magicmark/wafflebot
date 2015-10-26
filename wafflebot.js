 "use strict";

/* Dependencies */
var MessageHandler = require('./handlemessage.js');
var connection     = require('./ircconnect.js');

/* Initialise connection vars */
var server, password;
server   = process.env.WBSERVER;
password = process.env.WBPASSWORD;

if (!server || !password) {
    console.log('Pleae provide valid IRC server and password as such:');
    console.log('$ WBSERVER=serverhere WBPASSWORD=passwordhere node wafflebot.js');
    return ;
}

/* Connect to server */
// connection(server, password).then(function (client) {
//   console.log('Succesfully connected to ' + server + '...');
//   startServer(client);
// }, function (err) {
//   console.log('There was an error connecting to ' + server + ':');
//   console.log(err);
// });

var client = connection(server, password);
var handle = new MessageHandler(client);

/* Handle incoming messages */
client.addListener('message', handle.message.bind(handle));
client.addListener('pm', handle.pm.bind(handle));

client.addListener('error', function(err) {
  console.log('Error: ' + err);
});

/* Finally, connect */
client.connect();
