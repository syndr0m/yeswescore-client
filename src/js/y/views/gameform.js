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
     

  initialize:function() {

    Y.GUI.header.title("MES OPTIONS"); 
  
    this.gameFormTemplate = Y.Templates.get('gameForm');
    this.clubListAutoCompleteViewTemplate = Y.Templates.get('clubListAutoComplete');
    
	this.Owner = Y.User.getPlayer();
	
	this.score = new GameModel({id : this.id});
    this.score.fetch();
  	                  
    this.score.once("sync",this.render,this);
 
  
  },
   
  
  updateList: function (event) {
    var q = $("#club").val();  	
    this.clubs = new ClubsCollection();
    this.clubs.setMode('search',q);
    if (q.length>2) {
      this.clubs.fetch();
      this.clubs.on( 'sync', this.renderList, this );
    }
  },
    
  renderList: function () {
    var q = $("#club").val();
    	
    console.log(this.clubs.toJSON());
    	
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
    
     this.Owner = Y.User.getPlayer().toJSON();
  
	///v1/games/:id/?_method=delete
    return Backbone.ajax({
      dataType : 'json',
      url : Y.Conf.get("api.url.games") + this.id + '/?playerid='+this.Owner.id+'&token='+this.Owner.token+'&_method=delete',
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
      , team1_id : $('#team1_id').val()
      , team2 : $('#team2').val()
      , rank2 : $('#rank2').val()
      , team2_id : $('#team2_id').val()
      , country : $('#country').val()	      
      , city : $('#city').val()
      , playerid : $('#playerid').val()
      , token : $('#token').val()
      , court : $('#court').val()
      , surface : $('#surface').val()
      , tour : $('#tour').val()
      , subtype : $('#subtype').val()
      , id : gameid 
	};
    

    var tennis_update = new GameModel(game);
    tennis_update.save();

	return false;
    
  },     
    

  //render the content into div of view
  render: function(){
  
    this.$el.html(this.gameFormTemplate({
          game : this.score.toJSON(),
          Owner : this.Owner.toJSON()
    }));
      
   
  },

  onClose: function(){
    this.undelegateEvents();
    this.player.off("sync",this.render,this); 
  }
});