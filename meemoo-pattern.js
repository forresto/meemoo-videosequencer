(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

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
      var player, _i, _len, _ref, _results;
      _ref = this.get("Composition").Players.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        _results.push(this.addTrack(player));
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
      var thistrigger, track, trigger, triggers, _i, _len, _ref;
      if (this.beat === 0) {
        this.View.startPlaying();
      }
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
  this.PatternView = Backbone.View.extend({
    tagName: "div",
    className: "pattern",
    template: _.template($('#pattern-template').html()),
    events: {
      "click .pattern_addtrack_button": "chooseTrack",
      "mouseover .navigable": "mouseoverNavigable",
      "change .pattern_beats": "setBeats",
      "blur .pattern_beats": "setBeats",
      "change .pattern_chance": "setChance",
      "blur .pattern_chance": "setChance",
      "click .pattern_play_button": "play",
      "click .pattern_stop_button": "stop",
      "keydown .pattern_trigger": "setTrigger",
      "keydown .pattern_next": "setNext"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    mouseoverNavigable: function(e) {
      return $(e.currentTarget).focus();
    },
    setChance: function(e) {
      return this.model.set({
        chance: parseInt($(e.currentTarget).val())
      });
    },
    setTrigger: function(e) {
      var triggerid;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid !== -1) {
        this.model.set({
          trigger_id: triggerid
        });
        return $(e.currentTarget).text(App.triggers[triggerid]);
      }
    },
    setNext: function(e) {
      var triggerid;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid !== -1) {
        this.model.set({
          next: triggerid
        });
        return $(e.currentTarget).text(App.triggers[triggerid]);
      }
    },
    startPlaying: function() {
      this.$(".beat").removeClass("cue");
      $(".patterns .beat").removeClass("active");
      return this.$(".pattern_trigger").addClass("active");
    },
    initialize: function() {
      this.render();
      this.model.get("Composition").View.$(".patterns").append($(this.el));
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
      this.$('.pattern_addtrack_button').button({
        icons: {
          primary: "ui-icon-plus"
        }
      });
      return this.$('.navigable').attr("tabindex", 0);
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this pattern (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    play: function() {
      this.model.play();
      $(".pattern_trigger").removeClass("cue");
      return this.$(".pattern_trigger").addClass("cue");
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
      this.model.set({
        beats: beats
      });
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
}).call(this);
