(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  var recieveMessage;
  this.AppView = Backbone.View.extend({
    template: _.template($('#application-template').html()),
    triggers_us: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    keycodes_us: [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191],
    initialize: function() {
      $('#intro').hide();
      $('#application').html(this.template);
      this.timer = null;
      this.triggers = this.triggers_us;
      this.keycodes = this.keycodes_us;
      this.viewer = document.getElementById("viewer").contentWindow;
      $('#popoutbutton').button({
        icons: {
          primary: "ui-icon-newwin"
        }
      }).click(function() {
        return App.popoutViewer();
      });
      $('#newcomposition').button({
        icons: {
          primary: "ui-icon-document"
        }
      }).click(function() {
        var newComp;
        if (confirm("Are you sure you want to start with a new blank composition?")) {
          newComp = new Composition();
          App.Compositions.add(newComp);
          return App.loadComposition(newComp);
        }
      });
      $('#loadcomposition').button({
        icons: {
          primary: "ui-icon-folder-open"
        }
      }).click(function() {
        return $("#comp_dialog").dialog({
          modal: true,
          width: 400
        });
      });
      return $('#comp_import_button').button({
        icons: {
          primary: "ui-icon-arrowthickstop-1-s"
        }
      }).click(function() {
        var pastedJSON;
        pastedJSON = $("comp_import_text").text();
        return App.Composition = App.Compositions.create({
          loadJSON: pastedJSON
        });
      });
    },
    initializeCompositions: function() {
      var newComp;
      this.Compositions = new CompositionList();
      this.Compositions.fetch();
      if (this.Compositions.length > 0) {
        return this.loadComposition(this.Compositions.at(this.Compositions.length - 1));
      } else {
        newComp = new Composition();
        App.Compositions.add(newComp);
        return App.loadComposition(newComp);
      }
    },
    loadComposition: function(comp) {
      try {
        this.Composition.View.remove();
      } catch (_e) {}
      this.Composition = comp;
      return this.Composition.initializeView();
    },
    popoutViewer: function() {
      this.viewer = window.open("viewer.html", "popoutviewer");
      $('#container').hide();
      $('#viewer').remove();
      return $('#setup').addClass("floatingsetup");
    },
    popinViewer: function() {
      if ($("#viewer").length === 0) {
        $('#container').prepend('<iframe src="viewer.html" id="viewer" name="inviewer"></iframe>');
        this.viewer = document.getElementById("viewer").contentWindow;
        $('#container').show();
        return $('#setup').removeClass("floatingsetup");
      }
    },
    reloadVideos: function() {
      this.reload = function() {
        var player, _i, _len, _ref, _results;
        _ref = App.Composition.Players.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          player = _ref[_i];
          player.set({
            loaded: 0,
            time: 0
          });
          _results.push(App.postMessageToViewer("create", player.cid, player.Video.get("ytid")));
        }
        return _results;
      };
      this.reloadTriggers = function() {
        var video, _i, _len, _ref, _results;
        _ref = App.Composition.Videos.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          video = _ref[_i];
          _results.push(video.View.updateTriggers());
        }
        return _results;
      };
      setTimeout(this.reload, 2000);
      return setTimeout(this.reloadTriggers, 7000);
    },
    postMessageToViewer: function(action, id, value) {
      return this.postRawMessageToViewer("" + action + ":" + id + ":" + value);
    },
    postRawMessageToViewer: function(message) {
      return this.viewer.postMessage(message, window.location.protocol + "//" + window.location.host);
    },
    recieveMessage: function(msg) {
      var id, info, loaded, player, playerinfo, playerinfos, time, totalsize, totaltime, _i, _len, _results;
      if (msg === "-=POPOUTCLOSED=-") {
        return this.popinViewer();
      } else if (msg === "-=REFRESH=-") {
        return this.reloadVideos();
      } else {
        playerinfos = msg.split("|");
        _results = [];
        for (_i = 0, _len = playerinfos.length; _i < _len; _i++) {
          playerinfo = playerinfos[_i];
          info = playerinfo.split(":");
          id = info[0];
          loaded = info[1];
          totalsize = info[2];
          time = info[3];
          totaltime = info[4];
          _results.push(id !== "" ? (player = this.Composition.Players.getByCid(id), player ? (player.set({
            loaded: loaded,
            totalsize: totalsize,
            time: time,
            totaltime: totaltime
          }), player.Video.set({
            totaltime: totaltime
          })) : void 0) : void 0);
        }
        return _results;
      }
    }
  });
  recieveMessage = function(e) {
    if (e.origin !== window.location.protocol + "//" + window.location.host) {
      return;
    }
    App.recieveMessage(e.data);
    return e.data;
  };
  window.addEventListener("message", recieveMessage, false);
}).call(this);
