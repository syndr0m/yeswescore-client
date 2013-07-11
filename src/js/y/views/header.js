Y.Views.Header = Y.View.extend({
  el: "#header",

  events: {
    "vclick .backButton": "goBack"
  },

  initialize: function () {
    this.startingLength = window.history.length;
    
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	var isGingerbread = /android 2\.3/i.test(userAgent);
	if (isGingerbread) {
	  $('div#header').css('position','relative');	  	    
	}
	else {
	  $('div#header').css('position','fixed'); 	
	  $('div#header').css('z-index','50');
	  $('div#content').addClass('fixed');	 	  
	}

    // on s'abonne au router, pour detecter des changement de pages.
    var that = this;
    Y.Router.on("pageChanged", function (a, b) {
      that.repaintBack();
    });

    Backbone.on("request.start", function () { that.animateConnection("on"); });
    Backbone.on("request.end", function () { that.animateConnection("off"); });

    // on s'abonne a la classe de connexion pour signifier les changements
    Y.Connection.on("change", function (state) {
      if (state[0] === Y.Connection.STATUS_ONLINE) {
      	var connectionStatus = $(".connectionStatus");
      	connectionStatus.attr("src", "images/header-logo-on.png");
      	connectionStatus.attr("width", "23");
      	connectionStatus.attr("height", "17");
      } else {
      	var connectionStatus = $(".connectionStatus");
      	connectionStatus.attr("src", "images/header-logo-off.png");
      	connectionStatus.attr("width", "35");
      	connectionStatus.attr("height", "17");
      }
    });
  },
  render: function () { },

  // @param string title
  // @return void.
  title: function (title) { 
    if (typeof title === "string")
      this.$(".title").text(title);
  },

  goBack: function () {
    window.history.go(-1);
    return false;
  },
  
  showBack: function () { this.$(".backButton").show() },
  hideBack: function () { this.$(".backButton").hide() },
  repaintBack: function () {
    var pageName = Y.GUI.content.pageName;
    
    if (pageName == "gameList" || pageName == "account" || pageName == "gameAdd")
      this.hideBack();
    else
      this.showBack();
  },
  
  hide: function () { 
    this.$el.hide();
  },

  show: function () { 
    this.$el.show();
  },  

  connectionStatus: (function () {
    var status = "connected";
    return function (newStatus) {
      // FIXME: repaint GUI depending on newStatus.
      return status;
    };
  })(),

  animateConnection: (function () {
    // private vars
    var i = 0;
    var intervalId = null;
    var animationImages = [
      //"images/header-logo-on-animate-1.png",
      //"images/header-logo-on-animate-2.png",
      "images/pixel.png",
      "images/header-logo-on-animate-3.png",
      "images/header-logo-on-animate-4.png",
      "images/header-logo-on.png"
    ];
    var animationImagesLag = [
      //"images/header-logo-on-lag-animate-1.png",
      //"images/header-logo-on-lag-animate-2.png",
      "images/pixel.png",
      "images/header-logo-on-lag-animate-3.png",
      "images/header-logo-on-lag-animate-4.png",
      "images/header-logo-on-lag.png"
    ];
    var animationIndex = 0;
    //
    return function (status) {
      var connectionStatus = this.$(".connectionStatus");
      // animation repaint 
      var repaint = function () {
        var animationImage;
        if (Y.Connection.isFast())
          animationImage = animationImages[animationIndex % animationImages.length];
        else
          animationImage = animationImagesLag[animationIndex % animationImages.length];
        connectionStatus.attr("src", animationImage);
        animationIndex++;
        if (animationIndex % animationImages.length == 0 && i == 0) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      };
      // handling "on" / "off"
      if (status == "on") {
        // on
        if (i == 0 && intervalId == null) {
          intervalId = window.setInterval(repaint, 200);
          repaint();
        }
        i++;
      } else {
        // off
        if (i > 0)
          i--;
      }
    };
  })()
});