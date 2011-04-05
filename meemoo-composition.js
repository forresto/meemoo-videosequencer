(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Composition = Backbone.Model.extend({
    defaults: {
      "title": "untitled composition",
      "description": "mixed with sembiki meemoo audio visual sequencer",
      "mixer": "me!"
    },
    initialize: function() {
      var addID, loadComp, newPattern, newPlayer, newTrack, old_player_id, pastedJSON, pattern, player, track, video, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5;
      if (this.get("loadJSON") !== void 0) {
        pastedJSON = this.get("loadJSON");
        if (pastedJSON !== "") {
          loadComp = JSON.parse(pastedJSON);
          console.log(loadComp);
        }
      }
      this.Videos = new VideoList();
      this.Players = new PlayerList();
      if (this.attributes.players) {
        _ref = this.attributes.players;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          player = _ref[_i];
          _ref2 = this.attributes.videos;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            video = _ref2[_j];
            if (player.video_id === video.id) {
              addID = video.ytid;
              if (addID !== "") {
                newPlayer = this.addPlayer(addID);
                newPlayer.Video.Triggers = video.triggers;
                player.newcid = newPlayer.cid;
              }
              break;
            }
          }
        }
      }
      this.Patterns = new PatternList();
      this.Sequences = new SequenceList();
      if (this.attributes.patterns) {
        _ref3 = this.attributes.patterns;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          pattern = _ref3[_k];
          newPattern = new Pattern({
            Composition: this,
            beats: pattern.beats
          });
          this.Patterns.add(newPattern);
          pattern.newcid = newPattern.cid;
          if (pattern.tracks) {
            _ref4 = pattern.tracks;
            for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
              track = _ref4[_l];
              old_player_id = track.player_id;
              _ref5 = this.attributes.players;
              for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
                player = _ref5[_m];
                if (old_player_id === player.id) {
                  newTrack = newPattern.addTrack(this.Players.getByCid(player.newcid));
                  newTrack.setLine(track.line);
                  break;
                }
              }
            }
          }
        }
      } else {
        this.Patterns.add(new Pattern({
          Composition: this,
          beats: 16
        }));
      }
      this.Pattern = null;
      this.nextPattern = null;
      this.playing = false;
      if (this.attributes.bpm) {
        this.setBpm(this.attributes.bpm);
      } else {
        this.setBpm(120);
      }
      return this.ListView = new CompositionListView({
        model: this
      });
    },
    setBpm: function(bpm) {
      this.bpm = bpm;
      return this.bpm_ms = Math.round(1000 / this.bpm * 60);
    },
    play: function() {
      clearTimeout(App.timer);
      App.timer = setTimeout("App.Composition.step()", this.bpm_ms);
      return this.playing = true;
    },
    stop: function() {
      clearTimeout(App.timer);
      return this.playing = false;
    },
    step: function() {
      this.Pattern.step();
      return this.play();
    },
    cuePattern: function(pattern) {
      this.nextPattern = pattern;
      if (this.playing === false) {
        this.Pattern = pattern;
        return this.play();
      }
    },
    loop: function() {
      return this.Pattern = this.nextPattern;
    },
    multitrigger: function(triggers) {
      var item, message, seconds, _i, _len;
      message = "";
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        item = triggers[_i];
        seconds = item.player.Video.Triggers[item.trigger];
        if (seconds !== null && seconds !== void 0) {
          message += "seek:";
          message += "" + item.player.cid + ":";
          message += "" + seconds + "|";
        }
      }
      if (message !== "") {
        return App.postRawMessageToViewer(message);
      }
    },
    initializeView: function() {
      var pattern, player, sequence, video, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4;
      this.View = new CompositionView({
        model: this
      });
      _ref = this.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        player.initializeView();
      }
      _ref2 = this.Videos.models;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        video = _ref2[_j];
        video.initializeView();
      }
      _ref3 = this.Patterns.models;
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        pattern = _ref3[_k];
        pattern.initializeView();
      }
      _ref4 = this.Sequences.models;
      for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
        sequence = _ref4[_l];
        sequence.initializeView();
      }
      return App.reloadVideos();
    },
    addPlayer: function(ytid) {
      var newPlayer;
      newPlayer = new Player({
        Composition: this,
        ytid: ytid
      });
      this.Players.add(newPlayer);
      return newPlayer;
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.id,
        title: this.get("title"),
        description: this.get("description"),
        mixer: this.get("mixer"),
        bpm: this.get("bpm"),
        videos: this.Videos,
        players: this.Players,
        patterns: this.Patterns,
        sequences: this.Sequences
      };
    },
    "delete": function() {
      this.destroy();
      this.View.remove();
      return this.ListView.remove();
    }
  });
  this.CompositionList = Backbone.Collection.extend({
    model: Composition,
    localStorage: new Store("compositions")
  });
  this.CompositionListView = Backbone.View.extend({
    tagName: "div",
    className: "composition-list",
    template: _.template($('#composition-list-template').html()),
    events: {
      "click .comp_load_button": "load",
      "click .comp_export_button": "export",
      "click .comp_delete_button": "delete"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$('.comp_load_button').button({
        icons: {
          primary: "ui-icon-folder-open"
        }
      });
      this.$('.comp_export_button').button({
        icons: {
          primary: "ui-icon-clipboard"
        }
      });
      this.$('.comp_delete_button').button({
        icons: {
          primary: "ui-icon-trash"
        }
      });
      return this;
    },
    initialize: function() {
      this.render();
      return $("#comp_dialog").append($(this.el));
    },
    save: function() {
      return this.render();
    },
    load: function() {
      return App.loadComposition(this.model);
    },
    "export": function() {
      $("#comp_export_dialog textarea").text(JSON.stringify(this.model));
      return $("#comp_export_dialog").dialog({
        modal: true,
        width: 400,
        height: 300
      });
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this composition (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    remove: function() {
      return $(this.el).remove();
    }
  });
  this.CompositionView = Backbone.View.extend({
    tagName: "div",
    className: "composition",
    template: _.template($('#composition-template').html()),
    events: {
      "click .composition-save-button": "save",
      "click .composition-export-button": "export",
      "mouseover .navigable": "mouseoverNavigable",
      "keydown .automulti": "automulti",
      "keydown .automulti2": "automulti2",
      "click .pattern-add-link": "addPattern"
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
      return this.$(".patterns-tabs").tabs();
    },
    initialize: function() {
      this.render();
      return $("#setup").append($(this.el));
    },
    mouseoverNavigable: function(e) {
      return $(e.currentTarget).focus();
    },
    addPattern: function() {
      var newPattern, trigger_id;
      trigger_id = this.model.Patterns.models.length;
      newPattern = new Pattern({
        Composition: App.Composition,
        trigger: trigger_id,
        beats: 16
      });
      this.model.Patterns.add(newPattern);
      return newPattern.initializeView();
    },
    automulti: function(e) {
      var player, triggerid;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid === -1) {
        return;
      }
      player = Math.floor(triggerid / 10);
      if (this.model.Players.models[player]) {
        return this.model.Players.models[player].View.trigger(triggerid % 10);
      }
    },
    automulti2: function(e) {
      var player, trigger, triggerid, triggers, _i, _len, _ref;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid === -1) {
        return;
      }
      triggers = [];
      _ref = this.model.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        trigger = {};
        trigger.player = player;
        trigger.trigger = triggerid;
        triggers.push(trigger);
      }
      return this.model.multitrigger(triggers);
    },
    save: function() {
      this.model.save({
        title: $.trim(this.$(".comp_info_title").text()),
        mixer: $.trim(this.$(".comp_info_mixer").text()),
        description: $.trim(this.$(".comp_info_description").text()),
        bpm: parseInt(this.$(".comp_info_bpm").val())
      });
      this.model.setBpm(parseInt($("#bpm").val()));
      return this.model.ListView.render();
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
      var player, _i, _len, _ref;
      _ref = this.model.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        App.postMessageToViewer("remove", player.cid);
      }
      return $(this.el).remove();
    }
  });
}).call(this);
