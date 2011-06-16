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

  */  this.CompositionView = Backbone.View.extend({
    tagName: "div",
    className: "composition",
    template: _.template($('#composition-template').html()),
    events: {
      "click .composition-save-button": "save",
      "click .composition-export-button": "export",
      "mouseover .navigable": "mouseoverNavigable",
      "keydown .automulti": "automulti",
      "keydown .automulti2": "automulti2",
      "click .add-video": "addVideo",
      "click .add-pattern": "addPattern",
      "click .add-sequence": "addSequence",
      "click .play-all-button": "playAll",
      "click .pause-all-button": "pauseAll",
      "blur .editable": "setInfo",
      "blur .comp_info_bpm": "setBpm"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$('.composition-save-button').button({
        icons: {
          primary: "ui-icon-disk"
        }
      });
      this.$('.composition-export-button').button({
        icons: {
          primary: "ui-icon-clipboard"
        }
      });
      this.$('.automulti').button({
        icons: {
          primary: "ui-icon-battery-1"
        }
      });
      this.$('.automulti2').button({
        icons: {
          primary: "ui-icon-battery-3"
        }
      });
      this.$('.add-video').button({
        icons: {
          primary: "ui-icon-plus"
        }
      });
      this.$('.add-pattern').button({
        icons: {
          primary: "ui-icon-plus"
        }
      });
      this.$('.add-sequence').button({
        icons: {
          primary: "ui-icon-plus"
        }
      });
      this.$('.play-all-button').button({
        icons: {
          primary: "ui-icon-play"
        }
      });
      return this.$('.pause-all-button').button({
        icons: {
          primary: "ui-icon-pause"
        }
      });
    },
    initialize: function() {
      this.render();
      return $("#setup").append($(this.el));
    },
    mouseoverNavigable: function(e) {
      return $(e.currentTarget).focus();
    },
    addVideo: function() {
      var newVideo;
      newVideo = this.model.addVideo(this.$(".add-video-input").val());
      this.$(".add-video-input").val("");
      newVideo.initializeView();
      newVideo.View.$(".video-sources").show();
      return newVideo.View.testFirst();
    },
    addPattern: function() {
      var newPattern;
      newPattern = this.model.addPattern();
      return newPattern.initializeView();
    },
    addSequence: function() {
      var newSequence;
      newSequence = this.model.addSequence();
      return newSequence.initializeView();
    },
    automulti: function(e) {
      var count, player, triggerid, video, _i, _len, _ref, _results;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid === -1) {
        return;
      }
      count = 0;
      _ref = this.model.Videos.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _results.push((function() {
          var _i, _len, _ref, _results;
          _ref = video.Players.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            if (count === Math.floor(triggerid / 10)) {
              player.View.trigger(triggerid % 10);
              break;
            } else {
              count++;
            }
          }
          return _results;
        })());
      }
      return _results;
    },
    automulti2: function(e) {
      var player, seconds, triggerid, triggers, video, _i, _j, _len, _len2, _ref, _ref2;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid === -1) {
        return;
      }
      triggers = "";
      _ref = this.model.Videos.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        seconds = parseFloat(video.get("triggers")[triggerid]);
        if (seconds === seconds) {
          _ref2 = video.Players.models;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            player = _ref2[_j];
            triggers += "/seek/" + player.cid + "/" + seconds + "|";
          }
        }
      }
      return App.postRawMessageToViewer(triggers);
    },
    playAll: function() {
      var player, video, _i, _len, _ref, _results;
      _ref = this.model.Videos.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _results.push((function() {
          var _i, _len, _ref, _results;
          _ref = video.Players.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            _results.push(player.View.play());
          }
          return _results;
        })());
      }
      return _results;
    },
    pauseAll: function() {
      var player, video, _i, _len, _ref, _results;
      _ref = this.model.Videos.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _results.push((function() {
          var _i, _len, _ref, _results;
          _ref = video.Players.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            _results.push(player.View.pause());
          }
          return _results;
        })());
      }
      return _results;
    },
    save: function() {
      this.model.save();
      this.model.saveLastSaved();
      this.model.ListView.render();
      this.$(".composition-save-button").button({
        label: "Save"
      });
      return _gaq.push(['_trackEvent', 'Composition', 'Save ' + this.model.id, JSON.stringify(this.model)]);
    },
    setInfo: function() {
      return this.model.set({
        title: this.$(".comp_info_title").text().trim(),
        mixer: this.$(".comp_info_mixer").text().trim(),
        description: this.$(".comp_info_description").text().trim()
      });
    },
    setBpm: function() {
      return this.model.setBpm(parseInt(this.$(".comp_info_bpm").val()));
    },
    "export": function() {
      return this.model.ListView["export"]();
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this composition (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    remove: function() {
      this.model.stop();
      App.postMessageToViewer("remove", "ALL");
      return $(this.el).empty().remove();
    }
  });
}).call(this);
