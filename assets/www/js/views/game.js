var GameView = Backbone.View
    .extend({
      el : "#index",
      
      displayViewScoreBoard : "#displayViewScoreBoard",
      // Flux des commentaires
      // FIXME: sort by priority
      incomingComment : "#incomingComment",      
      
      events : {
        'vclick #setPlusSetButton' : 'setPlusSet',
        'vclick #setMinusSetButton' : 'setMinusSet',
        'vclick #setPointWinButton' : 'setPointWin',
        'vclick #setPointErrorButton' : 'setPointError',
        'vclick #endButton' : 'endGame',
        'vclick #followButton' : 'followGame',
        'vclick #cancelButton' : 'cancelGame',
        'submit #frmAttachment' : 'submitAttachment',
        "keypress #messageText" : "updateOnEnter",
        'vclick #team1_set1_div' : 'setTeam1Set1',
        'vclick #team1_set2_div' : 'setTeam1Set2',
        'vclick #team1_set3_div' : 'setTeam1Set3',
        'vclick #team2_set1_div' : 'setTeam2Set1',
        'vclick #team2_set2_div' : 'setTeam2Set2',
        'vclick #team2_set3_div' : 'setTeam2Set3',
        'vclick #commentDeleteButton' : 'commentDelete',
        'vclick #commentSendButton' : 'commentSend'
      },


      initialize : function() {
        // FIXME : temps de rafrichissement selon batterie et selon forfait
        this.gameViewTemplate = Y.Templates.get('gameViewTemplate');
        this.gameViewScoreBoardTemplate = Y.Templates
            .get('gameViewScoreBoardTemplate');
        this.gameViewCommentListTemplate = Y.Templates
            .get('gameViewCommentListTemplate');

        this.Owner = JSON.tryParse(window.localStorage.getItem("Y.Cache.Player"));

        this.score = new GameModel({id : this.id});
        this.score.fetch();

        //this.render();
        this.score.on("all",this.render,this);

        
        this.gamesfollow = new GamesCollection('follow');
        result = this.gamesfollow.storage.find({
          id : this.id
        });

        if (result === null)
          this.follow = 'false';
        else
          this.follow = 'true';
         
        this.follow = 'false';

        var options = {
          // default delay is 1000ms
          // FIXME : on passe sur 30 s car souci avec API
          delay : Y.Conf.get("game.refresh")
        // data: {id:this.id}
        };

        // FIXME: SI ONLINE
        
        poller = Backbone.Poller.get(this.score, options)
        poller.start();
        poller.on('success', this.renderRefresh, this);
        
        //this.score.on("all",this.renderRefresh,this);
        
        
      },

      commentDelete : function() {
        // messageText
        $('#messageText').value(' ');
      },

      updateOnEnter : function(e) {
        if (e.keyCode == 13) {
          console.log('touche entr�e envoie le commentaire');
          this.commentSend();
        }
      },

      commentSend : function() {
        var playerid = $('#playerid').val(), token = $('#token').val(), gameid = $(
            '#gameid').val(), comment = $('#messageText').val();

        var stream = new StreamModel({
          type : "comment",
          playerid : playerid,
          token : token,
          text : comment,
          gameid : gameid
        });
        // console.log('stream',stream);
        stream.save();

        $('#messageText').val();
      },

      setTeamSet : function(input, div) {
        if ($.isNumeric(input.val()))
          set = parseInt(input.val(), 10) + 1;
        else
          set = '1';

        input.val(set);
        div.html(set);
        this.sendUpdater();
      },

      setTeam1Set1 : function() {
        this.setTeamSet($('#team1_set1'), $('#team1_set1_div'));
      },

      setTeam1Set2 : function(options) {
        this.setTeamSet($('#team1_set2'), $('#team1_set2_div'));
      },

      setTeam1Set3 : function() {
        this.setTeamSet($('#team1_set3'), $('#team1_set3_div'));
      },

      setTeam2Set1 : function() {
        this.setTeamSet($('#team2_set1'), $('#team2_set1_div'));
      },

      setTeam2Set2 : function() {
        this.setTeamSet($('#team2_set2'), $('#team2_set2_div'));
      },

      setTeam2Set3 : function() {
        this.setTeamSet($('#team2_set3'), $('#team2_set3_div'));
      },

      submitAttachment : function(data) {
        // formData = new FormData($(this)[0]);
        console.log('date-form', data);

        /*
         * $.ajax({ type:'POST', url:urlServiceUpload, data:formData,2
         * contentType: false, processData: false, error:function (jqXHR,
         * textStatus, errorThrown) { alert('Failed to upload file') },
         * success:function () { alert('File uploaded')
         */
        return false;
      },

      sendUpdater : function() {
        // console.log('action setPlusSet avec
        // '+$('input[name=team_selected]:checked').val());

        // ADD SERVICE
        var gameid = $('#gameid').val(), team1_id = $('#team1_id').val(), team1_points = $(
            '#team1_points').val(), team1_set1 = $('#team1_set1').val(), team1_set2 = $(
            '#team1_set2').val(), team1_set3 = $('#team1_set3').val(), team2_id = $(
            '#team2_id').val(), team2_points = $('#team2_points').val(), team2_set1 = $(
            '#team2_set1').val(), team2_set2 = $('#team2_set2').val(), team2_set3 = $(
            '#team2_set3').val(), playerid = $('#playerid').val(), token = $(
            '#token').val(), tennis_update = null;

        if ($.isNumeric(team1_set1) === false)
          team1_set1 = '0';
        if ($.isNumeric(team2_set1) === false)
          team2_set1 = '0';

        var sets_update = team1_set1 + '/' + team2_set1;

        if (team1_set2 > 0 || team2_set2 > 0) {
          if ($.isNumeric(team1_set2) === false)
            team1_set2 = '0';
          if ($.isNumeric(team2_set2) === false)
            team2_set2 = '0';

          sets_update += ";" + team1_set2 + '/' + team2_set2;
        }
        if (team1_set3 > 0 || team2_set3 > 0) {

          if ($.isNumeric(team1_set3) === false)
            team1_set3 = '0';
          if ($.isNumeric(team2_set3) === false)
            team2_set3 = '0';

          sets_update += ";" + team1_set3 + '/' + team2_set3;
        }

        // FIXME : On remplace les espaces par des zeros
        // sets_update = sets_update.replace(/ /g,'0');

        // console.log('sets_update',sets_update);

        tennis_update = new GameModel({
          sets : sets_update,
          team1_points : team1_points,
          team2_points : team2_points,
          id : gameid,
          team1_id : team1_id,
          team2_id : team2_id,
          playerid : playerid,
          token : token
        });

        // console.log('setPlusSet',tennis_update);

        tennis_update.save();

        // FIXME: on ajoute dans le stream
        var stream = new StreamModel({
          type : "score",
          playerid : playerid,
          token : token,
          text : sets_update,
          gameid : gameid
        });
        // console.log('stream',stream);
        stream.save();
      },

      setPlusSet : function() {
        var selected = $('input[name=team_selected]:checked').val();
        var set = parseInt($('#team' + selected + '_set1').val(), 10) + 1;
        // console.log(set);

        // FIXME : Regle de Gestion selon le score

        $('#team' + selected + '_set1').val(set);
        $('#team' + selected + '_set1_div').html(set);

        this.sendUpdater();
      },

      setMinusSet : function() {
        var selected = $('input[name=team_selected]:checked').val();
        var set = parseInt($('#team' + selected + '_set1').val(), 10) - 1;
        console.log(set);

        if (set < 0)
          set = 0;
        // FIXME : Regle de Gestion selon le score

        $('#team' + selected + '_set1').val(set);
        $('#team' + selected + '_set1_div').html(set);

        this.sendUpdater();
      },

      setPoint : function(mode) {
        // 15 30 40 AV
        var selected = $('input[name=team_selected]:checked').val(), selected_opponent = '';

        // le serveur gagne un point
        if (mode == true) {
          if (selected == '2') {
            selected_opponent = '2';
          } else
            selected_opponent = '1';
        }
        // le serveur perd un point
        else {
          if (selected == '2') {
            selected = '1';
            selected_opponent = '2';
          } else
            selected = '2';
          selected_opponent = '1';
        }

        var set_current = $('input[name=set_current]:checked').val(), point = $(
            '#team' + selected + '_points').val(), point_opponent = $(
            '#team' + selected_opponent + '_points').val();

        // Le serveur gagne son set
        if (point == 'AV'
            || (point == '40' && (point_opponent != '40' || point_opponent != 'AV'))) {
          // On ajoute 1 set au gagnant les point repartent � zero
          var set = parseInt(
              $('#team' + selected + '_set' + set_current).val(), 10) + 1;
          $('#team' + selected + '_set1').val(set);
          $('#team' + selected + '_set1_div').html(set);

          point = '00';
          $('#team1_points').val(point);
          $('#team1_points_div').html(point);
          $('#team2_points').val(point);
          $('#team2_points_div').html(point);
        } else {
          if (point === '00')
            point = '15';
          else if (point === '15')
            point = '30';
          else if (point === '30')
            point = '40';
          else if (point === '40')
            point = 'AV';
          else if (point === 'AV')
            point = '00';
          else {
            point = '00';
            // On met l'adversaire � z�ro
            $('#team' + selected_opponent + '_points').val(point);
            $('#team' + selected_opponent + '_points_div').html(point);
          }

          $('#team' + selected + '_points').val(point);
          $('#team' + selected + '_points_div').html(point);
        }
        this.sendUpdater();
      },

      setPointWin : function() {
        console.log('setPointWin');
        this.setPoint(true);
      },

      setPointError : function() {
        console.log('setPointError');
        this.setPoint(false);
      },

      // render the content into div of view
      renderRefresh : function() {
        
        //$(this.displayViewScoreBoard).listview();
        
        $(this.displayViewScoreBoard).html(this.gameViewScoreBoardTemplate({
          game : this.score.toJSON(),
          Owner : this.Owner
        }));
        
        // FIXME: refresh div
        
        $(this.displayViewScoreBoard).trigger('create');
        $(this.displayViewScoreBoard).listview('refresh');

        
        // FIXME: convert date
        /*
         * var today = new Date(); var msg_time =
         * today.getHours()+":"+(today.getMinutes()<10?'0':'')+today.getMinutes()+" - ";
         */

        // if we have comments

        
        if (this.score.stream !== undefined) {
          
          $(this.incomingComment).html(this.gameViewCommentListTemplate({
            //streams : this.score.stream.reverse(),
            streams : this.score.stream.toJSON(),
            query : ' '
          }));

          $(this.incomingComment).listview();
          $(this.incomingComment).trigger('create');
          $(this.incomingComment).listview('refresh');
        }
        
       
        
        return this;
      },

      render : function() {
        // On rafraichit tout
        // FIXME: refresh only input and id
        this.$el.html(this.gameViewTemplate({
          game : this.score.toJSON(),
          Owner : this.Owner,
          follow : this.follow
        }));

        $.mobile.hidePageLoadingMsg();
        this.$el.trigger('pagecreate');

        return this;
      },

      alertDismissed : function() {
        // do something
      },

      endGame : function() {
        window.location.href = '#games/end/' + this.id;
      },

      followGame : function() {

        if (this.follow === 'true') {
          this.gamesfollow = new GamesCollection('follow');

          console.log('On ne suit plus nofollow ' + this.id);

          this.gamesfollow.storage.remove(this.scoreboard);

          $('span.success').html('Vous ne suivez plus ce match').show();
          // $('#followPlayerButton').html('Suivre ce joueur');
          $("#followButton .ui-btn-text").text("Suivre");

          this.follow = 'false';

        } else {

          this.gamesfollow = new GamesCollection('follow');

          this.gamesfollow.create(this.scoreboard);

          $('span.success').html('Vous suivez ce joueur').show();
          // $('#followPlayerButton').html('Ne plus suivre ce joueur');
          $("#followButton .ui-btn-text").text("Ne plus suivre");

          this.follow = 'true';

        }

        this.$el.trigger('pagecreate');

      },

      cancelGame : function() {

        console.log('On retire la derniere action');

      },

      onClose : function() {
        // Clean
        this.undelegateEvents();
        this.score.off("all",this.render,this);
        //this.score.off("all",this.renderRefresh,this);
        
        // FIXME:remettre
        poller.stop();
        poller.off('success', this.renderRefresh, this);

        // FIXME:
        // poller.off('complete', this.render, this);
        // this.$el.off('pagebeforeshow');
      }
    });