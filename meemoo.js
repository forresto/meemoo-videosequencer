(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  This file is part of Meemoo.

    Meemoo is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    Meemoo is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General
    Public License along with Meemoo.  If not, see
    <http://www.gnu.org/licenses/>.

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
      $('#viewer-reload').button({
        icons: {
          primary: "ui-icon-refresh"
        }
      }).click(function() {
        return App.reloadVideos();
      });
      $('#newcomposition').button({
        icons: {
          primary: "ui-icon-document"
        }
      }).click(function() {
        var newComp;
        if (App.Composition.changesMade() && !confirm("You have unsaved changes in the current composition. Discard unsaved changes?")) {
          return;
        }
        newComp = new Composition();
        App.Compositions.add(newComp);
        return App.loadComposition(newComp);
      });
      $('#loadcomposition').button({
        icons: {
          primary: "ui-icon-folder-open"
        }
      }).click(function() {
        return $("#comp_dialog").dialog({
          width: 400,
          position: "right top"
        });
      });
      return $('#comp_import_button').button({
        icons: {
          primary: "ui-icon-arrowthickstop-1-s"
        }
      }).click(function() {
        var pastedJSON;
        pastedJSON = $("#comp_import_text").val().replace(/(\r\n|\n|\r)/gm, " ");
        App.loadComposition(App.Compositions.create({
          loadJSON: pastedJSON
        }));
        return $("#comp_import_text").val("");
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
      this.viewer = window.open("meemoo-viewer.html", "popoutviewer");
      $('#container').hide();
      $('#viewer').remove();
      return $('#setup').addClass("floatingsetup");
    },
    popinViewer: function() {
      if ($("#viewer").length === 0) {
        $('#container').prepend('<iframe src="meemoo-viewer.html" id="viewer" name="inviewer"></iframe>');
        this.viewer = document.getElementById("viewer").contentWindow;
        $('#container').show();
        return $('#setup').removeClass("floatingsetup");
      }
    },
    reloadVideos: function() {
      var player, video, _i, _len, _ref, _results;
      this.postRawMessageToViewer("/remove/ALL");
      _ref = App.Composition.Videos.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _results.push((function() {
          var _i, _len, _ref, _results;
          _ref = video.Players.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            player.set({
              loaded: 0,
              time: 0
            });
            _results.push(player.View.create());
          }
          return _results;
        })());
      }
      return _results;
    },
    postMessageToViewer: function(action, id, value) {
      return this.postRawMessageToViewer("/" + action + "/" + id + "/" + value);
    },
    postRawMessageToViewer: function(message) {
      return this.viewer.postMessage(message, window.location.protocol + "//" + window.location.host);
    },
    recieveMessage: function(msg) {
      var id, info, loaded, player, playerinfo, playerinfos, time, totalsize, totaltime, _i, _len, _results;
      if (!this.Composition) {
        return;
      }
      if (msg === "-=POPOUTCLOSED=-") {
        return this.popinViewer();
      } else if (msg === "-=REFRESH=-") {
        return setTimeout("App.reloadVideos()", 2000);
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
          _results.push(id !== "" ? (player = this.Composition.getPlayerByCid(id), player ? player.set({
            loaded: loaded,
            totalsize: totalsize,
            time: time,
            totaltime: totaltime
          }) : void 0) : void 0);
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
  window.onbeforeunload = function(e) {
    if (App.Composition && App.Composition.changesMade()) {
      return "You are closing with unsaved changes. Discard unsaved changes?";
    }
  };
}).call(this);
