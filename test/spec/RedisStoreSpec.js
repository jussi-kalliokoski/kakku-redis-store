"use strict";

var { RedisStore } = require("../..");

function RedisMock () {
    function redisDelegate (predicate) {
        var fn = sinon.spy(function () {
            var args = [].slice.call(arguments);
            var callback = args[args.length - 1];
            var error = fn.nextError;
            fn.nextError = null;
            process.nextTick(() => {
                if ( error ) { return callback(error); }
                return predicate.apply(this, args);
            });
        });

        return fn;
    }

    return {
        data: new Map(),

        get: redisDelegate(function (key, callback) {
            if ( this.data.has(key) ) {
                callback(null, this.data.get(key));
            } else {
                callback(null, null);
            }
        }),

        set: redisDelegate(function (key, value, callback) {
            this.data.set(key, value);
            callback(null);
        }),
    };
};

describe("RedisStore", function () {
    var client;
    var store;
    var result;

    beforeEach(function () {
        client = new RedisMock();
        store = new RedisStore({ client });
    });

    describe("when initialized without a client", function () {
        var error;

        beforeEach(function () {
            try {
                new RedisStore({});
            } catch (err) {
                error = err;
            }
        });

        it("should throw an error", function () {
            error.should.be.an.instanceOf(Error);
        });
    });

    describe(".set()", function () {
        beforeEach(function () {
            return store.set("foo", {
                data: { bar: "meow" },
                ttl: 1000,
            }).then(function () {
                result = JSON.parse(client.data.get("foo"));
            });
        });

        it("should assign expires", function () {
            result.expires.should.be.at.least(Date.now());
            result.expires.should.be.at.most(Date.now() + 1000);
        });

        it("should put in the correct data", function () {
            result.data.bar.should.equal("meow");
        });

        describe("when it errors", function () {
            var error;

            beforeEach(function () {
                client.set.nextError = new Error("testing");
                return store.set("foo", {
                    data: { bar: "meow" },
                    ttl: 1000,
                }).then(function (error) {
                    throw new Error("it should have thrown");
                }).catch(function (err) {
                    error = err;
                });
            });

            it("should return the error as a promise", function () {
                error.message.should.equal("testing");
            });
        });
    });

    describe(".get()", function () {
        describe("when there is data", function () {
            beforeEach(function () {
                client.data.set("foo", JSON.stringify({
                    data: { bar: "meow" },
                    expires: Date.now() + 1000,
                }));

                return store.get("foo").then(function (data) {
                    result = data;
                });
            });

            it("should return the correct data", function () {
                result.data.bar.should.equal("meow");
            });

            it("should return a ttl", function () {
                result.ttl.should.be.gt(0);
                result.ttl.should.be.at.most(1000);
            });

            it("should return RedisStore as the source", function () {
                result.source.should.equal("RedisStore");
            });
        });

        describe("when there is no data", function () {
            beforeEach(function () {
                return store.get("foo").then(function (data) {
                    result = data;
                });
            });

            it("should return null", function () {
                expect(result).to.equal(null);
            });
        });

        describe("when it errors", function () {
            var error;

            beforeEach(function () {
                client.get.nextError = new Error("testing");
                return store.get("foo").then(function () {
                    throw new Error("it should have thrown");
                }).catch(function (err) {
                    error = err;
                });
            });

            it("should return the error as a promise", function () {
                error.message.should.equal("testing");
            });
        });

        describe("when there is broken data", function () {
            var error;

            beforeEach(function () {
                client.data.set("foo", "{");
                return store.get("foo").then(function () {
                    throw new Error("it should have thrown");
                }).catch(function (err) {
                    error = err;
                });
            });

            it("should return the error as a promise", function () {
                error.message.should.not.equal("it should have thrown");
            });
        });
    });
});
