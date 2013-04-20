Y.Views.PlayerSignin = Y.View.extend({
  el : "#content",

  events: {
  
    'focus input[type="text"]': 'inputModeOn',
    'blur input[type="text"]': 'inputModeOff',
    
    'click #signinUser' : 'signin',
    'click #forgetPassword' : 'forget'    
    
  },

  pageName: "playerSignin",
  pageHash : "players/signin", 

  initialize : function() {
  
    Y.GUI.header.title("CONNEXION");     
  
    this.playerSigninTemplate = Y.Templates.get('playerSignin');
    this.render();
    //$.mobile.hidePageLoadingMsg();
  },
  

  forget : function(event) {

   	Y.Router.navigate("/players/forget", {trigger: true}); 
  
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
    //this.$el.trigger('pagecreate');
    return this;
  },

  onClose : function() {
    this.undelegateEvents();
  }
});
