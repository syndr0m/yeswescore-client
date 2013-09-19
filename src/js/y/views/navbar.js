Y.Views.Navbar = Y.View.extend({
  el: "#footer",
  submenu : "",
  currentfragment: "",
  
  events: {
    'vclick a[data-fragment="follow"]': "displaySubBar",    
    'vclick a[data-fragment="add"]'  : "displaySubBar",
    
    'click a[data-fragment="player"]': "goToPlayer",  
    'click a[data-fragment="team"]': "goToTeam",
    'click a[data-fragment="club"]': "goToClub",         
      
    'vclick a[data-fragment="account"]'   : "goToAccount"
  },

  initialize: function () {
    var that = this;
    Y.Router.on("pageChanged", function (page, fragment) {
      this.hideSubBar();
      this.highlight(fragment);
      this.currentfragment = fragment;
      this.submenu="";
    }, this);
    
  },
  render: function () { },
  
  highlight: function (fragment) {
    // factorizing fragment.
    if ( fragment == "follow" || fragment == "games/list" || fragment == "teams/list" || fragment == "clubs/list" ) {
      fragment = "follow";
    } else if (fragment == "add" || fragment == "games/add" || fragment == "teams/add" || fragment == "clubs/add" ) {
      fragment = "add";
    } else if (fragment == "account") {
      fragment = "account"
    } else {
      fragment = null; // unknown
    }

    // fragment was identified.
    if (fragment) {
      this.$("a").each(function () { $(this).removeClass("highlighted") });
      this.$('a[data-fragment="'+fragment+'"]').addClass("highlighted");
    }
  },

  show: function () { 
    this.$el.show();
  },

  hide: function () { 
    /*
    this.$el.css("opacity", 0)
	#navbar { transition: opacity ease 1s; }
    */
    this.$el.hide();
  },

  showButton: function () {
    $('#footer div.button').show();  
    $('.link-form div.button,.link-form div.button-selected').show();    
  },

  hideButton: function () {
    $('#footer div.button').hide();  
    $('.link-form div.button,.link-form div.button-selected').hide();
  },
  
  hideSubBar: function () { 
    $('#subnavbar').hide();
  }, 
  
  displaySubBar: function (e) { 
     
    var elmt = $(e.currentTarget);
    var id = elmt.attr("data-fragment");
    console.log('displaySubBar ',id);

    if (this.submenu!==id) {
      this.highlight(id);
      this.hideButton();    
      $('#subnavbar').show();
      //$('#subnavbar a').i18n();
      this.submenu=id; 
    }
    else
    {
      this.hideSubBar();
      this.showButton(); 
      this.submenu="";
      this.highlight(this.currentfragment);
    }
  },  
  
  goToPlayer: function () { 
    //console.log('goToPlayer');
    this.$('div[data-fragment="player"]').addClass("highlighted");
    
    if (this.submenu==="follow")
      Y.Router.navigate("games/list", {trigger: true}); 
    else
      Y.Router.navigate("games/add", {trigger: true});       
  },
  goToTeam: function () { 
    //console.log('goToTeam');  
    this.$('div[data-fragment="team"]').addClass("highlighted"); 

    if (this.submenu==="follow")       
      Y.Router.navigate("teams/list", {trigger: true}); 
    else
      Y.Router.navigate("teams/add", {trigger: true});        
  },
  goToClub: function () { 
    //console.log('goToClub');  
    this.$('div[data-fragment="club"]').addClass("highlighted");

    if (this.submenu==="follow")      
      Y.Router.navigate("clubs/list", {trigger: true}); 
    else
      Y.Router.navigate("clubs/add", {trigger: true});       
  },  
  
  goToAccount: function () {

    this.submenu='account';  
    console.log('displaySubBar ',this.submenu);
          
    $('#subnavbar').hide();
    this.highlight("account");
    Y.Router.navigate("account", {trigger: true}); 
  }
});