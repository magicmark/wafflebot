import commander from 'commander';
import log4js from 'log4js';
import Promise from 'bluebird';
import { Lentil } from 'lentildi';

import getIrcClient from './lib/irc_client.js';
import BigWaffle from './bin/waffle.js';
import Mailer from './lib/mailer.js';
import Meme from './lib/meme.js';
import MessageHandler from './lib/message_handler.js';
import ConfigFilesLoader, { JSONFiles } from './lib/config_files.js';

export default class Wafflebot {

    constructor({
        _getIrcClient = getIrcClient,
        _require = require,
        _commander = commander,
        _log4js = log4js,
        _process = process,
    } = {}) {
        this.getIrcClient = _getIrcClient;
        this.require = _require;
        this.commander = _commander;
        this.log4js = _log4js;
        this.process = _process;

        this.config = null;
        this._setup();
    }

    _setup() {
        const version = this.require('./../package.json').version;
        this.commander.version(version)
            .option(
                '-d, --config-dir [optional]',
                'specify config directory (Default: ~/.wafflebot)'
            )
            .option(
                '-l, --log-level [optional]',
                'specify log level [ALL, DEBUG, INFO, WARN, ERROR, FATAL] (Default: INFO)'
            )
            .option(
                '-w, --waffle',
                'prints a delicious waffle'
            )
            .parse(process.argv);

        if (this.commander.waffle) {
            // eslint-disable-next-line no-console
            console.log(BigWaffle);
            this.process.exit(0);
        }

        if (!this.commander.logLevel) {
            this.commander.logLevel = 'INFO';
        }

        // Logging
        this.logger = this.log4js.getLogger('Wafflebot');
        this.logger.setLevel(commander.logLevel);
        this.logger.info('Initialising Wafflebot...');

        // Initialise
        this.lentil = new Lentil();
        this.lentil
            .provide('logger', this.logger)
            .provide('configDirectory', commander.configDir);
    }

    _initialiseClient() {
        const client = this.getIrcClient({
            server: this.config.irc.server,
            password: this.config.irc.password,
            botname: this.config.botname,
        });

        this.lentil.provide('client', client);
    }

    _commenceWaffling() {
        const messageHandler = this.lentil.create(MessageHandler);

        const configFilesLoader = this.lentil.getInstance(ConfigFilesLoader);
        const client = this.lentil.getProvided('client');

        // Handle incoming messages
        client.addListener('message#', messageHandler.message.bind(messageHandler));
        client.addListener('pm', messageHandler.pm.bind(messageHandler));

        client.addListener('error', (err) => {
            this.logger.error(err);
        });

        client.connect();

        // Auto-join rooms
        client.addListener('registered', () => {
            this.logger.info(`Wafflebot connected to ${this.config.irc.server}`);

            configFilesLoader.getFileJson(JSONFiles.ROOMS).then((roomsJson) => {
                roomsJson.forEach((room) => {
                    this.logger.debug(`Auto joining ${room}`);
                    client.join(room);
                });
            });
        });
    }

    start() {
        const configFilesLoader = this.lentil.create(ConfigFilesLoader);

        return Promise.resolve()
            .then(() => configFilesLoader.directoryReady())
            .then(() => configFilesLoader.filesReady())
            .then(() => configFilesLoader.checkConfigFileSanity())
            .then((config) => {
                this.config = config;

                // Set some lentil deps
                this.lentil
                    .setArgs(Meme, [
                        this.config.imgflip,
                    ])
                    .setArgs(Mailer, [
                        this.config.mail_transport_string,
                    ]);

                this._initialiseClient();
                this._commenceWaffling();
            })
            .catch((err) => {
                this.logger.fatal(`Quitting.\n${err}`);
                this.process.exit(1);
            });
    }

}
