Y.Views.GameComments = Y.View.extend({
  el:"#content",
  gameid:'',

  pageName: "gameComment",
  pageHash : "games/comment/",

  myinitialize:function() {
    this.pageHash += this.id; 
    this.gameid = this.id;
    this.game = null;
    this.streamItemsCollection = null;

    // header
    Y.GUI.header.title("COMMENTAIRES");
  
    // loading templates.
    this.templates = {
      layout: Y.Templates.get('gameComments'),
      score:  Y.Templates.get('gameCommentsScore'),
      comment: Y.Templates.get('gameCommentsComment')
    };

    // loading owner
    this.Owner = Y.User.getPlayer();

    // we render immediatly
    this.render();

    // FIXME: utiliser une factory pour recuperer l'objet game.
    // FIXME: quand la factory existera et que les objets seront globaux
    //         on pourra activer du pooling sur l'objet.
   	var game = new GameModel({id : this.gameid});
    game.once("sync", function () {
      this.game = game;
      this.renderScore(); // might be later.
    }, this);
    game.fetch();

    // updating comment list when collection is updated
    this.streamItemsCollection = new StreamsCollection([], {gameid : this.gameid});
    this.streamItemsCollection.on("sync", this.renderList, this);

    // pool the collection regulary
    var pollingOptions = { delay: Y.Conf.get("game.refresh") };
    this.poller = Backbone.Poller.get(this.streamItemsCollection, pollingOptions);
    this.poller.start();
  },
  
  render: function () {
    // empty page.
	  this.$el.html(this.templates.layout());
	  return this;
  },
  
  // score component (top of the page)
  renderScore: function () {
	  this.$(".zone-score").html(this.templates.score({game : this.game.toJSON()}));
	  return this;
  },

  // liste de commentaires 
  renderList : function() {
    $listComment = this.$(".list-comment");
    var nbComments = this.streamItemsCollection.length;
    // FIXME: l18n
    if (nbComments === 0)
      this.$(".list-comment-title").html("Aucun commentaire");
    else if (nbComments === 1)
      this.$(".list-comment-title").html("1 COMMENTAIRE");
    else if (nbComments <= 10)
      this.$(".list-comment-title").html(nbComments + " COMMENTAIRES");
    else
      this.$(".list-comment-title").html("10 DERNIERS COMMENTAIRES");
    // adding comment into the DOM.
    this.streamItemsCollection.forEach(function (streamItem) {
      if (!document.getElementById("comment"+streamItem.get('id'))) {
        // small fade-in effect using an hidden container.
        var divHiddenContainer = document.createElement("div");
        divHiddenContainer.style.display = "none";
        $(divHiddenContainer).html(this.templates.comment({
          streamItem  : streamItem.toJSON(),
          Owner : this.Owner.toJSON()
        }));
        $listComment.prepend(divHiddenContainer);
        $(divHiddenContainer).fadeIn();
      }
    }, this);
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
      + '/?playerid='+this.Owner.id
      +'&token='+this.Owner.toJSON().token
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
          console.log('report '+id, result); 
        }
      });
  },

  sendComment : function() {
    var playerid = this.Owner.id
    , token  = this.Owner.toJSON().token
    , gameid = this.gameid
    , comment = $('#messageText').val();

    var stream = new StreamModel({
          type : "comment",
          playerid : playerid,
          token : token,
          text : comment,
          gameid : gameid
    });
    
    var that = this;
    stream.save().done(function (streamItem) {
      that.streamItemsCollection.fetch();
      document.body.scrollTop = 0;
    });

    $('#messageText').val('');
  },

  onClose: function(){
    console.log('onClose !');

    this.undelegateEvents();
    
    this.streamItemsCollection.off('success', this.renderList, this);
    this.poller.stop();
  }
});