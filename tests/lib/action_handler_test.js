import 'mocha';

import chai from 'chai';
import sinon from 'sinon';
import Message from 'src/lib/message.js';
import ActionHandler from 'src/lib/action_handler.js';
import Promise from 'bluebird';
import {
    LoggerStub,
    MessageStub,
} from 'testing/stub_factories.js';

describe('Action Handler', function () {
    let actionHandler;
    let sandbox;
    let dummyMessage;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        actionHandler = new ActionHandler({
            client: {},
            watchlist: {},
            meme: {},
            responses: {},
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

        it('should return be true if not private message', function () {
            dummyMessage.isPrivateMessage = false;
            chai.assert.isTrue(actionHandler._checkRoomGuard(dummyMessage));
            chai.assert(actionHandler.client.say.notCalled);
        });

        it('should return be false if no response arg', function () {
            chai.assert.isFalse(actionHandler._checkRoomGuard(dummyMessage));
            chai.assert(actionHandler.client.say.calledOnce);
        });

        it('should return be true if response arg but no room guard', function () {
            chai.assert.isTrue(actionHandler._checkRoomGuard(dummyMessage, {}));
        });

        it('should return be false if response arg and room guard', function () {
            chai.assert.isFalse(actionHandler._checkRoomGuard(dummyMessage, { roomGuard: true }));
        });

    });


    describe('#joinRoom', function () {

        beforeEach(function () {
            actionHandler.client.join = sandbox.stub();
        })

        it('should not join room with invalid room name', function () {
            actionHandler.joinRoom(dummyMessage, 'asdsf');
            chai.assert(actionHandler.client.join.notCalled);
        });

        it.skip('should join room with valid room name', function () {
            return actionHandler.joinRoom(dummyMessage, '#test123').finally(() => {
                chai.assert(actionHandler.client.join.calledWith('#test123'));
                chai.assert(false)
            });
        });
    });

    describe('#handleOther', function () {
        
        beforeEach(function () {
            actionHandler._checkRoomGuard = sandbox.stub().returns(true);
            actionHandler.responses = {
                maybeGetResponse: sandbox.stub()
            };
        });

        it('should do nothing with no response', function () {
            chai.assert.isFalse(actionHandler.handleOther(dummyMessage));
        });

        it('should do nothing with a room guard', function () {
            actionHandler._checkRoomGuard.returns(false);
            actionHandler.responses.maybeGetResponse.returns({});
            dummyMessage.isPrivateMessage = true;

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

        it('should set up subscription', function () {
            dummyMessage.isPrivateMessage = true;
            dummyMessage.parts = 'notify subscribe test@test.com'.split(' ');
            actionHandler.watchlist.subscribe = sandbox.stub().returns(Promise.resolve());

            return actionHandler.notifications(dummyMessage).finally(() => {
                chai.assert(actionHandler.watchlist.subscribe.calledWith('isaac asimov', 'test@test.com'));
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
