var GameModel = Backbone.Model.extend({
  urlRoot : Y.Conf.get("api.url.games"),

  version: 0,

  initialize : function() {
    this.updated_at = new Date();
  },

  setSets : function(s) {
    this.sets = s;
  },

  defaults : {
    owner: "",
    sport : "tennis",
    status : "",
    dates : {
      end : "",
      start : ""
    },   
    location : {
      country : "",
      city : ""
    },
    teams : [ {
      points : "",
      players : [ {
        name : ""
      } ]
    }, {
      points : "",
      players : [ {
        name : ""
      } ]
    } ],
    infos : {
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
    this.version++;
    options.version = this.version;
    var that = this;
    var team1_json = null;
    var team2_json = null;
    
    // if player exists / not exists
    if (this.get('team1_id')) {
      team1_json = {
        id : this.get('team1_id')
      };
    } else if (this.get('team1')) {
      team1_json = {
        name : this.get('team1'),
        rank : this.get('rank1')
      };
    }

    if (this.get('team2_id')) {
      team2_json = {
        id : this.get('team2_id')
      };
    } else if (this.get('team2')) {
      team2_json = {
        name : this.get('team2'),
        rank : this.get('rank2')
      };
    }
    
    var object = {
      infos : {}
    , location : {}
    };

    if (team1_json && team2_json) {
      object.teams = [ {
        id : null,
        players : [ team1_json ]
      }, {
        id : null,
        players : [ team2_json ]
      } ];
    }
	 
    object.infos.type = "singles";	
     if (this.get('city')) 
       object.location.city = this.get('city');
     if (this.get('start'))
       object.dates.start = this.get('start');
     if (this.get('end'))
       object.dates.end = this.get('end');
     if (this.get('status'))
       object.status = this.get('status');
    ['subtype', 'sets', 'score', 'court', 'surface',
     'tour', 'country', 'startTeam'].forEach(function (k) {
      if (this.get('infos')[k])
        object.infos[k] = this.get('infos')[k];
    }, this);
    if (Y.Geolocation.longitude!==null && Y.Geolocation.latitude!==null)      
      object.location.pos = [Y.Geolocation.longitude, Y.Geolocation.latitude];
      


    if (method === 'create' && options.playerid !== undefined) {
      return Backbone.ajax({
        dataType : 'json',
        url : Y.Conf.get("api.url.games") + '?playerid=' + options.playerid + '&token=' + options.token,
        type : 'POST',
        data : object,
        success : function(data) {
          // FIXME : on redirige sur //si offline id , si online sid  
          that.set(data);         
          if (options && options.success)
            options.success(data);
        },
        error: function (message) {
          if (options && options.error)
            options.error(message);
        }
      });
    } else if (method === 'update' && options.playerid !== undefined) {
      
      console.log('on met à jour game avec ', object); 
		
      return Backbone.ajax({
        dataType : 'json',
        url : Y.Conf.get("api.url.games") + this.get('id') + '/?playerid=' + options.playerid + '&token=' + options.token,
        type : 'POST',
        data : object,
        success: function (data) {
          // WARNING WARNING
          // tricky: on aura des effets de bord un jour ...
          //  on rend l'update des données du modèle conditionnelle à la version
          if (options.version === that.version)
            that.set(data);
          //
          if (options && options.success)
            options.success(data);
        },
        error: function (message) {
          if (options && options.error)
            options.error(message);
        }
      });
    } else {
      model.url = Y.Conf.get("api.url.games")+this.id;
      return Backbone.sync(method, model, options);
    }
  },

  getPlayersNamesByTeam: function (teamIndex) {
    var team = _.isArray(this.get("teams")) ? this.get("teams")[teamIndex] : null;
    if (!team)
      return "";
    return _.reduce(team.players, function (result, player) {
      return result ? result + ", " + player.name : player.name;
    }, "");
  },

  // @return 0,1, -1 if draw / null if error or non defined
  getIndexWinningTeam: function () {
    var score = this.get("infos").score; 
    if (typeof score !== "string")
      return null;
    var scoreDetails = score.split("/");
    if (scoreDetails.length !== 2)
      return null;
    var scoreTeamA = parseInt(scoreDetails[0], 10);
    var scoreTeamB = parseInt(scoreDetails[1], 10)
    if (scoreTeamA == NaN || scoreTeamB == NaN)
      return null;
    if (scoreTeamA == scoreTeamB)
      return -1; // draw
    if (scoreTeamA < scoreTeamB)
      return 1; // team B is winning
    return 0; // team A is winning
  },

  isMine: function () {
    return this.get('owner') === Y.User.getPlayer().get('id');
  },

  whoServe: function () {
    var sets = this.get('infos').sets || "0/0";
    var startTeam = this.get('infos').startTeam;
    var total; 
    
    if (sets.indexOf(';') !== -1) {
      total = _.reduce(sets.split(';'), function (p, tab) {
        return _.reduce(tab.split('/'), function (p, val) {
          return p + parseInt(val, 10);
        }, p);
      }, 0);
    } else {
      total = _.reduce(sets.split('/'), function (p, val) {
        return p + parseInt(val, 10);
      }, 0);
    }

    if (total % 2 === 0)
      return startTeam;
    return ""; // FIXME, should be the other team.
  },

  getSet: function (index) {

  },

  // transform internal format : 6/2;2/2 into [ [ 6, 2 ], [ 2, 2 ] ]
  getSets: function (padding) {
    var sets = this.get("infos").sets || "0/0";
    sets = sets.split(';').map(function (set) {
      return set.split('/').map(function (num) {
        return parseInt(num, 10);
      });
    });
    if (typeof padding !== "undefined") {
      for (var i = 0; i < 3; ++i) {
        if (typeof sets[i] === "undefined")
          sets[i] = [padding, padding];
      }
    }
    return sets;
  },

  setSets: function (sets) {
    sets = sets.map(function (set) { return set.join('/') }).join(';');
    this.get("infos").sets = sets; //FIXME: might not be the right "backbone way of doing things"
  },

  getScore: function () {
    var score = this.get("infos").score || "0/0";
    return score.split('/').map(function (num) {
      return parseInt(num, 10);
    });
  },

  // compute score based on sets.
  // @return "scoreTeam1/scoreTeam2"
  computeScore : function() { 
    var scoreTeam1 = 0;
    var scoreTeam2 = 0;
    var sets = this.getSets();
    
    // set1 : only if game is finished or set2 exists & not empty
    if (this.isFinished() || (sets.length > 1 && sets[1][0] + sets[1][1] !== 0)) {
      // team 2 < team 1 && team 1 >= 6
      if (sets[0][1] < sets[0][0] && sets[0][0] >= 6)
        scoreTeam1++;
      // team 1 < team 2 && team 2 >= 6
      if (sets[0][0] < sets[0][1] && sets[0][1] >= 6)
        scoreTeam2++;
    }

    // set2 : only if game is finished or set3 exists & not empty
    if (this.isFinished() || (sets.length > 2 && sets[2][0] + sets[2][1] !== 0)) {
      // team 2 < team 1 && team 1 >= 6
      if (sets[1][1] < sets[1][0] && sets[1][0] >= 6)
        scoreTeam1++;
      // team 1 < team 2 && team 2 >= 6
      if (sets[1][0] < sets[1][1] && sets[1][1] >= 6)
        scoreTeam2++;
    }

    // set3 : only if game is finished.
    if (this.isFinished) { 
      // team 2 < team 1 && team 1 >= 6
      if (sets[2][1] < sets[2][0] && sets[2][0] >= 6)
        scoreTeam1++;
      // team 1 < team 2 && team 2 >= 6
      if (sets[2][0] < sets[2][1] && sets[2][1] >= 6)
        scoreTeam2++;
    }

    return scoreTeam1+"/"+scoreTeam2;
  },

  getElapsedTime: function () {
    var dateEnd, dateStart, elapsed;

    if (this.isFinished()) {
      dateEnd = Date.fromString(this.get('dates').end);      
      dateStart = Date.fromString(this.get('dates').start);
      elapsed = dateEnd - dateStart;
      if (elapsed > 0) {
        elapsed = new Date(0, 0, 0, 0, 0, 0, elapsed);
        return ('0'+elapsed.getHours()).slice(-2)+':'+('0'+elapsed.getMinutes()).slice(-2);  
      }
    }
    if (this.isOngoing()) {
      //comment connaitre la date actuelle par rapport au serveur ?
      dateEnd = new Date();
      dateStart = Date.fromString(this.get('dates').start);
      elapsed = dateEnd - dateStart;
      if (elapsed>0)
      {
	      elapsed = new Date(0, 0, 0, 0, 0, 0, elapsed);         
	      return ('0'+elapsed.getHours()).slice(-2)+':'+('0'+elapsed.getMinutes()).slice(-2);
      }
    }
    return '00:00';
  },

  // @return bool
  isFinished: function () {
    switch (this.get("status")) {
      case "created":
      case "ongoing":
        return false;
      default:
        return true;
    }
  },

  isOngoing: function () {
    return this.get("status") === "ongoing";
  }
});