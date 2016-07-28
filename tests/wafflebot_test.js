import 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import Promise from 'bluebird';

import {
    LoggerStub,
    RequestStub,
    AuthStub,
} from 'testing/stub_factories.js';


describe('Wafflebot', function () {
    let meme;
    let sandbox;

    beforeEach(function () {
        // meme = new Meme(AuthStub, LoggerStub, RequestStub);
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('sdf', function () {
    });
});
