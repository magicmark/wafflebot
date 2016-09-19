import Promise from 'bluebird';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { LentilBase, LentilDep, } from 'lentildi';

Promise.promisifyAll(fs);

/**
 * Enum types for json files
 */
export const JSONFiles = {
    WATCH_USERS: Symbol('WATCH_USERS'),
    ROOMS: Symbol('ROOMS'),
    CONFIG: Symbol('CONFIG'),
};

export const ConfigFileMap = {
    [JSONFiles.WATCH_USERS]: 'watched_users.json',
    [JSONFiles.ROOMS]: 'rooms.json',
    [JSONFiles.CONFIG]: 'config.json',
};

export default class ConfigFilesLoader extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps() {
        return {
            logger: LentilDep.Provided('logger'),
            fs,
            os,
            path,
            process,
        };
    }

    constructor(configDirectory, ...args) {
        super(...args);

        this._configDir = configDirectory;
        this.canCreateDir = false;
        this.resolvedConfigDirectory = null;

        this._parseConfigDir();
    }

    /**
     * Turns the (possibly) relative path passed into the constructor into an absolute path
     */
    _parseConfigDir() {
        // We will be cautious and won't auto-make any directories other than ~/.wafflebot.
        // TODO: Possibly change this behaviour

        if (!this._configDir) {
            this.resolvedConfigDirectory = this.path.join(this.os.homedir(), '.wafflebot');
            this.canCreateDir = true;
        } else if (!this.path.isAbsolute(this._configDir)) {
            this.resolvedConfigDirectory = this.path.join(this.process.cwd(), this._configDir);
        } else {
            this.resolvedConfigDirectory = this._configDir;
        }

        this.logger.debug(`Resolved config dir as ${this.resolvedConfigDirectory}.`);
    }

    /**
     * Checks if the config directory exists
     *
     * @return {Promise} Promise containing result of directory check
     */
    _checkConfigDirExists() {
        return this.fs.statAsync(this.resolvedConfigDirectory).then(stats => {
            if (!stats.isDirectory()) {
                this.logger.warn(`${this.resolvedConfigDirectory} exists, but it is not a directory.`);
                throw new Error();
            }
        });
    }

    /**
     * Checks to see if a file exists. If not, it will attempt to create it with some dummy data.
     *
     * @param  {string} filePath - Relative path to file
     * @param  {string} defaultContent - Dummy content to fill file with of required.
     * @return {Promise} Promise containing result of file read/write
     */
    _ensureFileExists(filePath, defaultContent) {
        const fullFilePath = this.path.join(this.resolvedConfigDirectory, filePath);

        return this.fs.statAsync(fullFilePath).then(stats => {
            if (!stats.isFile()) {
                this.logger.warn(`${fullFilePath} is not a file. Attempting to write it.`);
                throw new Error();
            }

            this.logger.debug(`${fullFilePath} appears to exist; moving on`);
        })
            .catch(err => {
                this.logger.debug(`Creating ${fullFilePath} with default data`);
                return this.fs.writeFileAsync(fullFilePath, defaultContent);
            }).catch(err => {
                throw new Error(`Could not write to ${fullFilePath} - ${err}`);
            });
    }

    /**
     * Reads the specified file
     *
     * @param  {JSONFiles} jsonFile - The file enum
     * @return {Promise} Promise containing the file
     */
    getFileJson(jsonFile) {
        const fullFilePath = this.path.join(this.resolvedConfigDirectory, ConfigFileMap[jsonFile]);

        this.logger.debug(`Reading ${fullFilePath}`);
        return this.fs.readFileAsync(fullFilePath, 'utf8').then(fileData => {
            return JSON.parse(fileData);
        });
    }

    /**
     * Writes the given json to the given file
     *
     * @param  {JSONFiles} jsonFile - The file enum
     * @param  {object} jsonData - The file json
     * @return {Promise} Promise containing the write result
     */
    writeFileJson(jsonFile, jsonData) {
        const fullFilePath = this.path.join(this.resolvedConfigDirectory, ConfigFileMap[jsonFile]);
        const fileString = JSON.stringify(jsonData, null, 2);

        this.logger.debug(`Writing to ${fullFilePath}`);
        return this.fs.writeFileAsync(fullFilePath, fileString, 'utf8');
    }

    /**
     * Checks to see if directory is present - if not and is creatable, do so.
     * If we can't create the directory (user specified), reject Promise.
     *
     * @return {Promise} Promise that returns when directory is available.
     */
    directoryReady() {
        return this._checkConfigDirExists().catch(() => {
            if (this.canCreateDir) {
                this.logger.debug(`Creating ${this.resolvedConfigDirectory}.`);
                return this.fs.mkdirAsync(this.resolvedConfigDirectory);
            } else {
                throw new Error(`${this.resolvedConfigDirectory} is not a directory that exists.\nIf this is your first time running wafflebot, please create it and ensure it is readable/writable.`);
            }
        });
    }

    /**
     * Checks to ensure all config files are present.
     *
     * @return {Promise} Promise that returns when all config files are ready.
     */
    filesReady() {
        const exampleConfigPath = this.path.join(__dirname, '../config.example.json');

        return this.fs.readFileAsync(exampleConfigPath).then(exampleConfig => {
            return Promise.join(
                this._ensureFileExists(ConfigFileMap[JSONFiles.ROOMS], '[]'),
                this._ensureFileExists(ConfigFileMap[JSONFiles.WATCH_USERS], '{}'),
                this._ensureFileExists(ConfigFileMap[JSONFiles.CONFIG], exampleConfig)
            );
        });
    }

    /**
     * A quick check to see if config files are valid / haven't been set yet
     *
     * @return {Promise} Promise containing result of sanity check
     */
    checkConfigFileSanity() {
        this.logger.debug('Checking the config files');

        return this.getFileJson(JSONFiles.CONFIG).then(configJson => {
            // TODO: Improve this check to validate all config files before they have a chance to crash in prod

            if (!configJson || !configJson.irc || configJson.irc.server == 'irc.example.com') {
                this.logger.debug('Config file has not been configured');

                const errorMessage = [
                    'Hey there! It looks like this is the first time you\'re running Wafflebot.',
                    `That's great! Please configure ${configFilePath} to set me up :)`,
                ].join('\n');

                throw new Error(errorMessage);
            }

            if (!configJson.mail_transport_string) {
                throw new Error('mail_transport_string required for email');
            }

            return configJson;
        });
    }

}
