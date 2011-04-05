(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */
  /*
  # Patterns
  */  this.Pattern = Backbone.Model.extend({
    initialize: function() {
      this.beat = 0;
      this.beats = this.get("beats") <= 0 ? 16 : this.get("beats");
      return this.Tracks = new TrackList();
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
    setBeats: function(beats) {
      return this.beats = beats;
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
        beats: parseInt(this.beats),
        tracks: this.Tracks
      };
    },
    play: function() {
      return this.get("Composition").cuePattern(this);
    },
    stop: function() {
      this.get("Composition").stop();
      return this.beat = 0;
    },
    step: function() {
      var thistrigger, track, trigger, triggers, _i, _len, _ref;
      triggers = [];
      _ref = this.Tracks.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        trigger = track.Line[this.beat];
        if (trigger !== null && trigger !== void 0) {
          thistrigger = {};
          thistrigger.player = track.get("Player");
          thistrigger.trigger = trigger;
          triggers.push(thistrigger);
        }
      }
      this.get("Composition").multitrigger(triggers);
      this.View.step();
      this.beat++;
      if (this.beat >= this.beats) {
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
  this.PatternView = Backbone.View.extend({
    tagName: "div",
    className: "pattern",
    template: _.template($('#pattern-template').html()),
    events: {
      "click .pattern_addtrack_button": "chooseTrack",
      "mouseover .navigable": "mouseoverNavigable",
      "change .pattern_beats": "setBeats",
      "blur .pattern_beats": "setBeats",
      "click .pattern_play_button": "play",
      "click .pattern_stop_button": "stop"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    mouseoverNavigable: function(e) {
      return $(e.currentTarget).focus();
    },
    initialize: function() {
      this.render();
      this.model.get("Composition").View.$(".patterns-tabs").append($(this.el));
      this.model.get("Composition").View.$(".patterns-tabs").tabs();
      this.$('.pattern_play_button').button({
        icons: {
          primary: "ui-icon-play"
        },
        text: false
      });
      this.$('.pattern_stop_button').button({
        icons: {
          primary: "ui-icon-stop"
        },
        text: false
      });
      return this.$('.pattern_addtrack_button').button({
        icons: {
          primary: "ui-icon-plus"
        }
      });
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this pattern (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    play: function() {
      return this.model.play();
    },
    stop: function() {
      this.model.stop();
      return this.$(".beat").removeClass("active");
    },
    chooseTrack: function() {
      var dialog, disabled, player, playerel, track, _i, _j, _len, _len2, _ref, _ref2;
      dialog = $("<div></div>");
      $(this.el).append(dialog);
      _ref = App.Composition.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        disabled = false;
        _ref2 = this.model.Tracks.models;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          track = _ref2[_j];
          if (track.get("Player").cid === player.cid) {
            disabled = true;
          }
        }
        playerel = $("<div>" + player.cid + "</div>");
        playerel.data({
          pattern_id: this.model.cid,
          player_id: player.cid
        }).button({
          disabled: disabled
        }).click(function() {
          var pattern_id, player_id;
          pattern_id = $(this).data("pattern_id");
          player_id = $(this).data("player_id");
          App.Composition.Patterns.getByCid(pattern_id).View.addTrack(player_id);
          return $(dialog).dialog("close");
        });
        dialog.append(playerel);
      }
      return dialog.dialog();
    },
    addTrack: function(player_id) {
      var newTrack;
      newTrack = this.model.addTrack(App.Composition.Players.getByCid(player_id));
      return newTrack.initializeView();
    },
    setBeats: function() {
      var beats, track, _i, _len, _ref, _results;
      beats = this.$(".pattern_beats").val();
      this.model.setBeats(beats);
      _ref = this.model.Tracks.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        _results.push(track.View.initialize());
      }
      return _results;
    },
    step: function() {
      this.$(".beat").removeClass("active");
      return this.$(".beat_" + this.model.beat).addClass("active");
    },
    remove: function() {
      return $(this.el).remove();
    }
  });
  /*
  # Pattern tracks
  */
  this.Track = Backbone.Model.extend({
    initialize: function() {
      this.Line = [];
      this.pattern_id = this.get("Pattern").cid;
      return this.beats = this.get("Pattern").beats;
    },
    initializeView: function() {
      return this.View = new TrackView({
        model: this,
        Pattern: this.get("Pattern")
      });
    },
    setLine: function(line) {
      return this.Line = line;
    },
    addTrigger: function(position, trigger) {
      return this.Line[position] = trigger;
    },
    setBeat: function(beat, triggerid) {
      this.Line[beat] = triggerid;
      if (this.View) {
        return this.View.setBeat(beat, triggerid);
      }
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        player_id: this.get("Player").cid,
        line: this.Line
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    }
  });
  this.TrackList = Backbone.Collection.extend({
    model: Track
  });
  this.TrackView = Backbone.View.extend({
    tagName: "div",
    className: "track",
    template: _.template($('#track-template').html()),
    events: {
      "mouseover .beat": "beatOver",
      "keydown .beat": "beatKeydown"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      var beat, beats, html, i, _ref;
      $(this.el).empty();
      this.Beats = [];
      this.render();
      beats = this.model.get("Pattern").beats;
      for (i = 0, _ref = beats - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        html = App.triggers[this.model.Line[i]];
        if (html === null || html === void 0) {
          html = "&nbsp;";
        }
        beat = $("<span class='beat beat_" + i + " navigable' id='pattern_" + this.model.pattern_id + "_track_" + this.model.cid + "_beat_" + i + "' tabindex='0'>" + html + "</span>");
        beat.data("beat", i);
        $(this.el).append(beat);
        this.Beats[i] = beat;
      }
      return this.model.get("Pattern").View.$(".pattern_tracks").append($(this.el));
    },
    beatOver: function(e) {
      return $(e.currentTarget).focus();
    },
    beatKeydown: function(e) {
      var beat;
      beat = $(e.currentTarget).data("beat");
      switch (e.keyCode) {
        case 9:
          return true;
        case 8:
          return this.focusPrev(beat);
        case 46:
          return this.focusPrev(beat);
        case 38:
          return this.focusPrevTrack(beat);
        case 40:
          return this.focusNextTrack(beat);
        case 37:
          return this.focusPrev(beat);
        case 39:
          return this.focusNext(beat);
        default:
          this.setBeatKeycode(beat, e.keyCode);
          return false;
      }
    },
    setBeatKeycode: function(beat, keyCode) {
      var newText, triggerid;
      triggerid = App.keycodes.indexOf(keyCode);
      if (triggerid === -1) {
        if (keyCode === 32 || keyCode === 8 || keyCode === 46 || keyCode === 27) {
          triggerid = null;
        } else {
          return;
        }
      }
      newText = triggerid === null ? "&nbsp;" : App.triggers[triggerid];
      this.Beats[beat].html(newText);
      this.model.setBeat(beat, triggerid);
      if (keyCode !== 32 && triggerid === null) {
        return this.focusPrev(beat);
      } else {
        return this.focusNext(beat);
      }
    },
    focusPrev: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat - 1]) {
        beatel.focus();
      }
      return false;
    },
    focusNext: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat + 1]) {
        beatel.focus();
      }
      return false;
    },
    focusPrevTrack: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat].parent().prev().children(".beat_" + beat)) {
        beatel.focus();
      }
      return false;
    },
    focusNextTrack: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat].parent().next().children(".beat_" + beat)) {
        beatel.focus();
      }
      return false;
    },
    setBeat: function(beat, triggerid) {
      var newText;
      newText = triggerid === null ? "&nbsp;" : App.triggers[triggerid];
      return this.Beats[beat].html(newText);
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this pattern (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    remove: function() {
      return $(this.el).remove();
    }
  });
}).call(this);
