Y.Views.PlayerForm = Y.View.extend({
  el:"#content",
    
  events: {
    // mode "input"
    //'focus input[type="text"]': 'inputModeOn',
    //'blur input[type="text"]': 'inputModeOff',
    //
    'click #savePlayer':'add',
    'keyup #club': 'updateList',
    'click #club_choice' : 'displayClub'
  },
  
  listview:"#suggestions",

  pageName: "playerForm",
  pageHash : "players/form",  
    
  clubs:null,
     

  myinitialize:function() {
  
    this.player = null;  	
          
	//header
    Y.GUI.header.title("MON PROFIL"); 
  
    // loading templates.
    this.templates = {
      layout: Y.Templates.get('empty'),
      playerform:  Y.Templates.get('playerForm'),
      clublist: Y.Templates.get('clubListAutoComplete')
    };
       
    //this.playerFormTemplate = Y.Templates.get('playerForm');
    //this.clubListAutoCompleteViewTemplate = Y.Templates.get('clubListAutoComplete');
    
    this.player_cache = Y.User.getPlayer().toJSON();
    //this.pageHash += this.player.id; 
    //console.log(this.player_cache);
    
    // we render immediatly
    this.render();    
        	

    this.player = new PlayerModel({id : this.player_cache.id});
    this.player.once("sync", this.renderPlayer, this);	
    this.player.fetch();
     	

  },
  
  
  updateList: function (event) {
    var q = $("#club").val();

    //console.log('updateList');	  
   	//Utiliser ClubListViewTemplate
    //$(this.listview).html('<li><a href="" data-transition="slide">Club 1</a></li>');    	
    this.clubs = new ClubsCollection();
    this.clubs.setMode('search',q);
    if (q.length>2) {
      this.clubs.fetch();
      this.clubs.on( 'sync', this.renderList, this );
    }
    //$(this.listview).listview('refresh');
  },
  
  
  render: function () {
    // empty page.
	  this.$el.html(this.templates.layout());
	  return this;
  },
  
    
  renderList: function () {
    var q = $("#club").val();
    	
    console.log(this.clubs.toJSON());
    	
	$(this.listview).html(this.templates.clublist({clubs:this.clubs.toJSON(), query:q}));
	  //$(this.listview).listview('refresh');
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
      
  add: function (event) {
  
    //$.ui.toggleNavMenu(true);
  
    var name = $('#name').val()
      , nickname = $('#nickname').val()
      , password = $('#password').val()
      , email = $('#email').val()
      , rank = $('#rank').val()
      , playerid = $('#playerid').val()
      , token = $('#token').val()
      , club = $('#club').val()
      , clubid = $('#clubid').val()
      , idlicense = $('#idlicense').val()
      , player = null;
           

    var player = new PlayerModel({
        name: name
      , nickname: nickname
      , password: password
      , email: email
      , rank: rank                  	
      , playerid: playerid
      , idlicense:idlicense
      , token: token
      , club: club
      , clubid:clubid            
    });

    console.log('player form envoie ',player.toJSON());

    player.save();
   
    return false;
  },     
    

  //render the content into div of view
  renderPlayer: function(){
    	
    console.log('renderPlayer players',this.player.toJSON());	
    	
    player = this.player.toJSON();
    
    var dataDisplay = {
	      name:player.name
	    , nickname:player.nickname
	    , rank:player.rank
	    , password:player.password
	    , idlicense:player.idlicense
	    , playerid:player.id
	    , token:this.player_cache.token
    };
      
    if (player.club!== undefined) {    
      dataDisplay.club = player.club.name;
      dataDisplay.idclub = player.club.id;      	
    }
    
    if (player.email!== undefined) {    
      dataDisplay.email = player.email.address;    
    }
    else 
      dataDisplay.email = '';
    
    //player:this.player.toJSON(),playerid:Owner.id,token:Owner.token	
    this.$el.html(this.templates.playerform(dataDisplay));
    //this.$el.trigger('pagecreate');
    return this;
  },

  onClose: function(){
    this.undelegateEvents();
    
    //this.player.off("sync",this.renderPlayer,this); 
  }
});