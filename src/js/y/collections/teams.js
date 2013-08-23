var TeamsCollection = Backbone.Collection.extend({

  model : TeamModel,

  mode : 'default',

  query : '',

  initialize : function(param) {

  },

  url : function() {

    if (this.mode === 'search')
      return Y.Conf.get("api.url.teams") + 'autocomplete/?q=' + this.query+'&limit=15';
    else
      return Y.Conf.get("api.url.teams");

  },

  setMode : function(m, q) {
    this.mode = m;
    this.query = q;
  },

  // FIXME : if exists in localStorage, don't request
  sync : function(method, model, options) {

    return Backbone.sync(method, model, options);

  },

});
