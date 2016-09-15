import irc from 'irc';

// TODO: Allow other config settings here
const config = {
    port: 6697,
    autoConnect: false,
    secure: true,
    sasl: false,
};

export default ({ server, password, botname, _irc = irc, }) => {
    config.password = password;
    config.userName = botname;
    config.realName = botname;
    return new _irc.Client(server, botname, config);
};
