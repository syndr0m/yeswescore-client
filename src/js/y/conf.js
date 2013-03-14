(function (Y, undefined) {
  "use strict";

  // permanent storage
  var filename = "yws.json";

  // DB: no need of any drivers
  //  localStorage is supported on android / iOS
  //  @see http://caniuse.com/#feat=namevalue-storage
  //
  // FIXME: utiliser une surcouche au localstorage qui g�re le quota et 
  //    une notion de date et priorit� (#44910971)
  var DB = {
    // in local storage, all conf keys will be prefixed "Y.conf."
    prefix: "Y.Conf.",

    save: function (k, v) {
      assert(typeof k === "string");
      assert(typeof v === "string");

      window.localStorage.setItem(this.prefix + k, v);
    },

    // @return value/null if not exist.
    read: function (k) {
      assert(typeof k === "string");

      return window.localStorage.getItem(this.prefix + k);
    },

    remove: function (k) {
      assert(typeof k === "string");

      return window.localStorage.removeItem(k);
    },

    getKeys: function () {
      return _.filter(_.keys(window.localStorage), function (k) {
        return k.substr(0, this.prefix.length) == this.prefix;
      }, this);
    }
  };

  var Conf = {
    initEnv: function () {
      Y.Env.CURRENT = Y.Env.PROD; // default behaviour
      // @ifdef DEV
      Y.Env.CURRENT = Y.Env.DEV;  // overloaded in dev
      // @endif
      return this; // chainable
    },

    load: function (env, callback) {
      assert(env === Y.Env.DEV ||
             env === Y.Env.PROD);

      // conf already loaded => we directly return
      if (this.exist("_env") && this.get("_env") === env)
        return callback();

      // Param�trage des variables dependantes d'un environnement
      switch (env) {
        case Y.Env.DEV:
          // @ifdef DEV

          // marc
          var apiBaseUrl = "http://plic.no-ip.org:22222";
          var fbBaseUrl = "http://plic.no-ip.org:9091";
          // vincent
          // var apiBaseUrl = "http://plic.no-ip.org:1024";
          // var fbBaseUrl = "http://plic.no-ip.org:9090";

          this.setNX("api.url.auth", apiBaseUrl + "/v1/auth/");
          this.setNX("api.url.bootstrap", apiBaseUrl + "/bootstrap/conf.json?version=%VERSION%");
          this.setNX("api.url.games", apiBaseUrl + "/v1/games/");
          this.setNX("api.url.players", apiBaseUrl + "/v1/players/");
          this.setNX("api.url.clubs", apiBaseUrl + "/v1/clubs/");
          this.setNX("api.url.stats", apiBaseUrl + "/v1/stats/");
          this.setNX("fb.url.inappbrowser.login", fbBaseUrl + "/v1/inappbrowser/login.html?playerid=[player_id]&token=[token]");
          // @endif
          break;
        case Y.Env.PROD:
          this.setNX("api.url.auth", "http://api.yeswescore.com/v1/auth/");
          this.setNX("api.url.bootstrap", "http://91.121.184.177:1024/bootstrap/conf.json?version=%VERSION%");
          this.setNX("api.url.games", "http://api.yeswescore.com/v1/games/");
          this.setNX("api.url.players", "http://api.yeswescore.com/v1/players/");
          this.setNX("api.url.clubs", "http://api.yeswescore.com/v1/clubs/");
          this.setNX("api.url.stats", "http://api.yeswescore.com/v1/stats/");
          this.setNX("fb.url.inappbrowser.login", "https://fb.yeswescore.com/v1/inappbrowser/login.html?playerid=[player_id]&token=[token]");
          break;
        default:
          break;
      }

      // Param�trage des variables non d�pendantes d'un environnement
      this.setNX("game.refresh", 5000); // gameRefresh
      this.set("pooling.geolocation", 5000);
      this.set("pooling.connection", 1000);
      this.set("version", "1"); // might be usefull on update.
      this.set("facebook.app.id", "408897482525651");
      this.set("facebook.url.connect", "https://www.facebook.com/dialog/oauth?%20client_id=408897482525651&scope=email&redirect_uri=%redirect_uri%&response_type=token");

      // loading permanent keys
      //  stored inside yws.json using format [{key:...,value:...,metadata:...},...]
      Cordova.ready(function () {
        Cordova.File.read(filename, function (err, data) {
          if (err)
            return callback();
          var k = [];
          try { k = JSON.parse(data); } catch (e) { }
          _.forEach(k, function (o) {
            this.set(o.key, o.value, o.metadata);
          });
          callback();
        });
      });
    },

    // Read API
    // @param string/regExp key
    // @return [values]/value/undefined
    get: function (key) {
      assert(typeof key === "string" || key instanceof RegExp);

      if (typeof key === "string") {
        if (DB.read(key)) {
          try {
            return JSON.parse(DB.read(key)).value;
          } catch (e) { assert(false) }
        }
        return undefined;
      }
      // recursive call.
      return _.map(this.keys(key), function (key) {
        return this.get(key);
      }, this);
    },

    // @param string key
    // @return object/undefined
    getMetadata: function (key) {
      assert(typeof key === "string");

      if (DB.read(key)) {
        try {
          return JSON.parse(DB.read(key)).metadata;
        } catch (e) { }
      }
      return undefined;
    },

    // @param string key
    // @return object/undefined
    getRaw: function (key) {
      assert(typeof key === "string");

      if (DB.read(key)) {
        try {
          return JSON.parse(DB.read(key));
        } catch (e) { }
      }
      return undefined;
    },

    // Write API (inspired by http://redis.io)
    set: function (key, value, metadata, callback) {
      assert(typeof key === "string");
      assert(typeof value !== "undefined");

      var obj = { key: key, value: value, metadata: metadata };
      DB.save(key, JSON.stringify(obj));

      // events
      this.trigger("set", [obj]);

      // permanent keys (cost a lot).
      if (metadata && metadata.permanent) {
        var permanentKeys = _.filter(DB.getKeys(), function (k) {
          var metadata = this.getMetadata(k);
          return metadata && metadata.permanent;
        }, this);
        var permanentObjs = _.map(permanentKeys, function (k) {
          return this.getRaw(k);
        }, this);
        // saving when cordova is ready.
        Cordova.ready(function () {
          Cordova.File.write(filename, JSON.stringify(permanentObjs), callback || function () { });
        });
      }
    },

    // set if not exist.
    setNX: function (key, value, metadata) {
      assert(typeof key === "string");

      if (!this.exist(key))
        this.set(key, value, metadata);
    },

    // search configuration keys.
    keys: function (r) {
      assert(r instanceof RegExp);

      return _.filter(DB.getKeys(), function (key) {
        return key.match(r);
      });
    },

    exist: function (key) {
      assert(typeof key === "string");

      return DB.read(key) !== null;
    },

    unload: function () {
      _.forEach(DB.getKeys(), function (key) {
        DB.remove(key);
      });
    },

    reload: function () {
      this.unload();
      this.load();
    }
  };

  // using mixin
  _.extend(Conf, Backbone.Events);

  // setting conf
  Y.Conf = Conf;
})(Y);

