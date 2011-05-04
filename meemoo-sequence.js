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
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Meemoo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Meemoo.  If not, see <http://www.gnu.org/licenses/>.

  */  this.Sequence = Backbone.Model.extend({
    defaults: {
      length: 16
    },
    initialize: function() {
      this.Tracks = new SequenceTrackList();
      return this.beat = -1;
    },
    initializeView: function() {
      var track, _i, _len, _ref, _results;
      this.View = new SequenceView({
        model: this
      });
      _ref = this.Tracks.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        _results.push(track.initializeView());
      }
      return _results;
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        length: parseInt(this.get("length")),
        tracks: this.Tracks
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    },
    addTrack: function() {
      var newTrack;
      newTrack = new SequenceTrack({
        Sequence: this
      });
      this.Tracks.add(newTrack);
      return newTrack;
    },
    cue: function(beat) {
      return this.beat = beat - 1;
    },
    play: function() {
      return this.get("Composition").cueSequence(this);
    },
    stop: function() {
      this.beat = -1;
      return this.get("Composition").stopSequence(this);
    },
    step: function() {
      var next_id;
      this.beat++;
      if (this.beat >= this.get("length")) {
        this.beat = 0;
      }
      this.View.step();
      next_id = this.Tracks.models[0].Line[this.beat];
      if (next_id === void 0) {
        next_id = null;
      }
      return next_id;
    }
  });
  this.SequenceList = Backbone.Collection.extend({
    model: Sequence
  });
  this.SequenceView = Backbone.View.extend({
    tagName: "div",
    className: "sequence",
    template: _.template($('#sequence-template').html()),
    events: {
      "mouseover .navigable": "mouseoverNavigable",
      "change .sequence_length": "setLength",
      "blur .sequence_length": "setLength",
      "click .sequence_play_button": "play",
      "click .sequence_stop_button": "stop"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.render();
      this.$('.sequence_play_button').button({
        icons: {
          primary: "ui-icon-play"
        },
        text: false
      });
      this.$('.sequence_stop_button').button({
        icons: {
          primary: "ui-icon-stop"
        },
        text: false
      });
      this.$('.navigable').attr("tabindex", 0);
      return this.model.get("Composition").View.$(".sequences").append($(this.el));
    },
    mouseoverNavigable: function(e) {
      return $(e.currentTarget).focus();
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this composition (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    setLength: function() {
      var length, track, _i, _len, _ref, _results;
      length = this.$(".sequence_length").val();
      if ((0 < length && length < 1000)) {
        this.model.set({
          length: length
        });
        _ref = this.model.Tracks.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          track = _ref[_i];
          _results.push(track.View.initialize());
        }
        return _results;
      }
    },
    remove: function() {
      return $(this.el).remove();
    },
    play: function() {
      return this.model.play();
    },
    stop: function() {
      this.model.stop();
      return this.$(".beat").removeClass("active");
    },
    step: function() {
      this.$(".beat").removeClass("cue");
      $(".sequencetrack .beat").removeClass("active");
      return this.$(".beat_" + this.model.beat).addClass("active");
    }
  });
}).call(this);
