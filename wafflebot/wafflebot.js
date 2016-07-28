import Promise from 'bluebird';
import commander from 'commander';
import log4js from 'log4js';

import ActionHandler from './lib/action_handler.js';
import WatchList from './lib/watchlist';
import Meme from './lib/meme.js';
import Mailer from './lib/mailer.js';
import MessageHandler from './lib/message_handler.js';
import Responses from './lib/responses.js';
import getIrcClient from './lib/ircconnect.js';
import FileActions from './lib/file_actions.js';
import ConfigFilesLoader, { JSONFiles } from './lib/config_files.js';
import WAFFLE from './lib/waffle.js';

export default class Wafflebot {

    constructor ({
        _ActionHandler = ActionHandler,
        _ConfigFilesLoader = ConfigFilesLoader,
        _FileActions = FileActions,
        _Mailer = Mailer,
        _Meme = Meme,
        _MessageHandler = MessageHandler,
        _Responses = Responses,
        _WatchList = WatchList,
        _WAFFLE = WAFFLE,
        _getIrcClient = getIrcClient,
        _require = require,
        _commander = commander,
        _log4js = log4js,
        _process = process,
    } = {}) {
        this.ActionHandler = _ActionHandler;
        this.ConfigFilesLoader = _ConfigFilesLoader;
        this.FileActions = _FileActions;
        this.Mailer = _Mailer;
        this.Meme = _Meme;
        this.MessageHandler = _MessageHandler;
        this.Responses = _Responses;
        this.WatchList = _WatchList;
        this.WAFFLE = _WAFFLE;
        this.getIrcClient = _getIrcClient;
        this.require = _require;
        this.commander = _commander;
        this.log4js = _log4js;
        this.process = _process;

        this.config = null; 
        this._setup();
    }

    _setup () {
        const version = this.require('./../package.json').version;
        this.commander.version(version)
            .option('-d, --config-dir [optional]', 'specify config directory (Default: ~/.wafflebot)')
            .option('-l, --log-level [optional]', 'specify log level [ALL, DEBUG, INFO, WARN, ERROR, FATAL] (Default: INFO)')
            .option('-w, --waffle', 'prints a delicious waffle')
            .parse(process.argv);

        if (this.commander.waffle) {
            console.log(WAFFLE);
            this.process.exit(0);
        }

        if (!this.commander.logLevel) {
            this.commander.logLevel = 'INFO';
        }

        this.logger = this.log4js.getLogger('Wafflebot');
        this.logger.setLevel(commander.logLevel);
        this.logger.info('Initialising Wafflebot...');

        this.configFilesLoader = new this.ConfigFilesLoader({
            configDirectory: commander.configDir,
            logger: this.logger,
        });
    }

    _wireDependencies () {
        // This method makes me very sad :(

        // Set up dependencies + wire together.
        // TODO(magicmark): Investigate better ways of doing this
        this.responses = new this.Responses({
            configFilesLoader: this.configFilesLoader,
            logger: this.logger,
        });

        this.meme = new this.Meme({
            auth: this.config.imgflip,
            logger: this.logger,
        });

        this.mailer = new this.Mailer({
            mail_transport_string: this.config.mail_transport_string,
            logger: this.logger,
        });

        this.client = this.getIrcClient({
            server: this.config.irc.server,
            password: this.config.irc.password,
            botname: this.config.botname,
        });

        this.watchlist = {};///new WatchList();

        this.actionhandler = new this.ActionHandler({
            client: this.client,
            watchlist: this.watchlist,
            meme: this.meme,
            responses: this.responses,
            configFilesLoader: this.configFilesLoader,
            logger: this.logger,
        });

        this.messageHandler = new this.MessageHandler({
            client: this.client,
            mailer: this.mailer,
            meme: this.meme,
            logger: this.logger,
            watchlist: this.watchlist,
            actionhandler: this.actionhandler,
        });
    }

    _commenceWaffling () {
        // Handle incoming messages
        this.client.addListener('message#', this.messageHandler.message.bind(this.messageHandler));
        this.client.addListener('pm', this.messageHandler.pm.bind(this.messageHandler));

        this.client.addListener('error', err => {
            this.logger.error(err);
        });

        this.client.connect();

        // Auto-join rooms
        this.client.addListener('registered', (err) => {
            this.logger.info(`Wafflebot connected to IRC`);

            this.configFilesLoader.getFileJson(JSONFiles.ROOMS).then(roomsJson => {
                roomsJson.forEach(room => {
                    this.logger.debug(`Auto joining ${room}`);
                    this.client.join(room);
                });
            });
        });
    }

    start () {
        return Promise.resolve()
            .then(() => this.configFilesLoader.directoryReady())
            .then(() => this.configFilesLoader.filesReady())
            .then(() => this.configFilesLoader.checkConfigFileSanity())
            .then(config => {
                this.config = config;
            })
            .catch(err => {
                this.logger.fatal(`Quitting.\n${err}`);
                this.process.exit(1);
            })
            .then(() => {
                this._wireDependencies();
                this._commenceWaffling();
            });

    }

}
