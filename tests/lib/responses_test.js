import 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import Promise from 'bluebird';

import {
    LoggerStub,
    MessageStub,
    fsStub,
} from 'testing/stub_factories.js';

import Responses from 'src/lib/responses.js';

describe('Responses', function () {
    let sandbox;
    let responses;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(Responses.prototype, '_loadResponses');
        responses = new Responses({
            logger: LoggerStub(),
            fs: fsStub(),
        });
    });

    afterEach(function () {
        sandbox.restore();
    });


    it('#_loadResponses should handle responses', function () {
        Responses.prototype._loadResponses.restore();
        sandbox.stub(responses.fs, 'readFileAsync').returns(Promise.resolve('["",""]'));
        sandbox.stub(responses, 'add');

        return Responses.prototype._loadResponses.call(responses).then(() => {
            chai.assert(responses.add.calledTwice, "Correct number of responses were not loaded in");
        });
    });


    describe('#_compileResponseBody compiles response body', function () {

        let message;

        beforeEach(function () {
            message = MessageStub();
        });

        it('should replace parts', function () {
            const compiledResponseBody = responses._compileResponseBody("test {author}", message, []);
            chai.assert.equal(compiledResponseBody, `test ${message.author}`);
        });

        it('should replace numbered parts', function () {
            const compiledResponseBody = responses._compileResponseBody(
                "test {$0} test test {$1}",
                message,
                ['foo', 'bar']
            );

            chai.assert.equal(compiledResponseBody, 'test foo test test bar');
        });
    });


    it('#_getCompiledResponse calls _compileResponseBody', function () {
        const compiledReponse = {};
        sandbox.stub(responses, '_compileResponseBody').returns(compiledReponse);

        chai.assert(responses._getCompiledResponse({body:''}, {}, {}), compiledReponse);
    });


    it('#_getCompiledRegexString compiles regex string for numbered parts', function () {
        const result = responses._getCompiledRegexString({regex: '{$0} blah blah {$1}'});
        chai.assert.match('foo blah blah bar', result);
    });


    it('#add adds the regex object', function () {
        responses.add({
            match: 'foo',
            body: 'bar',
        });

        chai.assert.propertyVa;(responses._responses.get('foo'), 'body', 'bar');
    });

    describe('#maybeGetResponse', function () {
        
        let message;

        beforeEach(function () {
            message = MessageStub();

            responses.add({
                match: 'foo',
                body: 'bar',
            });
        });

        it('returns a response', function () {
            message.body = "foo";
            const response = responses.maybeGetResponse(message);
            chai.assert.equal(response.body, 'bar');
        });

        it('does not return a response', function () {
            message.body = "asdfshakfg";
            const response = responses.maybeGetResponse(message);
            chai.assert.notOk(response)
        });
    });

});
