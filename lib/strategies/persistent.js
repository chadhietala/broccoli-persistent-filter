var AsyncDiskCache = require('async-disk-cache');
var Promise = require('rsvp').Promise;

module.exports = {

  _cache: {},

  init: function(ctx) {
    if (!ctx.constructor._persistentCacheKey) {
      ctx.constructor._persistentCacheKey = this.cacheKey(ctx);
    }

    this._cache = new AsyncDiskCache(ctx.constructor._persistentCacheKey, {
      compression: 'deflate'
    });
  },

  cacheKey: function(ctx) {
    return ctx.cacheKey();
  },

  processString: function(ctx, contents, relativePath) {
    var key = ctx.cacheKeyProcessString(contents, relativePath);
    var cache = this._cache;

    return cache.get(key).then(function(entry) {
      if (entry.isCached) {
        return entry.value;
      } else {
        var string = Promise.resolve(ctx.processString(contents, relativePath));

        string.then(function(string) {
          return cache.set(key, string).then(function() {
            return string;
          });
        });
      }
    });
  }
};
