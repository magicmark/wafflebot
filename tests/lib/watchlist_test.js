import 'mocha';

import chai from 'chai';
import sinon from 'sinon';
import Promise from 'bluebird';
import WatchList from '../../src/lib/watchlist.js';
import {
    LoggerStub,
    MessageStub,
} from '../../testing/stub_factories.js';

describe('WatchList', function () {
    let sandbox;
    let watchlist;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(WatchList.prototype, '_loadWatchedUsers');
        watchlist = new WatchList({
            logger: LoggerStub(),
        });
    });

    afterEach(function () {
        sandbox.restore();
    });


    describe('#_loadWatchedUsers', function () {
        beforeEach(function () {
            WatchList.prototype._loadWatchedUsers.restore();
            sandbox.stub(watchlist, '_buildRegexCache');
        });

        it('should load users', function () {
            const dummyUsersFileObject = {
                dave: {
                    email: 'dave@reddwarf.com',
                },
            };

            watchlist.configFilesLoader = {
                getFileJson: sandbox.stub().returns(
                    Promise.resolve(dummyUsersFileObject)
                ),
            };

            return WatchList.prototype._loadWatchedUsers.call(watchlist).then(() => {
                chai.assert.deepEqual(watchlist.watchedUsers, dummyUsersFileObject);
                chai.assert(watchlist._buildRegexCache.calledOnce);
            });
        });

        it('should log an error went cannot load users', function () {
            watchlist.configFilesLoader = {
                getFileJson: sandbox.stub().returns(
                    Promise.reject('oops')
                ),
            };

            return WatchList.prototype._loadWatchedUsers.call(watchlist).then(() => {
                chai.assert(watchlist._buildRegexCache.notCalled);
            });
        });
    });

    it('#_getRegexForUser should match a user name in a message correctly', function () {
        const regex = watchlist._getRegexForUser('dave');
        const validMessages = [
            'hello dave',
            'dave',
            'dave hello',
            'dave: hello',
            'hello dave hello',
            'hello dave- hello',
        ];
        const invalidMessage = [
            'daveaskdjh',
            'asdkajdave',
            'asdaddaveasdas',
        ];

        validMessages.forEach(message => {
            chai.assert.isOk(regex.test(message), `Expected "${message}" to match`);
        });

        invalidMessage.forEach(message => {
            chai.assert.isNotOk(regex.test(message), `Expected "${message}" not to match`);
        });
    });


    it('#_buildRegexCache should bulid regex cache of users', function () {
        watchlist.watchedUsers = {
            dave: {
                email: 'dave@jmc.com',
            },
            rimmer: {
                email: 'rimmer@jmc.com',
            },
        };
        sandbox.stub(watchlist, '_getRegexForUser').returns();

        watchlist._buildRegexCache();

        chai.assert(watchlist.watchedUsersRegex.has('dave'));
        chai.assert.equal(watchlist.watchedUsersRegex.size, 2);
    });


    describe('#subscribe', function () {
        it('should reject with an invalid email', function () {
            return watchlist.subscribe('dave', 'asdfhkgasf').catch(err => {
                chai.assert(err);
            });
        });

        it('should save user with a valid email', function () {
            sandbox.stub(watchlist, '_buildRegexCache');
            watchlist.configFilesLoader = {
                writeFileJson: sandbox.stub().returns(Promise.resolve()),
            };

            return watchlist.subscribe('dave', 'dave@jmc.com').then(() => {
                chai.assert(watchlist._buildRegexCache.calledOnce);
                chai.assert.equal(watchlist.watchedUsers.dave.email, 'dave@jmc.com');
            });
        });
    });


    it('#unsubscribe should remove a user', function () {
        sandbox.stub(watchlist, '_buildRegexCache');
        watchlist.watchedUsers = {
            dave: {
                email: 'dave@jmc.com',
            },
        };

        watchlist.configFilesLoader = {
            writeFileJson: sandbox.stub().returns(Promise.resolve()),
        };

        return watchlist.unsubscribe('dave').then(() => {
            chai.assert(watchlist._buildRegexCache.calledOnce);
            chai.assert.isNotOk(watchlist.watchedUsers.dave);
        });
    });


    describe('#checkMessage', function () {
        let dummyMessage;

        beforeEach(function () {
            dummyMessage = MessageStub();
            watchlist.mailer = { send: sandbox.stub(), };
        });

        it('should do nothing when message is not matchied', function () {
            sandbox.stub(watchlist, '_maybeGetEmail').returns(null);

            watchlist.checkMessage(dummyMessage);

            chai.assert(watchlist.mailer.send.notCalled);
        });

        it('should send an email when message is matched', function () {
            const dummyEmail = 'dave@jmc.com';
            sandbox.stub(watchlist, '_maybeGetEmail')
                .withArgs(dummyMessage)
                .returns(dummyEmail);

            watchlist.checkMessage(dummyMessage);

            chai.assert(watchlist.mailer.send.calledWith(dummyEmail, dummyMessage));
        });
    });

    describe('#_maybeGetEmail', function () {
        let dummyMessage;

        beforeEach(function () {
            dummyMessage = MessageStub();
            watchlist.watchedUsers = { dave: { email: 'dave@jmc.com', }, };
        });

        it('should return an email for a matched message', function () {
            watchlist.watchedUsersRegex = {
                get: sandbox.stub().returns({
                    test: sandbox.stub().returns(true),
                }),
            };

            chai.assert.equal(watchlist._maybeGetEmail(dummyMessage), 'dave@jmc.com');
        });

        it('should not return an email for an unmatched message', function () {
            watchlist.watchedUsersRegex = {
                get: sandbox.stub().returns({
                    test: sandbox.stub().returns(false),
                }),
            };

            chai.assert.isNotOk(watchlist._maybeGetEmail(dummyMessage));
        });
    });
});
