var ClubModel = Backbone.Model.extend({

  urlRoot : Y.Conf.get("api.url.clubs"),

  mode : '',
  
  defaults : {
    sport : "tennis",
    name : "",
    ligue : "",
    zip : "",
    outdoor : 0,
    indoor : 1,
    countPlayers : 0,
    countPlayers1AN : 0,
    countTeams : 0,
    countTeams1AN : 0,
    school : "",
    location : {
      address : "",
      city : "",
      pos : [ 0, 0 ]
    },
    dates : {
      update : "",
      creation : new Date()
    },
    updated_at : new Date()
  },  

  initialize : function() {

  },

  sync : function(method, model, options) {

    /*
     * var params = _.extend({ type: 'GET', dataType: 'json', url: model.url(),
     * processData:false }, options);
     * 
     * return $.ajax(params);
     */
    if (method === 'create' && this.get('playerid') !== undefined) {


      var object = {
          
          sport: "tennis",
          name: this.get('name'),
          location : {
            pos: (this.get('pos') || ''),
            address: (this.get('address') || ''),
            zip: (this.get('zip') || ''),
            city: (this.get('city') || '')
          }
         
      };

      console.log('tmp Club POST', JSON.stringify(object));

      return $.ajax({
        dataType : 'json',
        url : Y.Conf.get("api.url.clubs"),
        type : 'POST',
        data : object,
        success : function(result) {
          console.log('data result Club', result);
          
          if (data.id !== null)
            $('span.success').html('Enregistrement OK ' + data.id).show();
          else
            $('span.success').html('Erreur').show();
          
        }
      });

    }
    else {
      model.url = Y.Conf.get("api.url.clubs")+this.id;
      return Backbone.sync(method, model, options);
    }

  }


});
