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

  initialize:function() {

	//header
    Y.GUI.header.title(i18n.t('gameform.title')); 
    
    //no search
    this.useSearch=0;
  
    this.gameFormTemplate = Y.Templates.get('gameForm');
    this.clubListAutoCompleteViewTemplate = Y.Templates.get('clubListAutoComplete');
    
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
    //console.log(this.clubs.toJSON());   	
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

    console.log('deleteMatch');    
    
     this.owner = Y.User.getPlayer().toJSON();
  
	///v1/games/:id/?_method=delete
    return Backbone.ajax({
      dataType : 'json',
      url : Y.Conf.get("api.url.games") + this.id + '/?playerid='+this.owner.id+'&token='+this.owner.token+'&_method=delete',
      type : 'POST',
      success : function(result) {
        console.log('data success delete Game', result);
        
        Y.Router.navigate('/games/add', {trigger: true});	   
      }
    });  
  
  },
      
  update: function (event) {
  
    console.log('update');  
    
    //FIXME : gestion date de debut
    var game = {
	   team1 : $('#team1').val()
      , rank1 : $('#rank1').val()
      , team1_id : this.team1_id
      , team2 : $('#team2').val()
      , rank2 : $('#rank2').val()
      , team2_id : this.team2_id
      , country : $('#country').val()	      
      , city : $('#city').val()
      , playerid : this.owner
      , token : this.token
      , court : $('#court').val()
      , surface : $('#surface').val()
      , tour : $('#tour').val()
      , subtype : $('#subtype').val()
      , id : this.gameid 
	};
    

    var game = new GameModel(game);
    
    var that = this;
    game.save({}, {  
      success: function(model, response){
	    
	    $('span.success').html('MAJ OK ').show();
	    that.game = model;
	                 
      }

	return this;
    
  },     
    

  //render the content into div of view
  render: function(){
  
   var game = this.game.toJSON();
   
   console.log('game render',game);
  
   this.team1_id = game.teams[0].players[0].id; 
   this.team2_id = game.teams[1].players[0].id;
     
    this.$el.html(this.gameFormTemplate({
          game : game
          , selection : i18n.t('gameadd.selection')
	      , surface : i18n.t('gameadd.surface')
    }));
    
    
    this.$el.i18n();
      
   
  },

  onClose: function(){
    this.undelegateEvents();

    this.game.off("sync",this.render,this);
    if (this.useSearch===1) this.clubs.off("sync",this.renderList,this);
  }
});