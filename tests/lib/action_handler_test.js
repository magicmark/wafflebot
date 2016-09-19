import 'mocha';

import chai from 'chai';
import sinon from 'sinon';
import Promise from 'bluebird';

import ActionHandler from '../../src/lib/action_handler.js';
import {
    LoggerStub,
    MessageStub,
    ConfigFilesLoaderStub,
} from '../../testing/stub_factories.js';

describe('Action Handler', function () {
    let actionHandler;
    let sandbox;
    let dummyMessage;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        actionHandler = new ActionHandler({
            configFilesLoader: ConfigFilesLoaderStub(),
            client: {},
            logger: LoggerStub(),
        });

        actionHandler.client.say = sandbox.stub();
        dummyMessage = MessageStub();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#_checkRoomGuard', function () {
        beforeEach(function () {
            dummyMessage.isPrivateMessage = true;
        });

        it('return should be true if not private message', function () {
            dummyMessage.isPrivateMessage = false;
            chai.assert.isTrue(actionHandler._checkRoomGuard(dummyMessage));
        });

        it('return should be false if no response arg', function () {
            chai.assert.isFalse(actionHandler._checkRoomGuard(dummyMessage));
        });

        it('return should be true if response arg but no room guard', function () {
            chai.assert.isTrue(actionHandler._checkRoomGuard(dummyMessage, {}));
        });

        it('return should be false if response arg and room guard', function () {
            chai.assert.isFalse(actionHandler._checkRoomGuard(dummyMessage, { roomGuard: true }));
        });
    });


    describe('#joinRoom', function () {
        beforeEach(function () {
            actionHandler.client.join = sandbox.stub();
            actionHandler.configFilesLoader.getFileJson = sandbox.stub().returns(
                Promise.resolve([])
            );
        });

        it('should not join room with invalid room name', function () {
            return actionHandler.joinRoom(dummyMessage, 'asdsf').catch(() => {
                chai.assert(actionHandler.client.join.notCalled);
            });
        });

        it('should join room with valid room name', function () {
            actionHandler.configFilesLoader.writeFileJson = sandbox.stub().returns(
                Promise.resolve()
            );

            return actionHandler.joinRoom(dummyMessage, '#test123').then(() => {
                chai.assert(actionHandler.client.join.calledWith('#test123'));
            });
        });
    });


    describe('#fightMarley', function () {
        it('should do nothing not in a room', function () {
            actionHandler._checkRoomGuard = sandbox.stub().returns(false);
            return actionHandler.fightMarley(dummyMessage).catch(() => {
                chai.assert(true);
            });
        });

        it.skip(
            'TODO: Add fake timers to reenable test',
            'should fight marley in a room',
            function () {
                actionHandler._checkRoomGuard = sandbox.stub().returns(true);
                actionHandler.client = {
                    say: sandbox.stub(),
                    action: sandbox.stub(),
                };

                return actionHandler.fightMarley(dummyMessage).then(() => {
                    chai.assert(actionHandler.client.action.calledOnce);
                    chai.assert(actionHandler.client.say.calledTwice);
                });
            });
    });


    describe('#handleOther', function () {
        beforeEach(function () {
            actionHandler._checkRoomGuard = sandbox.stub().returns(true);
            actionHandler._checkPrefixGuard = sandbox.stub().returns(true);
            actionHandler.responses = {
                maybeGetResponse: sandbox.stub(),
            };
        });

        it('should do nothing with no response', function () {
            chai.assert.isFalse(actionHandler.handleOther(dummyMessage));
        });

        it('should do nothing with a room guard', function () {
            actionHandler._checkRoomGuard.returns(false);
            actionHandler.responses.maybeGetResponse.returns({});

            chai.assert.isFalse(actionHandler.handleOther(dummyMessage));
        });

        it('should do nothing with a prefix guard', function () {
            actionHandler._checkPrefixGuard.returns(false);
            actionHandler.responses.maybeGetResponse.returns({});

            chai.assert.isFalse(actionHandler.handleOther(dummyMessage));
        });

        it('should respond to user', function () {
            dummyMessage.isPrivateMessage = true;
            actionHandler.client = { say: sandbox.stub() };
            actionHandler.responses.maybeGetResponse.returns({
                body: 'what a great test message',
                delay: 0,
            });

            return actionHandler.handleOther(dummyMessage).finally(() => {
                chai.assert(actionHandler.client.say.calledWith(
                    dummyMessage.author,
                    'what a great test message'
                ));
            });
        });

        it('should respond to user', function () {
            actionHandler.client = { say: sandbox.stub() };
            actionHandler.responses.maybeGetResponse.returns({
                body: 'what a great test message',
                delay: 0,
            });

            return actionHandler.handleOther(dummyMessage).finally(() => {
                chai.assert(actionHandler.client.say.calledWith(
                    dummyMessage.channel,
                    'what a great test message'
                ));
            });
        });
    });

    describe('#notifications', function () {
        it('should do nothing with a public message', function () {
            dummyMessage.isPrivateMessage = false;

            chai.assert.isFalse(actionHandler.notifications(dummyMessage));

            chai.assert.include(actionHandler.client.say.args[0][1], 'to set up notifications');
        });

        it('should set up subscription successfully', function () {
            dummyMessage.isPrivateMessage = true;
            dummyMessage.parts = 'notify subscribe test@test.com'.split(' ');
            actionHandler.watchlist.subscribe = sandbox.stub().returns(Promise.resolve());

            return actionHandler.notifications(dummyMessage).finally(() => {
                chai.assert(actionHandler.watchlist.subscribe.calledWith(
                    dummyMessage.author,
                    'test@test.com'
                ));
                chai.assert(actionHandler.client.say.calledOnce);
            });
        });

        it('should unsubscribe successfully', function () {
            dummyMessage.isPrivateMessage = true;
            dummyMessage.parts = 'notify unsubscribe test@test.com'.split(' ');
            actionHandler.watchlist.unsubscribe = sandbox.stub().returns(Promise.resolve());

            return actionHandler.notifications(dummyMessage).finally(() => {
                chai.assert(actionHandler.watchlist.unsubscribe.calledWith(dummyMessage.author));
                chai.assert(actionHandler.client.say.calledOnce);
            });
        });

        it('should set handle failure', function () {
            dummyMessage.isPrivateMessage = true;
            dummyMessage.parts = 'notify subscribe test@test.com'.split(' ');
            actionHandler.watchlist.subscribe = sandbox.stub().returns(Promise.reject('error'));

            return actionHandler.notifications(dummyMessage).finally(() => {
                chai.assert.include(actionHandler.client.say.args[0][1], 'error');
            });
        });
    });

    it('#makeMeme should make a meme', function () {
        actionHandler.meme.create = sandbox.stub().returns(Promise.resolve('url'));

        return actionHandler.makeMeme(dummyMessage).finally(function () {
            chai.assert(actionHandler.meme.create.calledWith(dummyMessage.body));
            chai.assert(actionHandler.client.say.calledWith('#bbcthree', 'isaac asimov: url'));
        });
    });
});
