Y.Views.Autocomplete = Y.View.extend({
  el:  "#autocomplete",
  listview : '#listautocomplete',
  
  proposals: null, /* @see y/autocomplete.js */

  events: {
    // Hack. mousedown is triggered before blur in the GUI.
    'mousedown .proposal': 'selected',
    'mousedown .autocomplete-club': 'selected',
    'mousedown .autocomplete-player': 'selected',    
    'click .button-close': 'exitOverlay'
  },

  myinitialize: function (param) {
    
    this.templates = {
      page:  Y.Templates.get('page-autocomplete'),    
      player:  Y.Templates.get('autocomplete-player'),
      club  :  Y.Templates.get('autocomplete-club')      
    };
    
  },
  render: function () { 
  
    return this; 
  },
  
  autocompletePlayer: function (input, callback) {
    if (input.indexOf('  ')!==-1 || input.length<= 1 )
      callback('empty');    
    
    Backbone.ajax({
      url: Y.Conf.get("api.url.autocomplete.players"),
      type: 'GET',
      dataType : 'json',
      data: { q: input }
    }).done(function (players) {
      if (players && _.isArray(players) && players.length>0) {
        callback(null, players.splice(0, 3).map(function (p) {
          p.text = p.name; 
          return p; 
        }));
      } else {
        callback(null, []);
      }
    }).fail(function (xhr, error) { 
      callback(error);
    });
  },

  autocompletePlayerSelected: function (data) {
    if (data && data.name) {
      $("#team2").val(data.name);
      this.team1_id = data.id;
      $('body').removeClass("autocomplete");
      //quit -> dispose
    }
  },  

  autocomplete: null,
  
  setRender: function (type,elmt,fctname,fctnameselected) {   
    console.log('setRender');
    
    this.elmt = elmt;   
  
    this.$el.html(this.templates.page({
      type             : type,
      elmt             : elmt,
      fctname          : fctname,
      fctnameselected  : fctnameselected      
    }));     
  },
  
  exitOverlay: function () {
    $('body').removeClass("autocomplete"); 
  },  
  
  setProposals: function (autocomplete, proposals, type, elmt) {
    assert(autocomplete instanceof Y.Autocomplete);
    assert(_.isArray(proposals));

    // refs.
    this.autocomplete = autocomplete;
    this.proposals = proposals;
    
    // empty GUI.
    this.$(this.listview).empty();
    
    // creating list of proposals
    this.proposals.forEach(function (proposal, i) {
      var text = null;
            
      if (proposal) {
        if (typeof proposal === "string")
          text = proposal;
        if (typeof proposal === "object" && proposal.text)
          text = proposal.text;
      }
      if (!text)
        return; // nothing to display.
        
      console.log('type',type);  
      
      if (type==="player") {
      
        var object = {
          id        : proposal.id
          , number  : i
          , rank    : proposal.rank || ''
          , name    : proposal.name || ''
        };       
        
        if (proposal.hasOwnProperty('club'))
          object.club = proposal.club.name;
        else
          object.club = '';
          
        if (typeof proposal.profile !== "undefined")
          if(proposal.profile.image!=="")
            object.picture = PlayerModel.getExtractImageUrl(proposal.profile.image);
          else
            object.picture = Y.Conf.get("gui.image.placeholder.profil");                
        else
          object.picture = Y.Conf.get("gui.image.placeholder.profil");      
      
                  
        //console.log('autocomplete',object);                    
                  
		this.$(this.listview)
		.append(this.templates.player(object));    
		//TODO : On passe tout dans la liste
		   
        //.append('<br/>Test');
        //console.log('el',this.$el);
        //console.log('autocomplete.js',object);
              
      }     
      else if (type==="club") {

        var object = {
          id        : proposal.id
          , number  : i
          , picture : Y.Conf.get("gui.image.placeholder.profil")
          , name    : proposal.name || ''          
        }; 
        
        if (proposal.hasOwnProperty('location'))
          object.city = proposal.location.city;
        else
          object.city = '';    
          
          
		//this.$el
		//.append(this.templates.club(object));         
		this.$(this.listview)
		.append(this.templates.club(object));      
              
      }
      //OLD CPDE
      //else
	  //	this.$el.append($('<div class="proposal" data-index="'+ i +'">')
      //  .html(text));
            
    }, this);
  },
  

  autocompletePlayers: function (input, callback) {
    if (input.indexOf('  ')!==-1 || input.length<= 1 )
      callback('empty');    
    
    Backbone.ajax({
      url: Y.Conf.get("api.url.autocomplete.players"),
      type: 'GET',
      dataType : 'json',
      data: { q: input }
    }).done(function (players) {
      if (players && _.isArray(players) && players.length>0) {
        callback(null, players.splice(0, 3).map(function (p) {
          p.text = p.name; 
          return p; 
        }));
      } else {
        callback(null, []);
      }
    }).fail(function (xhr, error) { 
      callback(error);
    });
  },
  
  autocompleteClubs: function (input, callback) {
    if (input.indexOf('  ')!==-1 || input.length<= 1 )
      callback('empty');    
    
    // assuming the fact that changing club input => reset.
    this.clubid = ''; 
    //
    Backbone.ajax({
      url: Y.Conf.get("api.url.autocomplete.clubs"),
      type: 'GET',
      dataType : 'json',
      data: { q: input }
    }).done(function (clubs) {
      if (clubs && _.isArray(clubs) && clubs.length>0) {
        callback(null, clubs.splice(0, 3).map(function (p) { p.text = p.name; return p; }));
      } else {
        callback(null, []);
      }
    }).fail(function (xhr, error) { 
      callback(error);
    });
  },  
  
  
  autocompleteFake: function (data) {

  },
  
 

  // FIXME:
  // This function should be inlined in setProposals
  //  but we will not have fast-click (no backbone touch ...)
  //  so we prefer to leave it outside, until we can speed up any clicks.
  //  BUT, this actualy leads to memory managment tricks
  //    autocompleteObj must unregister itself from this class, when disposed.
  selected: function (e) {

    var index = $(e.target).attr('data-index');

    if (this.autocomplete) {
      this.$("#"+this.elmt).val(this.proposals[index]);    
      this.autocomplete.trigger("selected", this.proposals[index]);         
    }    
      
    this.exitOverlay();
        
  }
  
});