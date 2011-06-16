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

  */  this.Pattern = Backbone.Model.extend({
    defaults: {
      trigger_id: 0,
      chance: 1,
      beats: 16,
      next: 0
    },
    initialize: function() {
      this.Tracks = new TrackList();
      return this.beat = 0;
    },
    initializeView: function() {
      var track, _i, _len, _ref, _results;
      this.View = new PatternView({
        model: this,
        id: "pattern_" + this.cid
      });
      _ref = this.Tracks.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        _results.push(track.initializeView());
      }
      return _results;
    },
    addTracks: function() {
      var player, video, _i, _len, _ref, _results;
      _ref = this.get("Composition").Videos.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _results.push((function() {
          var _i, _len, _ref, _results;
          _ref = video.Players.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            _results.push(this.addTrack(player));
          }
          return _results;
        }).call(this));
      }
      return _results;
    },
    addTrack: function(player) {
      var newTrack;
      newTrack = new Track({
        Pattern: this,
        Player: player
      });
      this.Tracks.add(newTrack);
      return newTrack;
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        trigger_id: parseInt(this.get("trigger_id")),
        chance: parseInt(this.get("chance")),
        next: parseInt(this.get("next")),
        beats: parseInt(this.get("beats")),
        tracks: this.Tracks
      };
    },
    play: function() {
      this.get("Composition").cuePattern(this);
      return this.beat = 0;
    },
    stop: function() {
      this.get("Composition").stop();
      return this.beat = 0;
    },
    step: function() {
      var seconds, track, trigger, _i, _len, _ref;
      if (this.beat === 0) {
        this.View.startPlaying();
      }
      _ref = this.Tracks.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        trigger = track.Line[this.beat];
        if (trigger !== null && trigger !== void 0) {
          seconds = track.get("Player").get("Video").get("triggers")[trigger];
          if (seconds !== null && seconds !== void 0) {
            this.get("Composition").queueMessage("/seek/" + (track.get('Player').cid) + "/" + seconds);
          }
        }
      }
      this.View.step();
      this.beat++;
      if (this.beat >= this.get("beats")) {
        this.beat = 0;
        return this.get("Composition").loop();
      }
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    }
  });
  this.PatternList = Backbone.Collection.extend({
    model: Pattern
  });
}).call(this);
