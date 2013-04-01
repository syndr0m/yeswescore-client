(function (Y) {
  "use strict";

  // overloading backbone close.
  Backbone.View.prototype.close = function () {
    this.off();
    if (typeof this.onClose === "function")
      this.onClose();
  };

  var Router = Backbone.Router.extend({
    currentView: null,

    routes: {
      '': 'index',
      'index': 'index',
      'sort/:id': 'index',
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

    },

    /*
    * @param Y.Views.*  view 
    * @param object     params 
    * @return function returning a view object.
    */
    createViewFactory: function (view, params) {
      return function () {
        return new view(params);
      };
    },

    account: function () {
      this.changePage(this.createViewFactory(Y.Views.Account));
    },

    club: function (id) {
      this.changePage(this.createViewFactory(Y.Views.Club, { id: id }));
    },

    clubAdd: function (id) {
      this.changePage(this.createViewFactory(Y.Views.ClubAdd));
    },

    index: function (id) {
      this.changePage(this.createViewFactory(Y.Views.Index, { id: id }));
    },

    game: function (id) {
      this.changePage(this.createViewFactory(Y.Views.Game, { id: id }));
    },

    gameAdd: function () {
      this.changePage(this.createViewFactory(Y.Views.GameAdd));
    },

    gameEnd: function (id) {
      this.changePage(this.createViewFactory(Y.Views.GameEnd, { id: id }));
    },

    gameComment: function (id) {
      this.changePage(this.createViewFactory(Y.Views.GameComment, { id: id }));
    },

    gameFollow: function () {
      this.changePage(this.createViewFactory(Y.Views.GameFollow));
    },

    gameMe: function (id) {
      this.changePage(this.createViewFactory(Y.Views.GameList, { mode: 'me', id: id }));
    },

    gameClub: function (id) {
      this.changePage(this.createViewFactory(Y.Views.GameList, { mode: 'club', clubid: id }));
    },

    player: function (id) {
      this.changePage(this.createViewFactory(Y.Views.Player, { id: id, follow: '' }));
    },

    playerFollow: function (id) {
      this.changePage(this.createViewFactory(Y.Views.PlayerFollow));
    },

    playerNoFollow: function (id) {
      this.changePage(this.createViewFactory(Y.Views.Player, { id: id, follow: 'false' }));
    },

    playerForm: function () {
      this.changePage(this.createViewFactory(Y.Views.PlayerForm));
    },

    playerList: function () {
      this.changePage(this.createViewFactory(Y.Views.PlayerList));
    },

    playerListByClub: function (id) {
      this.changePage(this.createViewFactory(Y.Views.PlayerList, { id: id }));
    },

    playerSignin: function () {
      this.changePage(this.createViewFactory(Y.Views.PlayerSignin));
    },

    playerForget: function () {
      this.changePage(this.createViewFactory(Y.Views.PlayerForget));
    },

    /*
    * you can change page passing a function:
    *    this.changePage(function () { return new Y.Views.Account() });
    *
    * @param function  viewFactory    function returning a view
    */
    changePage: function (viewFactory) {
      assert(typeof viewFactory === "function");

      var previousPageName = "none"
        , previousPageHash = "none"
        , nextPageName = "unknown"
        , nextPageHash = "unknown"
        , view = null;

      // previous page name, page hash
      if (this.currentView && this.currentView.pageName)
        previousPageName = this.currentView.pageName;
      if (this.currentView && this.currentView.pageHash)
        previousPageHash = this.currentView.pageHash;

      // event
      try {
        this.trigger('beforePageChanged', previousPageName, previousPageHash);
      } catch (e) {
        assert(false);
      };

      // creating view
      try {
        view = viewFactory();
      } catch (e) {
        assert(false);
      };

      // closing current view (still in the DOM)
      try {
        if (this.currentView)
          this.currentView.close();
      } catch (e) {
        assert(false);
      };

      // next page name, page hash
      if (view && view.pageName)
        nextPageName = view.pageName;
      if (view && view.pageHash)
        nextPageHash = view.pageHash;

      // acting the change in Router.currentView & Y.GUI.content
      this.currentView = view;
      Y.GUI.content = view;

      // event
      try {
        this.trigger('pageChanged', nextPageName, nextPageHash);
      } catch (e) {
        assert(false);
      };

      // stats.
      Y.Stats.page(previousPageName, nextPageName);
    }
  });

  Y.Router = new Router();
})(Y);