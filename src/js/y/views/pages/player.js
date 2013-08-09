Y.Views.Pages.Player = Y.View.extend({
  el:"#content",

  events: {
    'click #followButton': 'followPlayer'
  },

  pageName: "player",
  pageHash : "players/",
  myid : "",
  mytoken : "",
  following: false, // lol2
  
  myinitialize: function(options) {
  
    this.pageHash += this.id; 
    
    Y.GUI.header.title(i18n.t('player.title'));	    
    
    //myinfo
    this.myid = Y.User.getPlayer().get('id');
    this.mytoken = Y.User.getPlayer().get('token');
    this.players_follow = Y.User.getPlayer().get('following');    

    this.page = Y.Templates.get('page-player');

    this.player = new PlayerModel({id:this.id});
    //change
    this.player.on( 'sync', this.render, this );
        
    this.player.fetch(); 

    if (this.players_follow !== undefined)
    {
      if (this.players_follow.indexOf(this.id) === -1) {
        this.follow = 'false';
      }
      else
        this.follow = 'true';          
    }
    else
      this.follow = 'false';
  },


  followPlayer: function() {
  
  	//on ne peut pas se suivre
    if (this.myid === this.id) return;
    
    if (this.following)
      return;   
  
  	var that = this;
       
    if (this.follow === 'true') {
      
     //NEW API
      this.following = true;
	    Backbone.ajax({
        dataType: 'json',
        url: Y.Conf.get("api.url.players") +this.myid+"/following/?playerid="+this.myid+"&token="+this.mytoken+"&_method=delete",
        type: 'POST',
        data: {
          id: this.id
        },
        success: function (data) {
          that.following = false;
          
          //On supprime l'id
	      if (that.players_follow !== undefined)
	      {
	        if (that.players_follow.indexOf(that.id) !== -1) {
	        //On retire l'elmt
	          that.players_follow.splice(that.players_follow.indexOf(that.id), 1);
	          var data = {id: that.myid, following: that.players_follow };
              Y.User.updatePlayer(data);
	        }
	      }
	      
         $('span.success').css({display:"block"});
         $('span.success').html(i18n.t('message.nofollowplayerok')).show();
         $("#followButton").text(i18n.t('message.follow'));
         $('#followButton').removeClass('button-selected');
         $('#followButton').addClass('button'); 	      
          
        },
        error: function (err) {
          that.following = false;
          //that.displayError(i18n.t('message.error'));
          console.log(i18n.t('message.error'));
        }
      });       
          
      this.follow = 'false';

    } else {
   
       navigator.notification.confirm(
        i18n.t('message.pushmessage'),  // message
        function(buttonIndex){
            that.followPlayerConfirm(buttonIndex, that);
        },         // callback
        i18n.t('message.pushtitle'),            // title
        i18n.t('message.pushyes')+','+i18n.t('message.pushno') // buttonName
	   );
	   
    }	
  
  },   
  
  followPlayerConfirm : function(buttonIndex, that){
    if (buttonIndex==1) {	    

      that.following = true;
	  
	  Backbone.ajax({
        dataType: 'json',
        url: Y.Conf.get("api.url.players") +that.myid+"/following/?playerid="+that.myid+"&token="+that.mytoken,
        type: 'POST',
        data: {
          id: that.id
        },
        success: function (data) {
          that.following = false;

		  //On ajoute l'id
		  if (that.players_follow !== undefined)
          {
            if (that.players_follow.indexOf(that.id) === -1) {     
              that.players_follow.push(that.id);
              var data = {id: that.myid, following: that.players_follow };
              Y.User.updatePlayer(data); 
            }
          }
          else {
            var data = {id: that.myid, following: [that.id] };            
            Y.User.updatePlayer(data); 
          }
          
	     $('span.success').css({display:"block"});
	     $('span.success').html(i18n.t('message.followplayerok')).show();
	     $("#followButton").text(i18n.t('message.nofollow'));
	     $('#followButton').removeClass('button');
	     $('#followButton').addClass('button-selected');               
		  
        },
        error: function (err) {
          that.following = false;
          //that.displayError(i18n.t('message.error'));
          console.log(i18n.t('message.error'));
        }
      });          

           
      that.follow = 'true';  
    }
  },  

  //render the content into div of view
  render: function(){
    this.$el.html(this.page({
      player: this.player.toJSON(),
      follow: this.follow,
      imageUrl: this.player.getImageUrlOrPlaceholder()
    })).i18n();
    return this;
  },

  onClose: function(){
    this.undelegateEvents();
    this.player.off("sync",this.render,this);   
    //this.$el.off('pagebeforeshow'); 
  }
});