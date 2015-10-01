var irc = require('irc');

var config = {
    userName: 'WaffleBot',
    realName: 'WaffleBot',
    // localAddress: 'kitchen.yelp.com',
    port: 6697,
    password: 'passwordhere',
    channels: ['#wafflebot', '#battleground', '#frontend'],
    autoConnect: true,
    secure: true,
    sasl: false
};


var waffle = [
'        _.-------._      ',
"      .' _|_|_|_|_ '.    ",
'     / _|_|_|_|_|_|_  \\   ',
'    |_|_|_|_|_|_|_|_|_|  ',
'    | |_|_|_|_|_|_|_| |  ',
'     \\ -|_|_|_|_|_|-  /   ',
"      '. -|_|_|_|- .'    ",
'        `---------`      '].join('\n');


// TODO: make the keys regexes and iterate through them
var stockResponses = {
    'i would like a waffle': '{from} would rather like a waffle.',
    'waffle me': waffle
};

var handleStockResponse = function (from, to, message) {
    message = message.toLowerCase();

    var stockResponse = stockResponses[message];
    if (stockResponse) {
        return stockResponse.replace('{from}', from);
    }

};

var handleCustomResponse = function (from, to, message) {
    messagse = message.toLowerCase();

    if (message == 'wafflebot fight marley') {
        client.action(to, 'Commencing battle.');
        setTimeout(function () {
            client.say(to, 'marley i feel the need');
        }, 1250);
        setTimeout(function () {
            client.say(to, 'marley come on and slam');
        }, 2320);
    }

}

var client = new irc.Client('serverhere', 'wafflebot', config);

client.addListener('message', function (from, to, message) {
    response = handleStockResponse(from, to, message);
    if (response) {
        client.say(to, response);
    } else {
        handleCustomResponse(from, to, message);
    }
});

client.addListener('pm', function (from, message) {
    
    if (from.indexOf("mark") == -1) {
        client.say(from, "sorry, you are not a wafflemaster");
        return ;
    }

    if (message.indexOf("join") > -1) {
        var channelToJoin = message.split(' ')[1];
        client.join(channelToJoin);
    }

});

client.addListener('error', function(message) {
    console.log('error: ', message);
});
