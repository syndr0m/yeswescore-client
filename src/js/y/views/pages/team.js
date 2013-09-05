Y.Views.Pages.Team = Y.View.extend({
  el : "#content",
  
  player_id: null,

  events : {
    'click #followButton'   : 'followTeam',
    'click .form-button'    : 'updateTeam',
    'click .button-comments': 'goToComment'     
  },

  pageName: "team",
  pageHash : "team/",
  
  player_id: null,
  
  myinitialize : function() {
    //header
    Y.GUI.header.title(i18n.t('team.title'));
  
    // loading templates.
    this.templates = {
      empty: Y.Templates.get('module-empty'),
      page:  Y.Templates.get('page-team'),
      pageform:  Y.Templates.get('page-teamform')      
    };
    
    // loading owner
    this.player = Y.User.getPlayer();  

        
    this.playeridArray = new Array;
        
    // we render immediatly
    this.render();        

    this.team = new TeamModel({id : this.id});   
    this.team.once('sync', this.renderTeam, this);      
    this.team.fetch();
    
    var teams_follow = Y.Conf.get("owner.teams.followed");
    if (teams_follow !== undefined)
    {
      if (teams_follow.indexOf(this.id) === -1) {
        this.follow = 'false';
      }
      else
        this.follow = 'true';          
    }
    else
      this.follow = 'false';
                
  },

  followTeam: function() {
    if (this.follow === 'true') {
      var teams_follow = Y.Conf.get("owner.teams.followed");
      if (teams_follow !== undefined)
      {
        if (teams_follow.indexOf(this.id) !== -1) {
          //On retire l'elmt
          teams_follow.splice(teams_follow.indexOf(this.id), 1);
          Y.Conf.set("owner.teams.followed", teams_follow, { permanent: true });
        }
      }
      $('span.success').css({display:"block"});
      $('span.success').html(i18n.t('message.nofollowclubok')).show();
      $("#followButton").text(i18n.t('message.follow'));
      $('#followButton').removeClass('button-selected');
      $('#followButton').addClass('button'); 
      this.follow = 'false';
    } else {
      //Via localStorage
      var teams_follow = Y.Conf.get("owner.teams.followed");
      if (teams_follow !== undefined)
      {
        if (teams_follow.indexOf(this.id) === -1) {
          teams_follow.push(this.id);
          Y.Conf.set("owner.teams.followed", teams_follow, { permanent: true });
        }
      }
      else
        Y.Conf.set("owner.teams.followed", [this.id]);
      $('span.success').css({display:"block"});
      $('span.success').html(i18n.t('message.followteamok')).show();
      $("#followButton").text(i18n.t('message.nofollow'));
      $('#followButton').removeClass('button');
      $('#followButton').addClass('button-selected');          
      this.follow = 'true';
    }
  },

  updatingTeam: false,  
  updateTeam: function() {
    
    if (this.playeridArray !== undefined)
    {
      if (this.playeridArray.indexOf(this.player_id) === -1) {
        this.playeridArray.push(this.player_id);
      }
    }
    else
      this.playeridArray = [this.player_id]; 
    
    if (this.updatingTeam)
      return; // already sending => disabled.          
    
    this.updatingTeam = true;  
    
    var team = new TeamModel({
      id:this.teamid,
      name:this.teamname
    });
    team.set('players', this.playeridArray);  
    
    console.log('team',team);

    var that = this;    
    team.save(null, {
      playerid: this.player.get('id'),
      token: this.player.get('token')
    }).done(function (model, response) {    
      that.updatingTeam = false; 
	  that.$('.addnew').append(that.$("#team").val()+"<br/>");
	  that.$("#team").val(' ');    
           
    }).fail(function (err) {       
      that.updatingTeam = false;      
    });   
  
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
          //FIXME : add rank
          if (p.club !== undefined && p.club.name !== undefined) {
            p.text += " ( "+p.club.name+" )";
          }
          return p; 
        }));
      } else {
        callback(null, []);
      }
    }).fail(function (xhr, error) { 
      callback(error);
    });
  },

  autocompleteTeam: function (data) {
    if (data && data.name) {
      this.$("#team").val(data.name);
      this.player_id = data.id;
    }
  },

  renderCountComment : function() {
  
    //var nbComments = this.streams.length;
    var nbComments = this.team.get('streamCommentsSize') + this.team.get('streamImagesSize');
  
    if (nbComments > Y.Conf.get("game.max.comments") )
      this.$(".link-comments").html(i18n.t('game.50lastcomments'));
    else if (nbComments == 1)
      this.$(".link-comments").html(i18n.t('game.1comment'));
    else if (nbComments > 0)
      this.$(".link-comments").html(nbComments + " "+i18n.t('game.comments'));
    else
      this.$(".link-comments").html(i18n.t('game.0comment'));
  },  

  render: function () {
    // empty page.
    this.$el.html(this.templates.empty());
    return this;
  },
  
 
  // render the content into div of view
  renderTeam : function() {
  
    this.teamid = this.team.get('id');
    this.teamname = this.team.get('name');
        
	for(var o in this.team.get('players')) {
      this.playeridArray.push(this.team.get('players')[o].id);
	}
    
    if (this.playeridArray.indexOf(this.player.get('id'))!=-1) {
      this.$el.html(this.templates.pageform({
        team : this.team.toJSON()
        , follow:this.follow
      }));    
    }
    else { 
      this.$el.html(this.templates.page({
        team : this.team.toJSON()
        , follow:this.follow
      }));
    }
    
    this.renderCountComment();
    
    this.$el.i18n();
    return this;
  },

  // ROUTING FUNCTIONS
  goToComment: function (elmt) {
    var route = $(elmt.currentTarget).attr("data-js-href");
    Y.Router.navigate(route, {trigger: true}); 
  },

  onClose : function() {
    this.undelegateEvents();
    this.team.off("sync", this.renderTeam, this);
  }
});