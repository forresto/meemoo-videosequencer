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
      var loadComp, newPattern, newPlayer, newSeq, newSeqTrack, newTrack, newVideo, old_player_id, pastedJSON, pattern, player, sequence, track, video, _i, _j, _k, _l, _len, _len10, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.get("loadJSON") !== void 0) {
        pastedJSON = this.get("loadJSON");
        if (pastedJSON !== "") {
          loadComp = JSON.parse(pastedJSON);
          if (loadComp.id) {
            this.attributes.parent_id = loadComp.id;
            if (loadComp.parent_id) {
              this.attributes.parent_id += "," + loadComp.parent_id;
            }
          }
          if (loadComp.bpm) {
            this.attributes.bpm = loadComp.bpm;
          }
          if (loadComp.description) {
            this.attributes.description = "Forked from " + loadComp.title + " by " + loadComp.mixer + " --- " + loadComp.description;
          }
          if (loadComp.mixer) {
            this.attributes.mixer = loadComp.mixer;
          }
          if (loadComp.patterns) {
            this.attributes.patterns = loadComp.patterns;
          }
          if (loadComp.title) {
            this.attributes.title = "Re: " + loadComp.title;
          }
          if (loadComp.sequences) {
            this.attributes.sequences = loadComp.sequences;
          }
          if (loadComp.videos) {
            this.attributes.videos = loadComp.videos;
          }
        }
      }
      this.Videos = new VideoList();
      if (this.attributes.videos) {
        _ref = this.attributes.videos;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          video = _ref[_i];
          newVideo = new Video({
            Composition: this,
            title: video.title,
            duration: video.duration,
            webm: video.webm,
            mp4: video.mp4,
            ytid: video.ytid
          });
          newVideo.Triggers = video.triggers;
          video.newcid = newVideo.cid;
          this.Videos.add(newVideo);
          if (video.players) {
            _ref2 = video.players;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              player = _ref2[_j];
              newPlayer = new Player({
                Composition: this,
                Video: newVideo
              });
              newPlayer.oldcid = player.id;
              player.newcid = newPlayer.cid;
              newVideo.Players.add(newPlayer);
            }
          }
        }
      }
      if (this.attributes.players) {
        _ref3 = this.attributes.players;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          player = _ref3[_k];
          _ref4 = this.attributes.videos;
          for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
            video = _ref4[_l];
            if (player.video_id === video.id) {
              newVideo = this.Videos.getByCid(video.newcid);
              newPlayer = new Player({
                Composition: this,
                Video: newVideo
              });
              newPlayer.oldcid = player.id;
              player.newcid = newPlayer.cid;
              newVideo.Players.add(newPlayer);
              break;
            }
          }
        }
      }
      this.Patterns = new PatternList();
      if (this.attributes.patterns) {
        _ref5 = this.attributes.patterns;
        for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
          pattern = _ref5[_m];
          newPattern = new Pattern({
            Composition: this,
            trigger_id: pattern.trigger_id,
            next: pattern.next,
            chance: pattern.chance,
            beats: pattern.beats
          });
          this.Patterns.add(newPattern);
          pattern.newcid = newPattern.cid;
          if (pattern.tracks) {
            _ref6 = pattern.tracks;
            for (_n = 0, _len6 = _ref6.length; _n < _len6; _n++) {
              track = _ref6[_n];
              old_player_id = track.player_id;
              _ref7 = this.Videos.models;
              for (_o = 0, _len7 = _ref7.length; _o < _len7; _o++) {
                video = _ref7[_o];
                _ref8 = video.Players.models;
                for (_p = 0, _len8 = _ref8.length; _p < _len8; _p++) {
                  player = _ref8[_p];
                  if (old_player_id === player.oldcid) {
                    newTrack = newPattern.addTrack(player);
                    newTrack.setLine(track.line);
                    break;
                  }
                }
              }
            }
          }
        }
      }
      this.Pattern = null;
      this.nextPattern = null;
      this.playing = false;
      this.queuedMessages = "";
      this.Sequences = new SequenceList();
      if (this.attributes.sequences) {
        _ref9 = this.attributes.sequences;
        for (_q = 0, _len9 = _ref9.length; _q < _len9; _q++) {
          sequence = _ref9[_q];
          newSeq = new Sequence({
            Composition: this,
            length: sequence.length
          });
          this.Sequences.add(newSeq);
          if (sequence.tracks) {
            _ref10 = sequence.tracks;
            for (_r = 0, _len10 = _ref10.length; _r < _len10; _r++) {
              track = _ref10[_r];
              if (track.line.length > 0) {
                newSeqTrack = newSeq.addTrack();
                newSeqTrack.setLine(track.line);
              }
            }
          }
        }
      }
      this.Sequence = null;
      this.nextSequence = null;
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
      if ((0 < bpm && bpm < 500)) {
        this.set({
          bpm: bpm
        });
        this.bpm = bpm;
        return this.bpm_ms = Math.round(1000 / this.bpm * 60);
      }
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
      try {
        this.Pattern.step();
        this.play();
      } catch (_e) {}
      return this.sendQueuedMessages();
    },
    cuePattern: function(pattern) {
      this.nextPattern = pattern;
      if (this.playing === false) {
        this.Pattern = pattern;
        this.nextPattern = null;
        return this.play();
      }
    },
    cueSequence: function(sequence) {
      this.nextSequence = sequence;
      if (this.playing === false) {
        this.Sequence = sequence;
        this.nextSequence = null;
        this.loop();
        return this.play();
      }
    },
    playSequence: function(sequence) {
      this.Sequence = sequence;
      this.nextPattern = null;
      this.loop();
      return this.play();
    },
    stopSequence: function(sequence) {
      if (this.Sequence === sequence) {
        return this.Sequence = null;
      }
    },
    loop: function() {
      var choice, choices, next_id, pattern, rnd, sum_of_chance, _i, _j, _len, _len2, _ref, _results;
      if (this.nextPattern !== null) {
        this.Pattern = this.nextPattern;
        this.nextPattern = null;
        this.Sequence = null;
        return;
      }
      if (this.nextSequence !== null) {
        this.Sequence = this.nextSequence;
        this.nextSequence = null;
      }
      next_id = null;
      if (this.Sequence !== null) {
        next_id = this.Sequence.step();
      }
      if (next_id === null) {
        if (this.Pattern !== null) {
          next_id = this.Pattern.get("next");
        }
      }
      sum_of_chance = 0;
      choices = [];
      _ref = this.Patterns.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pattern = _ref[_i];
        if (pattern.get("trigger_id") === next_id) {
          sum_of_chance += pattern.get("chance");
          choices.push(pattern);
        }
      }
      if (choices.length === 1) {
        return this.Pattern = choices[0];
      } else if (choices.length > 1) {
        rnd = Math.random() * sum_of_chance;
        _results = [];
        for (_j = 0, _len2 = choices.length; _j < _len2; _j++) {
          choice = choices[_j];
          if (rnd < choice.get("chance")) {
            this.Pattern = choice;
            return;
          }
          _results.push(rnd -= choice.get("chance"));
        }
        return _results;
      }
    },
    multitrigger: function(triggers) {
      var item, message, seconds, _i, _len;
      message = "";
      for (_i = 0, _len = triggers.length; _i < _len; _i++) {
        item = triggers[_i];
        seconds = item.player.Video.Triggers[item.trigger];
        if (seconds !== null && seconds !== void 0) {
          message += "seek::";
          message += "" + item.player.cid + "::";
          message += "" + seconds + "|";
        }
      }
      if (message !== "") {
        return App.postRawMessageToViewer(message);
      }
    },
    queueMessage: function(message) {
      return this.queuedMessages += message + "|";
    },
    sendQueuedMessages: function() {
      App.postRawMessageToViewer(this.queuedMessages);
      return this.queuedMessages = "";
    },
    initializeView: function() {
      var pattern, sequence, video, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
      this.View = new CompositionView({
        model: this
      });
      _ref = this.Videos.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        video.initializeView();
      }
      _ref2 = this.Patterns.models;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        pattern = _ref2[_j];
        pattern.initializeView();
      }
      _ref3 = this.Sequences.models;
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        sequence = _ref3[_k];
        sequence.initializeView();
      }
      this.saveLastSaved();
      return setTimeout("App.reloadVideos()", 2000);
    },
    addVideo: function() {
      var newVideo;
      newVideo = new Video({
        Composition: this
      });
      this.Videos.add(newVideo);
      return newVideo;
    },
    addPattern: function() {
      var newPattern, trigger_id;
      trigger_id = this.Patterns.models.length;
      newPattern = new Pattern({
        Composition: this,
        trigger_id: trigger_id,
        next: trigger_id
      });
      this.Patterns.add(newPattern);
      newPattern.addTracks();
      return newPattern;
    },
    addSequence: function() {
      var newSequence;
      newSequence = new Sequence({
        Composition: this
      });
      this.Sequences.add(newSequence);
      newSequence.addTrack();
      return newSequence;
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
        patterns: this.Patterns,
        sequences: this.Sequences,
        parent_id: this.get("parent_id")
      };
    },
    "delete": function() {
      this.destroy();
      this.ListView.remove();
      try {
        return this.View.remove();
      } catch (_e) {}
    },
    saveLastSaved: function() {
      return this.lastsaved = JSON.stringify(this);
    },
    changesMade: function() {
      var unsaved;
      unsaved = this.lastsaved !== JSON.stringify(this);
      if (this.View && unsaved) {
        this.View.$(".composition-save-button").button({
          label: "Save!!!"
        });
      }
      return unsaved;
    },
    getPlayerByCid: function(cid) {
      var player, video, _i, _j, _len, _len2, _ref, _ref2;
      _ref = this.Videos.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _ref2 = video.Players.models;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          player = _ref2[_j];
          if (player.cid === cid) {
            return player;
          }
        }
      }
      return null;
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
    load: function() {
      if (App.Composition.changesMade()) {
        if (!confirm("You have unsaved changes in the current composition. Discard unsaved changes?")) {
          $("#comp_dialog").dialog("close");
          return;
        }
      }
      App.loadComposition(this.model);
      return $("#comp_dialog").dialog("close");
    },
    "export": function() {
      $("#comp_export_dialog textarea").text(JSON.stringify(this.model));
      return $("#comp_export_dialog").dialog({
        width: 400,
        height: 300,
        position: "right top"
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
      newVideo = this.model.addVideo();
      newVideo.initializeView();
      return newVideo.View.$(".video-sources").show();
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
      var player, seconds, triggerid, triggers, video, _i, _len, _ref, _results;
      triggerid = App.keycodes.indexOf(e.keyCode);
      if (triggerid === -1) {
        return;
      }
      triggers = "";
      _ref = this.Videos.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        seconds = parseFloat(video.Triggers[trigger]);
        _results.push((function() {
          var _i, _len, _ref;
          if (seconds !== seconds) {
            _ref = video.Players.models;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              player = _ref[_i];
              triggers += "seek::" + player.cid + "::" + seconds + "|";
            }
            return App.postRawMessageToViewer(triggers);
          }
        })());
      }
      return _results;
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
      return this.$(".composition-save-button").button({
        label: "Save"
      });
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
