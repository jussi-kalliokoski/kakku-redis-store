# kakku-redis-store

[![Build Status](https://travis-ci.org/jussi-kalliokoski/kakku-redis-store.svg)](https://travis-ci.org/jussi-kalliokoski/kakku-redis-store)
[![Coverage Status](https://img.shields.io/coveralls/jussi-kalliokoski/kakku-redis-store.svg)](https://coveralls.io/r/jussi-kalliokoski/kakku-redis-store)

An [redis](https://github.com/mranney/node_redis)-backed store for [kakku](https://github.com/jussi-kalliokoski/kakku-redis-store).

## Usage

```javascript
var Redis = require("redis");
var Kakku = require("kakku").Kakku;
var RedisStore = require("kakku-redis-store").RedisStore;

var kakku = new Kakku({
    ...
    store: new RedisStore({ client: redis.createClient() }),
});
```

### Development

Development is pretty straightforward, it's all JS and the standard node stuff works:

To install dependencies:

```bash
$ npm install
```

To run the tests:

```bash
$ npm test
```

Then just make your awesome feature and a PR for it. Don't forget to file an issue first, or start with an empty PR so others can see what you're doing and discuss it so there's a a minimal amount of wasted effort.
