var GameCommentView = Backbone.View.extend({
  el:"#content",
  
  incomingComment : "#incomingComment",

  events: {
        'click #sendComment'  : 'sendComment',
        'click .deleteComment': 'deleteComment'   
  },

  pageName: "gameComment",
    
  initialize:function() {
    this.gameCommentTemplate = Y.Templates.get('gameCommentTemplate');
    this.gameViewCommentListTemplate = Y.Templates
            .get('gameViewCommentListTemplate');
               
    //Owner = JSON.tryParse(window.localStorage.getItem("Y.Cache.Player"));
    //this.players = new PlayersCollection("me");
   
    this.Owner = Y.User.getPlayer();

	//console.log("Owner",this.Owner.toJSON());
	//console.log("Owner.token",this.Owner.toJSON().token);
    
   	this.score = new GameModel({id : this.id});
    this.score.fetch();
    
    this.score.on("all",this.render,this);

   	this.comment = new StreamModel({id : this.id});
    this.comment.fetch();
    
    var options = {
          delay : Y.Conf.get("game.refresh")
    };
    
    //poller = Backbone.Poller.get(this.comment, options)
    //poller.start();
    //poller.on('success', this.getObjectUpdated, this);

	this.comment.on("all",this.renderRefresh,this);

  },
  
  
  //render the content into div of view
  render: function(){
    
	  var token = this.Owner.toJSON().token;
 	  var playerid = this.Owner.id;
  
	  this.$el.html(this.gameCommentTemplate({game : this.score.toJSON(),playerid:this.Owner.id,token:token}));
	  this.$el.trigger('pagecreate');
	  return this;
  },
  
  
  getObjectUpdated: function() {
        this.comment.on("all",this.renderRefresh,this);     
  },

      // render the content into div of view
  renderRefresh : function() {
        
		//console.log('COMMENT',this.comment.toJSON());        

        // if we have comments

        if (this.comment.toJSON() !== undefined) {

          $(this.incomingComment).html(this.gameViewCommentListTemplate({
            streams  : this.comment.toJSON()
          }));
          
          $(this.incomingComment).trigger('create');

        }
        
        //return this;+
        return false;
  }, 


  deleteComment : function(e) {
      
    var elmt = $(e.currentTarget);
  	var id = elmt.attr("id");
  		
  	//FIXME : On recup�re le Owner.token et id pour etre sur que le comment lui appartient
  	// si retour du serveur, on supprime
    console.log('On efface le comment '+id);
      
  },

  sendComment : function() {
  
  	console.log('sendComment');
  
    var playerid = $('#playerid').val()
    , token  = $('#token').val()
    , gameid = $('#gameid').val()
    , comment = $('#messageText').val();

    var stream = new StreamModel({
          type : "comment",
          playerid : playerid,
          token : token,
          text : comment,
          gameid : gameid
    });
    // console.log('stream',stream);
    stream.save();

    $('#messageText').val();
  },

  onClose: function(){
    this.undelegateEvents();
    
    poller.stop();
    poller.off('success', this.renderRefresh, this);
  }
});