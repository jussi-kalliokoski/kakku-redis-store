"use strict";

const NAME = "RedisStore";

class RedisStore {
    constructor ({ client }) {
        if ( !client ) {
            throw new Error("An instance of Redis is required as a `client`");
        }

        this.client = client;
    }

    set (key, value) {
        return new Promise((resolve, reject) => {
            var data = JSON.stringify({
                data: value.data,
                expires: Date.now() + value.ttl,
            });

            this.client.set(key, data, function (error) {
                if ( error ) { return reject(error); }
                resolve();
            });
        });
    }

    get (key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, function (error, value) {
                if ( error ) { return reject(error); }
                if ( value == null ) { return resolve(null); }

                try {
                    var data = JSON.parse(value);
                    resolve({
                        source: NAME,
                        data: data.data,
                        ttl: data.expires - Date.now(),
                    });
                } catch (jsonError) {
                    reject(jsonError);
                }
            });
        });
    }
}

export { RedisStore };
