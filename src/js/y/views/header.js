Y.Views.Header = Backbone.View.extend({
  el: "#header",

  initialize: function () {
    // on s'abonne au router, pour detecter des changement de pages.
    Y.Router.on("pageChanged", function () {
      // gestion du bouton back / prev.
      /*
      FIXME: comment gérer correctement l'historique ...

      console.log('HEADER: history length ' + window.history.length);
      if (window.history.length > 0)
        document.querySelector("#header .backButton").style.display = "block";
      else
        document.querySelector("#header .backButton").style.display = "none";
      */
    });

    // on s'abonne a la classe de connexion pour signifier les changements

  },
  render: function () { },

  showBack: function () { },
  hideBack: function () { },

  showConnected: function () { },
  hideConnected: function () { }
});