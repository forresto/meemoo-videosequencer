(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
  by Forrest Oliphant
  at Sembiki Interactive http://sembiki.com/
  and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  var AppView, Composition, CompositionList, CompositionView, Player, PlayerList, PlayerView, Video, VideoList, VideoView, recieveMessage;
  Composition = Backbone.Model.extend({
    defaults: {
      "title": "untitled composition",
      "description": "mixed with sembiki meemoo audio visual sequencer",
      "mixer": "me!"
    },
    initialize: function() {
      var loadComp, pastedJSON;
      if (this.get("loadJSON") !== void 0) {
        pastedJSON = this.get("loadJSON");
        if (pastedJSON !== "") {
          loadComp = JSON.parse(pastedJSON);
          console.log(loadComp);
        }
      }
      this.Videos = new VideoList();
      this.Players = new PlayerList();
      return this.View = new CompositionView({
        model: this
      });
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        info: {
          title: this.get("title"),
          description: this.get("description"),
          mixer: this.get("mixer")
        },
        videos: this.Videos,
        players: this.Players
      };
    }
  });
  CompositionList = Backbone.Collection.extend({
    model: Composition
  });
  CompositionView = Backbone.View.extend({
    tagName: "div",
    className: "composition",
    template: _.template($('#composition-template').html()),
    events: {
      "click .comp_load_button": "load",
      "click .comp_save_button": "save",
      "click .comp_delete_button": "delete"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.render();
      $("#comp_dialog").append($(this.el));
      this.$('.comp_load_button').button({
        icons: {
          primary: "ui-icon-folder-open"
        }
      });
      this.$('.comp_save_button').button({
        icons: {
          primary: "ui-icon-disk"
        }
      });
      return this.$('.comp_delete_button').button({
        icons: {
          primary: "ui-icon-trash"
        }
      });
    },
    load: function() {
      return $("#comp_dialog").dialog();
    },
    save: function() {
      $("#comp_export_dialog textarea").text(JSON.stringify(this.model));
      return $("#comp_export_dialog").dialog({
        modal: true,
        width: 400,
        height: 300
      });
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this composition (" + (this.model.get('title')) + ")?")) {
        return false;
      }
    }
  });
  Video = Backbone.Model.extend({
    initialize: function() {
      this.Triggers = [];
      this.View = new VideoView({
        model: this
      });
      return this.addTrigger(0, 0);
    },
    addTrigger: function(position, time) {
      if (position < App.triggers.length) {
        time = parseFloat(time);
        if (_.indexOf(this.Triggers, time, true) === -1) {
          this.Triggers[position] = time;
          this.Triggers.sort(function(a, b) {
            return a - b;
          });
          return this.View.updateTriggers();
        }
      }
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        ytid: this.get("ytid"),
        triggers: this.Triggers
      };
    }
  });
  VideoList = Backbone.Collection.extend({
    model: Video,
    getOrAddVideo: function(ytid) {
      var newVideo, thisvideo, _i, _len, _ref;
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        thisvideo = _ref[_i];
        if (ytid === thisvideo.get("ytid")) {
          return thisvideo;
        }
      }
      newVideo = new Video({
        ytid: ytid
      });
      this.add(newVideo);
      return newVideo;
    }
  });
  VideoView = Backbone.View.extend({
    tagName: "div",
    className: "video",
    render: function() {
      return this;
    },
    initialize: function() {},
    updateTriggers: function() {
      var left, trigger, triggershtml, _i, _len, _ref;
      triggershtml = "";
      _ref = this.model.Triggers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        trigger = _ref[_i];
        left = trigger / this.model.get("totaltime") * 100;
        triggershtml += "<span class='showtrigger v_" + this.model.cid + "_t_" + _i + "' style='left:" + left + "%;'>" + App.triggers[_i] + "</span>";
      }
      return $(".showtriggers_" + this.model.cid).html(triggershtml);
    }
  });
  Player = Backbone.Model.extend({
    initialize: function() {
      if (this.get("ytid")) {
        this.Video = App.Composition.Videos.getOrAddVideo(this.get("ytid"));
        this.View = new PlayerView({
          model: this
        });
        this.Video.View.updateTriggers();
        return this.set({
          playing: true
        });
      }
    },
    remove: function() {
      return App.Composition.Players.remove(this);
    },
    change: function() {
      return this.View.updateinfo();
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        video_id: this.Video.cid
      };
    }
  });
  PlayerList = Backbone.Collection.extend({
    model: Player
  });
  PlayerView = Backbone.View.extend({
    tagName: "div",
    className: "control",
    template: _.template($('#control-template').html()),
    events: {
      "click .playbutton": "play",
      "click .pausebutton": "pause",
      "click .mutebutton": "mute",
      "click .unmutebutton": "unmute",
      "slide .volumeslider": "volume",
      "click .addtriggerbutton": "addtrigger",
      "click .removebutton": "remove",
      "mouseover .playprogress": "playprogressOver",
      "click .playprogress": "playprogressClick",
      "keydown .playprogress": "playprogressKey"
    },
    playpause: function() {
      if (this.model.get("playing")) {
        return this.pause();
      } else {
        return this.play();
      }
    },
    play: function() {
      this.model.set({
        playing: true
      });
      return window.App.postMessageToViewer("play", this.model.cid);
    },
    pause: function() {
      this.model.set({
        playing: false
      });
      return window.App.postMessageToViewer("pause", this.model.cid);
    },
    mute: function() {
      return window.App.postMessageToViewer("mute", this.model.cid);
    },
    unmute: function() {
      return window.App.postMessageToViewer("unmute", this.model.cid);
    },
    volume: function(e, ui) {
      return window.App.postMessageToViewer("volume", this.model.cid, ui.value);
    },
    remove: function() {
      if (confirm("Are you sure you want to remove this player (" + this.model.cid + ")?")) {
        window.App.postMessageToViewer("remove", this.model.cid);
        $(this.el).remove();
        return this.model.remove();
      }
    },
    addtrigger: function() {
      if (this.model.get('totaltime') > 0) {
        return this.model.Video.addTrigger(this.model.Video.Triggers.length, this.model.get('time'));
      }
    },
    playprogressOver: function(e) {
      return e.currentTarget.focus();
    },
    playprogressClick: function(e) {
      var seekpercent;
      seekpercent = (e.offsetX - 5) / $(e.currentTarget).width();
      if (this.model.get('loaded') === this.model.get('totalsize') || seekpercent < (this.model.get('loaded') - 250000) / this.model.get('totalsize')) {
        return this.seek(seekpercent * this.model.get('totaltime'));
      }
    },
    seek: function(seconds) {
      return window.App.postMessageToViewer("seek", this.model.cid, seconds);
    },
    focusPrev: function() {
      return this.$('.playprogress').parent().prev().children('.playprogress').focus();
    },
    focusNext: function() {
      return this.$('.playprogress').parent().next().children('.playprogress').focus();
    },
    playprogressKey: function(e) {
      switch (e.keyCode) {
        case 32:
          return this.playpause();
        case 38:
          return this.focusPrev();
        case 40:
          return this.focusNext();
        default:
          return this.trigger(e.keyCode);
      }
    },
    trigger: function(keyCode) {
      var seconds, triggerid;
      triggerid = App.keycodes.indexOf(keyCode);
      if (triggerid !== -1) {
        seconds = this.model.Video.Triggers[triggerid];
        if (seconds !== void 0) {
          return this.seek(seconds);
        }
      }
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    updateinfo: function() {
      if (this.model.get('totalsize') > 0) {
        this.$('.statusmessage').html("" + (this.model.get('time')) + " / " + (this.model.get('totaltime')) + " <br /> " + (this.model.get('loaded')) + " / " + (this.model.get('totalsize')));
        this.$('.playprogress').progressbar("value", this.model.get('time') / this.model.get('totaltime') * 100);
        return this.$('.loadprogress').progressbar("value", this.model.get('loaded') / this.model.get('totalsize') * 100);
      }
    },
    initialize: function() {
      window.App.postMessageToViewer("create", this.model.cid, this.model.get("ytid"));
      this.render();
      $("#players").append($(this.el));
      this.$('.playbutton').button({
        icons: {
          primary: "ui-icon-play"
        },
        text: false
      });
      this.$('.pausebutton').button({
        icons: {
          primary: "ui-icon-pause"
        },
        text: false
      });
      this.$('.mutebutton').button({
        icons: {
          primary: "ui-icon-volume-off"
        },
        text: false
      });
      this.$('.unmutebutton').button({
        icons: {
          primary: "ui-icon-volume-on"
        },
        text: false
      });
      this.$('.volumeslider').slider({
        value: 100,
        min: 0,
        max: 100
      });
      this.$('.addtriggerbutton').button({
        icons: {
          primary: "ui-icon-plus"
        },
        text: false
      });
      this.$('.removebutton').button({
        icons: {
          primary: "ui-icon-trash"
        },
        text: false
      });
      this.$('.playprogress').progressbar({
        value: 0
      });
      this.$('.loadprogress').progressbar({
        value: 0
      });
      return this;
    }
  });
  AppView = Backbone.View.extend({
    template: _.template($('#application-template').html()),
    triggers_us: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    keycodes_us: [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191],
    initialize: function() {
      $('#intro').hide();
      $('#application').html(this.template);
      this.triggers = this.triggers_us;
      this.keycodes = this.keycodes_us;
      this.viewer = document.getElementById("viewer").contentWindow;
      $('#popoutbutton').button({
        icons: {
          primary: "ui-icon-newwin"
        }
      }).click(function() {
        return window.App.popoutViewer();
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
      $('#addplayer').button({
        icons: {
          primary: "ui-icon-plus"
        }
      }).click(function() {
        var newId;
        newId = $('#addplayerid').val();
        App.Composition.Players.add(new Player({
          ytid: newId
        }));
        return false;
      });
      this.Compositions = new CompositionList();
      this.Composition = new Composition();
      return this.Compositions.add(this.Composition);
    },
    popoutViewer: function() {
      this.viewer = window.open("viewer.html", "popoutviewer");
      if (this.viewer.name === "popoutviewer") {
        $('#container').hide();
        $('#viewer').remove();
        $('#setup').addClass("floatingsetup");
        return setTimeout("App.reloadVideos()", 2500);
      }
    },
    popinViewer: function() {
      if (this.viewer.name === "popoutviewer") {
        $('#container').prepend('<iframe src="viewer.html" id="viewer" name="inviewer"></iframe>');
        this.viewer = document.getElementById("viewer").contentWindow;
        $('#container').show();
        $('#setup').removeClass("floatingsetup");
        return setTimeout("App.reloadVideos()", 2500);
      }
    },
    reloadVideos: function() {
      var player, _i, _len, _ref, _results;
      _ref = App.Composition.Players.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        _results.push(App.postMessageToViewer("create", player.cid, player.Video.get("ytid")));
      }
      return _results;
    },
    postMessageToViewer: function(action, id, value) {
      return this.viewer.postMessage("" + action + ":" + id + ":" + value, window.location.origin);
    },
    recieveMessage: function(e) {
      var id, info, loaded, player, playerinfo, playerinfos, time, totalsize, totaltime, _i, _len, _results;
      if (e.data === "POPOUTCLOSED") {
        return App.popinViewer();
      } else {
        playerinfos = e.data.split("|");
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
  $(function() {
    return window.App = new AppView();
  });
  recieveMessage = function(e) {
    if (e.origin !== window.location.origin) {
      return;
    }
    return window.App.recieveMessage(e);
  };
  window.addEventListener("message", recieveMessage, false);
}).call(this);
