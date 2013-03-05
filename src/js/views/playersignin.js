var PlayerSigninView = Backbone.View.extend({
  el : "#content",

  events: {
    'submit form#frmSigninPlayer' : 'signin'
  },

  pageName: "playerSignin",

  initialize : function() {
    this.playerSigninTemplate = Y.Templates.get('playerSigninTemplate');
    this.render();
    //$.mobile.hidePageLoadingMsg();
  },

  signin : function(event) {
    var email = $('#email').val();
    var password = $('#password').val();

    console.log('test authentification avec ' + email);
    this.player = new PlayerModel();
    this.player.login(email, password);
    return false;
  },

  // render the content into div of view
  render : function() {
    this.$el.html(this.playerSigninTemplate({}));
    this.$el.trigger('pagecreate');
    return this;
  },

  onClose : function() {
    this.undelegateEvents();
  }
});
