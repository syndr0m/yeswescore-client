Y.Views.GameForm = Y.View.extend({
  el:"#content",
    
  events: {
    // mode "input"
    'focus input[type="text"]': 'inputModeOn',
    'blur input[type="text"]': 'inputModeOff',
    //
    'click #deleteMatch':'deleteMatch',    
    'click #updateGame':'update',
    'keyup #club': 'updateList',
    'click #club_choice' : 'displayClub'
      
  },
  
  listview:"#suggestions",

  pageName: "gameForm",
  pageHash : "games/form",  
    
  clubs:null,
  useSearch:null,
  
    shareTimeout: null,    

  initialize:function() {

	//header
    Y.GUI.header.title(i18n.t('gameform.title')); 
    
    //no search
    this.useSearch=0;
  
    //this.gameFormTemplate = Y.Templates.get('gameForm');
    //this.clubListAutoCompleteViewTemplate = Y.Templates.get('clubListAutoComplete');
    
  	this.templates = {
	    gameform:  Y.Templates.get('gameForm'),
	    gameselect:  Y.Templates.get('gameSelect'),	    
	    gameinput:  Y.Templates.get('gameInput'),	      
	    playerlist: Y.Templates.get('playerListAutoComplete')
	  };    
    
    this.owner = Y.User.getPlayer();    
    this.token = this.owner.get('token');
    this.playerid = this.owner.get('id');  
    this.gameid = this.id;     
    
     
	
	this.game = new GameModel({id : this.id});  	                  
    this.game.once("sync",this.render,this);
    this.game.fetch(); 
  
  },
   
  
  updateList: function (event) {
    var q = $("#club").val();  	
    this.clubs = new ClubsCollection();
    this.clubs.setMode('search',q);
    if (q.length>2) {
      this.clubs.fetch();
      this.useSearch=1
      this.clubs.on( 'sync', this.renderList, this );
    }
  },
    
  renderList: function () {
    var q = $("#club").val();
 	
	$(this.listview).html(this.clubListAutoCompleteViewTemplate({clubs:this.clubs.toJSON(), query:q}));

  },
    
    
  displayClub: function(li) {
    selectedId = $('#club_choice:checked').val();
    selectedName = $('#club_choice:checked').next('label').text();
    	
    $('#club').val(selectedName);
    //FIXME : differencier idclub et fftid
    $('#clubid').val(selectedId); 
    $('club_error').html('');
    	
    //console.log('selected '+selectedId+' '+selectedName);
    	
    $(this.listview).html('');
    //$(this.listview).listview('refresh');
  },

  deleteMatch: function (event) {

    return Backbone.ajax({
      dataType : 'json',
      url : Y.Conf.get("api.url.games") + this.id + '/?playerid='+this.playerid+'&token='+this.token+'&_method=delete',
      type : 'POST',
      success : function(result) {

        Y.Router.navigate('/games/add', {trigger: true});	   
      }
    });  
  
  },
      
  update: function (event) {

    //FIXME : gestion date de debut
    var owner1 = $('#owner1').val();
    var owner2 = $('#owner2').val();    
    
    var game = {
      team1_id : this.team1_id
	  , team1 : $('#team1').val()
      , rank1 : $('#rank1').val()
      , team2_id : this.team2_id            
      , team2 : $('#team2').val()
      , rank2 : $('#rank2').val()     
      , city : $('#city').val()
      , playerid : this.playerid
      , token : this.token
      , court : $('#court').val()
      , surface : $('#surface').val()
      , tour : $('#tour').val()
      //, subtype : $('#subtype').val()
      , id : this.gameid 
	};
    
    
    if (checkName(team1) && team1.length>0) {     
	  $('span.team1_error').html(i18n.t('message.bad_name')+' !').show();
      $('#team1').val('');        
      return false;	   
    };
    
    if (checkName(team2) && team2.length>0) { 
	  $('span.team2_error').html(i18n.t('message.bad_name')+' !').show();
      $('#team2').val('');        
      return false;	   
    };
    
    
    if (checkRank(rank1) && rank1.length>0) {
	  $('span.team1_error').html(i18n.t('message.bad_rank')+' !').show();
      $('#rank1').val('');        
      return false;	   
    };    
    
    if (checkRank(rank2) && rank2.length>0) {
	  $('span.team2_error').html(i18n.t('message.bad_rank')+' !').show();
      $('#rank2').val('');        
      return false;	   
    };          

    var game = new GameModel(game);   
    var that = this;
    
    //3 defered
    this.gameDeferred = $.Deferred();
    this.owner1Deferred = $.Deferred();
    this.owner2Deferred = $.Deferred();
    
    console.log();
    
    game.save({}, {  
      success: function(model, response){	    
		that.gameDeferred.resolve();	                 
      }
    });
    
    if (owner1 !== "") {
      //FIXME : load player
      
      var player1 = new PlayerModel({
        name: team1
      , rank: rank1                  	
      , playerid: this.playerid
      , playeridupdated : owner1
      , token: this.token       
      });
      

	    player1.save({}, {  
	      success: function(model, response){	    
			that.owner1Deferred.resolve();	                 
	      }
	    });
      
    }
    else 
      this.owner1Deferred.resolve();
      
    if (owner2 !== "") {
    
      var player2 = new PlayerModel({
        name: team2
      , rank: rank2                  	
      , playerid: this.playerid
      , playeridupdated : owner2
      , token: this.token       
      });
      
	    player2.save({}, {  
	      success: function(model, response){	    
			that.owner2Deferred.resolve();	                 
	      }
	    });      
      
    }
    else 
      this.owner2Deferred.resolve();      
    
    $.when(
      this.gameDeferred,
      this.owner1Deferred,
      this.owner2Deferred
    ).done(function () {

	    $('span.success').css({display:"block"});
	    $('span.success').html(i18n.t('message.updateok')).show();
	    that.game = model;
	    
		that.shareTimeout = window.setTimeout(function () {
	      		Y.Router.navigate("games/"+that.gameid, {trigger: true});
	      		that.shareTimeout = null;
	    	}, 2000);
            
    });

	return this;
    
  },     
    

  //render the content into div of view
  render: function(){
  
   var game = this.game.toJSON();
   
   this.team1_id = game.teams[0].players[0].id; 
   this.team2_id = game.teams[1].players[0].id;
   

    this.$el.html(this.templates.gameform({
          game : game
          , selection : i18n.t('gameadd.selection')
	      , surface : i18n.t('gameadd.surface')
    }));
    
   	 var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	 var isGingerbread = /android 2\.3/i.test(userAgent);
	 if (!isGingerbread) {
		 $('#inject-select').prepend(this.templates.gameselect({ 
		    selection : i18n.t('gameadd.selection')
		    , surface : i18n.t('gameadd.surface')
	     })); 
	 }
	 else {
		 $('#inject-select').prepend(this.templates.gameinput()); 	   
	 
	 }
	 

    if ( game.teams[0].players[0].name !== undefined ) $("#team1").val(game.teams[0].players[0].name);    
    if ( game.teams[0].players[0].rank !== undefined ) $("#rank1").val(game.teams[0].players[0].rank);    
    if ( game.teams[1].players[0].name !== undefined ) $("#team2").val(game.teams[1].players[0].name);    
    if ( game.teams[1].players[0].rank !== undefined ) $("#rank2").val(game.teams[1].players[0].rank);                

    if ( game.teams[0].players[0].owner !== undefined && this.playerid === game.teams[0].players[0].owner ) 
      $("#owner1").val(game.teams[0].players[0].owner);    
    if ( game.teams[1].players[0].owner !== undefined && this.playerid === game.teams[1].players[0].owner ) 
      $("#owner2").val(game.teams[1].players[0].owner);  
    
    if (!isGingerbread) {
	    if ( game.location.city !== undefined ) $("#city").val(game.location.city);    
	    if ( game.infos.surface !== undefined ) $("#surface").val(game.infos.surface);
	    if ( game.infos.tour !== undefined ) $("#tour").val(game.infos.tour);
	    if ( game.infos.court !== undefined ) $("#court").val(game.infos.court);
    }
    if ( game.infos.competition !== undefined ) $("#competition").val(game.infos.competition);        
        
    this.$el.i18n();
      
   
  },

  onClose: function(){
    this.undelegateEvents();

    this.game.off("sync",this.render,this);
    if (this.useSearch===1) this.clubs.off("sync",this.renderList,this);
    
    if (this.shareTimeout) {
      window.clearTimeout(this.shareTimeout);
      this.shareTimeout = null;
    }    
  }
});