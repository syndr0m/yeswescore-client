var GameFollowView = Backbone.View.extend({
  el:"#index",

  listview:"#listGamesView",
    
  events: {
    "keyup input#search-basic": "search"
  },

  initialize:function() {
    this.indexViewTemplate = YesWeScore.Templates.get('indexViewTemplate');
    this.gameListViewTemplate = YesWeScore.Templates.get('gameListViewTemplate');
        
    $.mobile.showPageLoadingMsg();
        
    this.games = new GamesCollection('follow');
    this.gamesfollow = new GamesCollection(this.games.storage.findAll({local:true}));
		
    this.render();
        
    //this.games.on( 'all', this.renderList, this );
    //this.games.on("all", this.renderList, this);
    //this.games.findAll();
        
    //$.mobile.showPageLoadingMsg();
    this.renderList();
  },
    
  search:function() {
    //FIXME if($("#search-basic").val().length>3) {
    var q = $("#search-basic").val();
    $(this.listview).empty();
    //gamesList = new GamesSearch();
    //gamesList.setQuery(q);
    //gamesList.fetch();
    this.games.setMode('player',q);
    this.games.fetch();
    $(this.listview).html(this.gameListViewTemplate({games:this.games.toJSON(), query:q}));
    $(this.listview).listview('refresh');
    //}
    return this;
  },

  //render the content into div of view
  render: function(){
    this.$el.html(this.indexViewTemplate(), {});
    //Trigger jquerymobile rendering
    this.$el.trigger('pagecreate');
      
    //return to enable chained calls
    return this;
  },

  renderList: function(query) {
    console.log('renderList');
    
    $(this.listview).html(this.gameListViewTemplate({games:this.gamesfollow.toJSON(),query:' '}));
    $(this.listview).listview('refresh');
    $.mobile.hidePageLoadingMsg();
    return this;
  },
  
  onClose: function() {
    this.undelegateEvents();
    //this.games.off("all",this.renderList,this);
  }
});
