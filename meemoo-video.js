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

  */  this.Video = Backbone.Model.extend({
    defaults: {
      "title": "",
      "triggers": []
    },
    initialize: function() {
      var loadthis;
      this.Players = new PlayerList();
      loadthis = this.get("firstValue");
      if (loadthis && loadthis !== "") {
        if (loadthis.indexOf(".webm") !== -1) {
          this.set({
            webm: loadthis
          });
        } else if (loadthis.indexOf(".mp4") !== -1 || loadthis.indexOf(".m4v") !== -1 || loadthis.indexOf(".mov") !== -1) {
          this.set({
            mp4: loadthis
          });
        } else if (loadthis.indexOf("youtube.com") !== -1) {
          loadthis = loadthis.split("v=")[1].split("&")[0];
          this.set({
            ytid: loadthis
          });
        } else {
          this.set({
            ytid: loadthis
          });
        }
      }
      if (this.get("title") === "") {
        return this.set({
          "title": this.get("ytid")
        });
      }
    },
    initializeView: function() {
      var player, _i, _len, _ref;
      this.View = new VideoView({
        model: this
      });
      _ref = this.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        player.initializeView();
      }
      return this.updateTriggers();
    },
    addTrigger: function(position, time) {
      if (position < App.triggers.length) {
        time = parseFloat(time);
        if (this.get("triggers").indexOf(time) === -1) {
          this.get("triggers")[position] = time;
          return this.updateTriggers();
        }
      }
    },
    updateTriggers: function() {
      if (this.View) {
        return this.View.updateTriggers();
      }
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        title: this.get("title"),
        duration: parseFloat(this.get("duration")),
        webm: this.get("webm"),
        mp4: this.get("mp4"),
        ytid: this.get("ytid"),
        triggers: this.get("triggers"),
        players: this.Players
      };
    },
    addPlayer: function() {
      return this.Players.add(new Player({
        Composition: this.get("Composition"),
        Video: this
      }));
    },
    remove: function() {
      var player, _i, _len, _ref;
      _ref = this.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        if (player.View) {
          player.View.remove();
        } else {
          player.remove();
        }
      }
      return this.get("Composition").Videos.remove(this);
    }
  });
  this.VideoList = Backbone.Collection.extend({
    model: Video,
    getOrAddVideo: function(composition, ytid) {
      var newVideo, thisvideo, _i, _len, _ref;
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        thisvideo = _ref[_i];
        if (ytid === thisvideo.get("ytid")) {
          return thisvideo;
        }
      }
      newVideo = new Video({
        Composition: composition,
        ytid: ytid
      });
      this.add(newVideo);
      return newVideo;
    }
  });
}).call(this);
