Y.Views.GameList = Y.View.extend({
  el: "#content",

  events: {
    // mode "input"
    "keyup input#search-basic": "searchOnKey",
    "mousedown .button-search": "searchButton",
    "click li": "goToGame",
    'click .button-option-down': 'showFilters',
    
    'click a[data-filter="match-geo"]': 'searchWithGeo',
    'click a[data-filter="match-followed"]': 'searchWithFollowed',    
    'click a[data-filter="match-club"]': 'searchWithClub',
        
    'click a[data-filter="filter-date"]': 'filterByDate',
    'click a[data-filter="filter-location"]': 'filterByLocation',    
    'click a[data-filter="filter-club"]': 'filterByClub'
  },

  listview: "#listGamesView",

  pageHash : "games/list",
  filterList: "",
  searchBy: "",  
  sort: "",
  
  myinitialize: function (param) {
  	
  	//FIXME: refacto
  	param.mode = Y.User.getFilters();
  	param.search = Y.User.getSearchBy();
  	
	//header 
    if (param!=='undefined') { 
      if (param.mode==="me") {
        Y.GUI.header.title(i18n.t('gamelist.titleyourgames'));
        this.pageName = "gameListByMe";
      }
      else if (param.mode==="club") {
        Y.GUI.header.title(i18n.t('gamelist.titleclubsgames')); 
        this.pageName = "gameListByClub";        
      }  
      else {
        Y.GUI.header.title(i18n.t('gamelist.titlegames'));  
        this.pageName = "gameList";
      }  
    }
	else {
	  Y.GUI.header.title(i18n.t('gamelist.titlegames'));
      this.pageName = "gameList";	  
    }
	
    var that = this;
    //  
    
    
    this.templates = {
      gamelist:  Y.Templates.get('gameList'),
      gamesearch: Y.Templates.get('gameListSearch'),
      error: Y.Templates.get('error')      
    };
    

    //we capture config from bootstrap
    //FIXME: put a timer
    //this.config = new Config();
    //this.config.fetch();

    // we need to do 2 things 
    // - fetch games
    // - read/create the player
    // THEN
    //  render games & player.

    // first: fetch games
    this.gameDeferred = $.Deferred();
    this.games = new GamesCollection();

    if (param!=='undefined') {
    
    	// Mode : my games, games followed /
	    if (param.mode !== '')
	      this.games.setMode(param.mode,param.id);
	      
	    if (param.sort !== '') {
	      this.games.setSort(param.sort);
		  this.sort = param.sort;  	  
	    }
	      
     }    
      
            
    this.games.on('sync', this.gameDeferred.resolve, this.gameDeferred);
    this.games.fetch();

    // second: read/create player
    var playerDeferred = $.Deferred();
    this.$el.html("<span style=\"top:50px\">"+i18n.t('message.noconnection')+"</span>");
    Y.User.getPlayerAsync(function (err, player) {
      if (err) {
        // no player => creating player.
        //console.log('error reading player ', err);
        // creating the player.
        Y.User.createPlayerAsync(function (err, player) {
          // FIXME: err, reject deferred
          //console.log('player created', player);
          playerDeferred.resolve();
        });
        return;
      }
      playerDeferred.resolve();
    });

    // FIXME: handling error with deferreds
    $.when(
      this.gameDeferred,
      playerDeferred
    ).done(function () {
      that.render();
      that.renderList();
    });
      
  },


  goToGame: function (elmt) {
    if (elmt.currentTarget.id) {
      var route = elmt.currentTarget.id;
      Y.Router.navigate(route, {trigger: true}); 
    }
  },

  showFilters: function () {
    this.$(".filters").show();
  },
  hideFilters: function () {
    this.$(".filters").hide();
  },


  filterByLocation: function () { 
    this.filter("location");
    Y.Router.navigate("sort/location", true);
  },
  
  searchWithGeo: function () {   	
  	//this.filter("date");
  	Y.User.setSearchBy('geo');
  	//Y.Router.navigate("sort/date", true);
  },
  
  searchWithFollowed: function () {   	
  	//this.filter("date");
  	Y.User.setSearchBy('followed');
  	//Y.Router.navigate("sort/date", true);
  },
  
  searchWithClub: function () {   	
  	//this.filter("date");
  	Y.User.setSearchBy('club');
  	//Y.Router.navigate("sort/date", true);
  },    
  
  filterByDate: function () {   	
  	this.filter("date");
  	Y.User.setFilters('date');
  	Y.Router.navigate("sort/date", true);
  },
  
  filterByClub: function () {  	  
    this.filterBy("club");
  	Y.User.setFilters('club');
    Y.Router.navigate("sort/club", true);
  },  
  filterByOngoing: function () { 
    this.filterBy("ongoing");
  	Y.User.setFilters('ongoing');
    Y.Router.navigate("sort/ongoing", true); 
  },
  filterByFinished: function () { 
    this.filterBy("finished");    
  	Y.User.setFilters('finished');
    Y.Router.navigate("sort/finished", true); 
  },

  filter: function (o) {
    // FIXME
    //console.log('FIXME: filter by ' + o);
    this.filterList = o;
    this.hideFilters();
  },

  filterBy: function (o) {
    // FIXME
    //console.log('FIXME: filter by ' + o);
    this.searchBy = o;
    this.hideFilters();
  },

  searchButton: function () {
    this.inputModeOff();
    this.search();
  },

  searchOnKey: function (event) {
    if(event.keyCode == 13){
      // the user has pressed on ENTER
      this.search();
    }
    return this;
  },

  search: function () {
    var q = $("#search-basic").val();
    $(this.listview).html(this.templates.error());
    $('p').i18n(); 
    this.games.setMode('player');
    this.games.setQuery(q);
    this.games.fetch().done($.proxy(function () {    
      $(this.listview).html(this.templates.gamelist({ games: this.games.toJSON(), query: q }));
    }, this));
    
    return this;
  },

  // should not take any parameters
  render: function () {
    this.$el.html(this.templates.gamesearch({}));   
    $('a').i18n();    
	      
	if (this.sort==='date') 
      $('.filters #filter-date').addClass('select');
 	else if (this.sort==='location') 
  	  $('.filters #filter-location').addClass('select'); 
 	else if (this.sort==='club') 
      $('.filters #filter-club').addClass('select');      
    
    return this;
  },

  // should not take any parameters
  renderList: function () {
    $(this.listview).html(this.templates.gamelist({ games: this.games.toJSON(), query: ' ' }));
    $('p.message').i18n();
    return this;
  },

  onClose: function () {
    this.undelegateEvents();
    this.games.off('sync', this.gameDeferred.resolve, this.gameDeferred);
  }
});