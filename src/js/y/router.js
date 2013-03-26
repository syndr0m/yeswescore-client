(function (Y) {
  "use strict";

  // overloading backbone close.
  Backbone.View.prototype.close = function () {
    this.off();
    if (typeof this.onClose === "function")
      this.onClose();
  };

  var currentView = null;

  /* JQmobi
  $.mvc.addRoute("/foo",function(){
  var args=arguments;
  console.log("Foo",arguments);
  });
	
  */

  var Router = Backbone.Router.extend({
    routes: {
      '': 'index',
      'sort/:id' : 'index',
      'games/me/:id': 'gameMe',
      'games/add': 'gameAdd',
      'games/follow': 'gameFollow',
      'games/end/:id': 'gameEnd',
      'games/comment/:id': 'gameComment',
      'games/club/:id': 'gameClub',
      'games/:id': 'game',
      'players/list': 'playerList',
      'players/club/:id': 'playerListByClub',
      'players/form': 'playerForm',
      'players/signin': 'playerSignin',
      'players/forget': 'playerForget',
      'players/follow': 'playerFollow',
      //'players/follow/:id':                           'playerFollow',    
      //'players/nofollow/:id':                         'playerNoFollow',                                    
      'players/:id': 'player',
      'clubs/add': 'clubAdd',
      'clubs/:id': 'club',
      'account': 'account'
    },


    initialize: function (options) {
    
      var that = this; 
      jq.ui.customClickHandler = function (a) {
        that.navigate(a.hash.substr(1), { trigger: true });
        
        return true;
      };
      
  
    },

    account: function () {
      var accountView = new AccountView();
      this.changePage(accountView);
    },

    club: function (id) {
      var clubView = new ClubView({ id: id });
      this.changePage(clubView);
    },

    clubAdd: function (id) {
      var clubAddView = new ClubAddView();
      this.changePage(clubAddView);
    },

    index: function (id) {
      var indexView = new IndexView({ id: id });
      this.changePage(indexView);
    },

    
    game: function (id) {
      var gameView = new GameView({ id: id });
      this.changePage(gameView);
    },

    gameAdd: function () {
      var gameAddView = new GameAddView();
      this.changePage(gameAddView);
    },

    gameEnd: function (id) {
      var gameEndView = new GameEndView({ id: id });
      this.changePage(gameEndView);
    },

    gameComment: function (id) {
      var gameCommentView = new GameCommentView({ id: id });
      this.changePage(gameCommentView);
    },

    gameFollow: function () {
      var gameFollowView = new GameFollowView();
      this.changePage(gameFollowView);
    },

    gameMe: function (id) {
      var gameListView = new GameListView({ mode: 'me', id: id });
      this.changePage(gameListView);
    },

    gameClub: function (id) {
      var gameListView = new GameListView({ mode: 'club', clubid: id });
      this.changePage(gameListView);
    },

    player: function (id) {
      //console.log('router ',id);
      var playerView = new PlayerView({ id: id, follow: '' });
      this.changePage(playerView);
    },


    playerFollow: function (id) {
      var playerFollowView = new PlayerFollowView();
      this.changePage(playerFollowView);
    },

    playerNoFollow: function (id) {
      var playerView = new PlayerView({ id: id, follow: 'false' });
      this.changePage(playerView);
    },

    playerForm: function () {
      var playerFormView = new PlayerFormView();
      this.changePage(playerFormView);
    },

    playerList: function () {
      var playerListView = new PlayerListView();
      this.changePage(playerListView);
    },

    playerListByClub: function (id) {
      var playerListView = new PlayerListView({ id: id });
      this.changePage(playerListView);
    },

    playerSignin: function () {
      var playerSigninView = new PlayerSigninView();
      this.changePage(playerSigninView);
    },

    playerForget: function () {
      var playerForgetView = new PlayerForgetView();
      this.changePage(playerForgetView);
    },

    setNextTransition: function (el) {
    },

    changePage: function (view) {

      try {
        var previousPageName = "none";
        var nextPageName = "unknown";

        if (currentView && currentView.pageName)
          previousPageName = currentView.pageName;
        if (currentView)
          currentView.close();
        currentView = view;
        if (view.pageName)
          nextPageName = view.pageName;

        Y.Stats.page(previousPageName, nextPageName);
        console.log('DEV ChangePage', new Date().getTime());
        
        //On repasse le scroll en haut
        console.log('scrollTop');

		var scrollTop = document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop;	
		scrollTop = 0;

        // FIXME: render of view should be here ?
      }
      catch (e) {
        console.log('DEV ChangePage Error', e);
      }


    },

    historyCount: 0
  });

  Y.Router = new Router();
})(Y);