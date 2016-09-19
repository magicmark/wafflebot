import 'mocha';

import chai from 'chai';
import sinon from 'sinon';
import ConfigFilesLoader, { JSONFiles, } from '../../src/lib/config_files.js';

import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import Promise from 'bluebird';
import {
    LoggerStub,
} from '../../testing/stub_factories.js';

describe('Config Files Loader', function () {
    let configFilesLoader;
    let sandbox;
    let dummyMessage;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        sandbox.stub(ConfigFilesLoader.prototype, '_parseConfigDir');
        configFilesLoader = new ConfigFilesLoader('test/dir', {
            logger: LoggerStub(),
            process: {},
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('constructor should initialise correctly', function () {
        chai.assert.equal('test/dir', configFilesLoader._configDir);
        chai.assert(configFilesLoader._parseConfigDir.calledOnce);
    });

    describe('#_parseConfigDir', function () {
        beforeEach(function () {
            ConfigFilesLoader.prototype._parseConfigDir.restore();
        });

        it('should resolve with home directory', function () {
            configFilesLoader._configDir = '';
            configFilesLoader.os.homedir = sandbox.stub().returns('/home');

            ConfigFilesLoader.prototype._parseConfigDir.call(configFilesLoader);

            chai.assert.isTrue(configFilesLoader.canCreateDir);
            chai.assert.equal(configFilesLoader.resolvedConfigDirectory, '/home/.wafflebot');
        });

        it('should resolve with relative path', function () {
            configFilesLoader._configDir = 'relative/path';
            configFilesLoader.process.cwd = sandbox.stub().returns('/current/cwd');

            ConfigFilesLoader.prototype._parseConfigDir.call(configFilesLoader);

            chai.assert.equal(configFilesLoader.resolvedConfigDirectory, '/current/cwd/relative/path');
        });


        it('should resolve with absolute path', function () {
            configFilesLoader._configDir = '/absolute/path';

            ConfigFilesLoader.prototype._parseConfigDir.call(configFilesLoader);

            chai.assert.equal(configFilesLoader.resolvedConfigDirectory, '/absolute/path');
        });
    });

    describe('#_checkConfigDirExists', function () {
        beforeEach(function () {
            configFilesLoader.fs.statAsync = sandbox.stub();
        });

        it('should throw error if directory is not directory', function () {
            configFilesLoader.fs.statAsync.returns(Promise.resolve({
                isDirectory: sandbox.stub().returns(false),
            }));

            return chai.assert.isRejected(configFilesLoader._checkConfigDirExists());
        });

        it('should not throw error if directory exists', function () {
            configFilesLoader.fs.statAsync.returns(Promise.resolve({
                isDirectory: sandbox.stub().returns(true),
            }));

            return chai.assert.isFulfilled(configFilesLoader._checkConfigDirExists());
        });
    });
});
