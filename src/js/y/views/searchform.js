Y.Views.SearchForm = Y.View.extend({
  el:"#content",
    
  events: {
  
    'click #updateSearch':'update',
    'keyup #club': 'updateList',
    "click #searchgeo":"update",
    "click #searchclub":"update", 
    "click #searchgamefollowed":"update",        
    'click #club_choice' : 'displayClub'
      
  },
  

  pageName: "searchForm",
  pageHash : "search/form",  
    
  clubs:null,
  useSearch:null,
  
  shareTimeout: null,    

  initialize:function() {

	//header
    Y.GUI.header.title(i18n.t('search.title')); 
    
    //no search
    this.useSearch=0;
  
    //this.gameFormTemplate = Y.Templates.get('gameForm');
    //this.clubListAutoCompleteViewTemplate = Y.Templates.get('clubListAutoComplete');
    
  	this.templates = {
	    searchform:  Y.Templates.get('searchForm')
	  };    
    
    this.owner = Y.User.getPlayer();    
    this.token = this.owner.get('token');
    this.playerid = this.owner.get('id');  

	this.render();
  
  },
   
      
  update: function (event) {

	console.log("event: "+event.currentTarget.id);
	console.log("state: ",event.currentTarget);	
	
	
    /*
	if (o==='geolocation') 
      $('.filters #filter-match-geo').addClass('select');
 	
 	if (o==='not') 
  	  $('.filters #filter-match-not').addClass('select'); 
 	
 	if (o==='club') 
      $('.filters #filter-match-club').addClass('select'); 
      */
      
    Y.User.setFiltersSearch(event.currentTarget.id);         

    
  },     
    

  //render the content into div of view
  render: function(){
  
    this.$el.html(this.templates.searchform({}));
  
    this.$el.i18n();
    
    $(".filters a[data-filter*='match-']").removeClass('select');
      
   
  },

  onClose: function(){
    this.undelegateEvents();
    
    if (this.shareTimeout) {
      window.clearTimeout(this.shareTimeout);
      this.shareTimeout = null;
    }    
  }
});