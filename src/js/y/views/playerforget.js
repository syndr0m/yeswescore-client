Y.Views.PlayerForget = Y.View.extend({
  el : "#content",

  events: {
    'submit form#frmForgetPlayer' : 'forget',
    'click input' :'hideFooter'
  },

  pageName: "playerForget",
  pageHash : "players/forget",
  
  initialize : function() {
  
    Y.GUI.header.title("MOT DE PASSE OUBLIE");     
  
    this.playerForgetTemplate = Y.Templates.get('playerForget');
    this.render();
    //$.mobile.hidePageLoadingMsg();
  },
  
  hideFooter:function() {
  	console.log('hideFooter');
  	//$.ui.toggleNavMenu(false);
  },    

  forget : function(event) {
  
    //$.ui.toggleNavMenu(true);
  
    var email = $('#email').val();

    console.log('test mot de passe oublie avec ' + email);
    
    this.player = new PlayerModel();
    this.player.newpass(email);
    
    return false;
  },

  // render the content into div of view
  render : function() {
    this.$el.html(this.playerForgetTemplate({}));
    //this.$el.trigger('pagecreate');
    return this;
  },

  onClose : function() {
    this.undelegateEvents();
  }
});
