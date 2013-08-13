Y.Views.Pages.GameComments = Y.View.extend({
  el:"#content",
  gameid:'',

  pageName: "gameComment",
  pageHash : "games/comment/",

  shareTimeout: null,

  events: {
    'click #sendComment' : 'sendComment',
    'click #getPhoto': 'getPhoto'
  },

  myinitialize:function() {
    this.pageHash += this.id; 
    this.gameid = this.id;
    this.game = null;
    this.streamItemsCollection = null;

    // header
    Y.GUI.header.title(i18n.t('gamecomment.title'));
  
    // loading templates.
    this.templates = {
      page: Y.Templates.get('page-gamecomments'),
      score:  Y.Templates.get('module-comments-score'),
      comment: Y.Templates.get('module-comments-comment')
    };

    // loading owner
    this.owner = Y.User.getPlayer();

    // we render immediatly
    this.render();

    // FIXME: utiliser une factory pour recuperer l'objet game.
    // FIXME: quand la factory existera et que les objets seront globaux
    //         on pourra activer du pooling sur l'objet.
     this.game = new GameModel({id : this.gameid});
     
     var that = this;
     this.syncGame = function () {
      //that.game = game;
      that.renderScore(); // might be later.     
     };
     
    //this.game.once("sync", this.syncGame, this);
    //this.game.fetch();

    // updating comment list when collection is updated
    this.streamItemsCollection = new StreamsCollection([], {gameid : this.gameid});
    this.streamItemsCollection.on("sync", this.renderList, this);

    // pool the collection regulary
    var pollingOptions = { delay: Y.Conf.get("game.refresh") };
    this.poller = Backbone.Poller.get(this.streamItemsCollection, pollingOptions);
    this.poller.start();
  },
  
  /*
  inputModeOn: function (e) {
    // calling parent.
    var r = Y.View.prototype.inputModeOn.apply(this, arguments);
    this.scrollBottom();
    return r;
  },

  inputModeOff: function (e) {
    // calling parent.
    var r = Y.View.prototype.inputModeOff.apply(this, arguments);
    this.scrollBottom();
    return r;
  },*/

  render: function () {
    // empty page.
    this.$el.html(this.templates.page({}));
     
    this.$el.i18n();  
    return this;
  },
  
  // score component (top of the page)
  renderScore: function () {
  
   var timer = '';
   var game = this.game.toJSON();
        
    if ( game.status === "finished" ) {
       
      //var dateEnd = new Date(game.dates.end);
      //var dateStart = new Date(game.dates.start);

      var dateEnd = Date.fromString(game.dates.end);      
      var dateStart = Date.fromString(game.dates.start);
            
      timer = dateEnd - dateStart;
      var dateTimer = new Date(0, 0, 0, 0, 0, 0, timer);         
      timer = ('0'+dateTimer.getHours()).slice(-2)+':'+('0'+dateTimer.getMinutes()).slice(-2);        
        
    }
    else if ( game.status === "ongoing" ) {
      
      //comment connaitre la date actuelle par rapport au serveur ?
      var dateEnd = new Date();
      //var dateStart = new Date(game.dates.start);
      var dateStart = Date.fromString(game.dates.start);
            
      timer = dateEnd - dateStart;
          
      if (timer>0)
      {
        var dateTimer = new Date(0, 0, 0, 0, 0, 0, timer);         
        timer = ('0'+dateTimer.getHours()).slice(-2)+':'+('0'+dateTimer.getMinutes()).slice(-2);        
      }
      //declenche setTimeout(); qui met à jour toutes les 50 secondes ???
      //setInterval ( this.refreshTimer, 1000 );
          
    }  
  
  this.$(".zone-score").html(this.templates.score({game : this.game.toJSON(), timer :timer}));
    
  var startTeam = this.game.get('infos').startTeam;
  this.server1 = "";
  this.server2 = "";    
    
  if ( this.game.whoServe() === startTeam ) {
    if (this.game.get('teams')[0].id === startTeam) 
    {
    $('.server1').addClass('server-ball');
    $('.server2').removeClass('server-ball');  
    }
    else {
    $('.server1').removeClass('server-ball');
    $('.server2').addClass('server-ball');              
    }
  }
  else {
    if (this.game.get('teams')[0].id === startTeam) 
    {
    $('.server1').removeClass('server-ball');
    $('.server2').addClass('server-ball');        
    }
    else {
    $('.server1').addClass('server-ball');
    $('.server2').removeClass('server-ball');          
    }
  }    
    
    return this;
  },

  // liste de commentaires 
  renderList : function() {
    $listComment = this.$(".list-comment");
    var nbComments = this.streamItemsCollection.length;
    // FIXME: l18n
    if (nbComments === 0)
      this.$(".list-comment-title").html(i18n.t('game.0comment'));
    else if (nbComments === 1)
      this.$(".list-comment-title").html(i18n.t('game.1comment'));
    else if (nbComments <= 10)
      this.$(".list-comment-title").html(nbComments + " "+i18n.t('game.comments'));
    else
      this.$(".list-comment-title").html(i18n.t('game.10lastcomments'));
    // adding comment into the DOM.
    this.streamItemsCollection.forEach(function (streamItem) {
      if (!document.getElementById("comment"+streamItem.get('id'))) {
        // small fade-in effect using an hidden container.
        var divHiddenContainer = document.createElement("div");
        divHiddenContainer.style.display = "none";
        
        //filter
        streamItem = streamItem.toJSON();
        
        if (streamItem.type==="comment")
          streamItem.data.text = streamItem.data.text.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&#34;");
        else if (streamItem.type==="image") {
          var imageId = streamItem.data.id;   	   
    	  streamItem.data.text = "<img src=\""+Y.Conf.get("api.url.static.files") + imageId.substr(0, 10).match(/.{1,2}/g).join("/") + "/" + imageId + ".jpeg\" width=\"100%\">"; // default ext.        
        }
        
        $(divHiddenContainer).html(this.templates.comment({
          streamItem  : streamItem,
          owner : (this.owner) ? this.owner.toJSON() : null
        }));
        $listComment.prepend(divHiddenContainer);
        $(divHiddenContainer).fadeIn();
      }
    }, this);
    
    $('a').i18n();
    $('span').i18n();
    
    this.game.once("sync", this.syncGame, this);
    this.game.fetch();
        
    return this;
  }, 

  deleteComment : function(e) {  
    var elmt = $(e.currentTarget);
    var id = elmt.attr("data-js-streamitemid");
    
    Backbone.ajax({
      dataType : 'json',
      url : Y.Conf.get("api.url.games")
      + this.gameid 
      + '/stream/'
      + id 
      + '/?playerid='+this.owner.get('id')
      +'&token='+this.owner.get('token')
      +'&_method=delete',
        
      type : 'POST',
      success : function(result) {
      }
    }).always(_.bind(function () {
      // on le retire du DOM
      $("#comment"+id).fadeOut().remove();
      // on le supprime de la collection
      var streamItem = this.streamItemsCollection.findWhere({id: id});
      if (streamItem) {
        this.streamItemsCollection.remove(streamItem);
      } else {
        assert(false);
      }
    }, this));
  },

  reportComment : function(e) {
    var elmt = $(e.currentTarget);
    var id = elmt.attr("data-js-streamitemid");

    Backbone.ajax({
        dataType : 'json',
        url : Y.Conf.get("api.url.reports.games")+ this.gameid + '/stream/'+ id + '/',
        type : 'GET',
        success : function(result) { 

          elmt.html(i18n.t('gamecomment.alerted'));
          elmt.removeAttr('href');
          elmt.removeAttr('data-js-call');
          
        }
      });
  },

  sendingComment: false,
  sendComment : function() {
    var playerid = this.owner.id
    , token  = this.owner.get('token')
    , gameid = this.gameid
    , comment = $('#messageText').val()
    , that = this;
    


    if (comment.length === 0)
      return; // empty => doing nothing.
    if (this.sendingComment)
      return; // already sending => disabled.
      
    //filter
    comment = comment.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&#34;");  
    
    //ajout du score au moment du comment
    var sets = this.game.getSets(0);

    if (this.game.get('status') === "ongoing") {
      comment += ' ( ';
      if (sets[0][0]>0 || sets[0][1]>0)
        comment += ' '+sets[0][0]+'/'+sets[0][1];
      if (sets[1][0]>0 || sets[1][1]>0)
        comment += ' '+sets[1][0]+'/'+sets[1][1];
      if (sets[2][0]>0 || sets[2][1]>0)
        comment += ' '+sets[2][0]+'/'+sets[2][1];
      comment += ' ) ';
    }    
      
    //on bloque le textarea  
    $('.form-button-black').addClass('disabled');
    // on evite que l'utilisateur qui double tap, envoie 2 comments
    this.sendingComment = true;
      
    var stream = new StreamModel({
      playerid : playerid,
      gameid : gameid,
      token : token,
      type : "comment",      
      data : {
        text : comment,
      }
    });
    stream.save().done(function (streamItem) {
      that.streamItemsCollection.fetch();
      that.$('#messageText').val('');
      that.scrollTop();
      that.$('.form-button-black').removeClass("disabled");
      that.sendingComment = false;
    }).fail(function (err) {
      that.$("div[id=sendComment]").addClass("ko");
      that.shareTimeout = window.setTimeout(function () {
        that.$("div[id=sendComment]").removeClass("ko");
        that.shareTimeout = null;
        that.$('.form-button-black').removeClass("disabled");    
      }, 4000);
      that.sendingComment = false;
    });   
    
  },

  getPhoto: function() {
    var that = this;
    Cordova.Camera.capturePhoto(function (err, image) {
      image.dataUri = "data:image/jpeg;base64," + image.dataUri; // WARNING. might cost a lot of memory.
      that.sendImageComments(image);
    });
  },

  sendImageComments: function (image) {
    var playerid = this.owner.id
    , token  = this.owner.get('token')
    , gameid = this.gameid
    , that = this;
    var that = this;
    
    if (this.sendingComment)
      return; // already sending => disabled.    
    
    Y.Image.resize(image, function (err, image) {
      if (err)
        console.log("error resizing image : " + err);
      else {
        //$('#image').attr("src", image.dataUri);
	    var deferred = $.Deferred();
	    var $image = $("#image");
	    
	    $('.form-button-black').addClass('disabled');
	    
	    // on sauve la photo
	    var file = new FileModel();
	    file.data = image.dataUri;
	    file.save()
	      .done(function () {
	        deferred.resolve(file.get('id'));
	      })
	     .fail(function() {
	       deferred.resolve(null);
	     });
	            
    	 deferred.always(function (pictureId) {

    	   that.sendingComment = true;
      
	       var stream = new StreamModel({
	         playerid : playerid,
	         token : token,
	         gameid : gameid,
	         type: "image",	         
	         data : {
	           id : pictureId
	         }	          
	       });

		   stream.save().done(function (streamItem) {
		     that.streamItemsCollection.fetch();
		     that.scrollTop();
		     that.$('.form-button-black').removeClass("disabled");
		     that.sendingComment = false;
		   }).fail(function (err) {
		     that.$("div[id=getPhoto]").addClass("ko");
		     that.shareTimeout = window.setTimeout(function () {
		       that.$("div[id=getPhoto]").removeClass("ko");
		       that.shareTimeout = null;
		       that.$('.form-button-black').removeClass("disabled");    
		     }, 4000);
		      
		     that.sendingComment = false;
		   });   
	     }); 
	   }
    });     
  },
  

  onClose: function(){

    this.undelegateEvents();
    
    if (this.shareTimeout) {
      window.clearTimeout(this.shareTimeout);
      this.shareTimeout = null;
    }    
    
    this.game.off("sync", this.syncGame, this);
    
    this.streamItemsCollection.off('success', this.renderList, this);
    
    this.poller.stop();
  }
});