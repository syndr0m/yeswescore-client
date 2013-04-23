var GameModel = Backbone.Model.extend({

  urlRoot : Y.Conf.get("api.url.games"),

  initialize : function() {

    this.updated_at = new Date();

  },

  setSets : function(s) {
    this.sets = s;
  },


  defaults : {
    owner: "",
    sport : "tennis",
    status : "ongoing",
    dates : {
      end : "",
      start : ""
    },   
    location : {
      country : "",
      city : "",
      pos : []
    },
    teams : [ {
      points : "",
      players : [ {
        name : "A"
      } ]
    }, {
      points : "",
      players : [ {
        name : "B"
      } ]
    } ],
    options : {
      type : "singles",
      subtype : "A",
      sets : "0/0",
      score : "0/0",
      court : "",
      surface : "",
      tour : ""
    }
  },

  sync : function(method, model, options) {

    var team1_json = '';
    var team2_json = '';
    
	console.log("1.0");

    // if player exists / not exists
    if (this.get('team1_id') === '')
      team1_json = {
        name : this.get('team1'),
        rank : 'NC'
    };
    else
      team1_json = {
        id : this.get('team1_id')
    };

    if (this.get('team2_id') === '')
      team2_json = {
        name : this.get('team2'),
        rank : 'NC'
    };
    else
      team2_json = {
        id : this.get('team2_id')
    };
    
	//console.log("1.1");
	
    var object = {
      teams : [ {
      id : null,
      players : [ team1_json ]
      }, {
      id : null,
      players : [ team2_json ]
      } ], 
      dates : {},      
      options : {},
      location : {}
     };

	/*
	 console.log("subtype",this.get('subtype'));
	 console.log("sets",this.get('sets'));
	 console.log("score",this.get('score'));
	 console.log("court",this.get('court'));
	 console.log("surface",this.get('surface'));
	 console.log("tour",this.get('tour'));	
	 console.log("country",this.get('country'));	
	 console.log("city",this.get('city'));	
	 */	 	  	 	 	 

	 object.options.type = "singles";	
	 	 
	 if (this.get('subtype') !== undefined)
	   if (this.get('subtype') !== "") 
	     object.options.subtype = this.get('subtype');
	   
	 if (this.get('sets') !== undefined)
       if (this.get('sets') !== "") 
         object.options.sets = this.get('sets');
       
     if (this.get('score') !== undefined)  
       if (this.get('score') !== "") 
         object.options.score = this.get('score');
     
     if (this.get('court') !== undefined)  
       if (this.get('court') !== "") 
         object.options.court = this.get('court');
       
     if (this.get('surface') !== undefined)  
       if (this.get('surface') !== "")
         object.options.surface = this.get('surface');
       
     if (this.get('tour') !== undefined)  
       if (this.get('tour') !== "") 
         object.options.tour = this.get('tour');
       
     if (this.get('country') !== undefined)  
       if (this.get('country') !== "") 
         object.location.country = this.get('country');
       
     if (this.get('city') !== undefined)  
       if (this.get('city') !== "") 
         object.location.city = this.get('city'); 

     if (this.get('start') !== undefined)  
       if (this.get('start') !== "") 
         object.dates.start = this.get('start');     
         
     if (this.get('end') !== undefined)  
       if (this.get('end') !== "") 
         object.dates.end = this.get('end');          
         
     //console.log("1.4");          
     //,pos : [ appConfig.longitude, appConfig.latitude ]

      
    if (method === 'create' && this.get('playerid') !== undefined) {
    
      console.log('create Game', JSON.stringify(object));

      return Backbone.ajax({
        dataType : 'json',
        url : Y.Conf.get("api.url.games") + '?playerid=' + (this.get('playerid') || '')
            + '&token=' + (this.get('token') || ''),
        type : 'POST',
        data : object,
        success : function(result) {
          console.log('data success create Game', result);
          // FIXME : on redirige sur //si offline id , si online sid
          window.location.href = '#games/' + result.id;
        }

      });

    } else if (method === 'update' && this.get('playerid') !== undefined) {
        
        var gameid = this.get('id');
    
        console.log('update Game', JSON.stringify(object));    	
		var that = this;
		
        return Backbone.ajax({
          dataType : 'json',
          url : Y.Conf.get("api.url.games") + gameid + '/?playerid=' + (this.get('playerid') || '')
            + '&token=' + (this.get('token') || ''),
          type : 'POST',
          data : object,
          success: function (data) {
            that.set(data);
            if (options && options.success) {
              console.log('success in backbone ajax model');
              options.success(data);
            }
          },
          error: function (message) {
            if (options && options.error)
              console.log('error in backbone ajax model');              
              options.error(message);
          }               
       });

    } else {
      
      model.url = Y.Conf.get("api.url.games")+this.id;
      return Backbone.sync(method, model, options);
      
    }      
    
    
  }

});
