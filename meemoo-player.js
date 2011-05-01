(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Player = Backbone.Model.extend({
    defaults: {
      "volume": 100
    },
    initialize: function() {
      if (this.get("Composition") === App.Composition) {
        return this.initializeView();
      }
    },
    initializeView: function() {
      this.View = new PlayerView({
        model: this
      });
      return this.set({
        playing: true
      });
    },
    remove: function() {
      return this.get("Video").Players.remove(this);
    },
    change: function() {
      return this.View.updateinfo();
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        volume: parseInt(this.get("volume"))
      };
    }
  });
  this.PlayerList = Backbone.Collection.extend({
    model: Player
  });
  this.PlayerView = Backbone.View.extend({
    tagName: "div",
    className: "control",
    template: _.template($('#control-template').html()),
    lastTrigger: 0,
    events: {
      "click .playbutton": "play",
      "click .pausebutton": "pause",
      "click .mutebutton": "mute",
      "click .unmutebutton": "unmute",
      "slide .volumeslider": "volume",
      "click .addtriggerbutton": "addtrigger",
      "click .removebutton": "removeConfirm",
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
      this.model.set({
        volume: ui.value
      });
      return window.App.postMessageToViewer("volume", this.model.cid, ui.value);
    },
    removeConfirm: function() {
      if (confirm("Are you sure you want to remove this player (" + this.model.cid + ")?")) {
        return this.remove();
      }
    },
    remove: function() {
      window.App.postMessageToViewer("remove", this.model.cid);
      $(this.el).remove();
      return this.model.remove();
    },
    addtrigger: function() {
      var freeTrigger, i, lastTriggerTime, trigger, _i, _len, _ref, _results;
      if (this.model.get('totaltime') > 0) {
        lastTriggerTime = 0;
        _ref = this.model.get("Video").Triggers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          trigger = _ref[_i];
          if (trigger > lastTriggerTime) {
            lastTriggerTime = Math.ceil(trigger);
          }
        }
        freeTrigger = this.model.get("Video").Triggers.length;
        _results = [];
        for (i = 0; i <= 8; i++) {
          _results.push(this.model.get("Video").addTrigger(freeTrigger + i, lastTriggerTime + ((i + 1) * 2)));
        }
        return _results;
      }
    },
    playprogressOver: function(e) {
      return $(e.currentTarget).focus();
    },
    playprogressClick: function(e) {
      var seekpercent;
      seekpercent = (e.layerX - 5) / $(e.currentTarget).width();
      return this.seek(seekpercent * this.model.get('totaltime'));
    },
    seek: function(seconds) {
      return window.App.postMessageToViewer("seek", this.model.cid, seconds);
    },
    focusPrev: function() {
      this.$('.playprogress').parent().prev().children('.playprogress').focus();
      return false;
    },
    focusNext: function() {
      this.$('.playprogress').parent().next().children('.playprogress').focus();
      return false;
    },
    playprogressKey: function(e) {
      switch (e.keyCode) {
        case 32:
          this.playpause();
          break;
        case 38:
          this.focusPrev();
          break;
        case 40:
          this.focusNext();
          break;
        case 37:
          this.triggerArp(true);
          break;
        case 39:
          this.triggerArp(false);
          break;
        default:
          this.triggerCode(e.keyCode);
      }
      return false;
    },
    triggerCode: function(keyCode) {
      var triggerid;
      triggerid = App.keycodes.indexOf(keyCode);
      if (triggerid !== -1) {
        return this.triggerOrAdd(triggerid);
      }
    },
    triggerOrAdd: function(triggerid) {
      var seconds;
      seconds = parseFloat(this.model.get("Video").Triggers[triggerid]);
      if (seconds !== seconds) {
        return this.model.get("Video").addTrigger(triggerid, this.model.get('time'));
      } else {
        this.lastTrigger = triggerid;
        return this.seek(seconds);
      }
    },
    trigger: function(triggerid) {
      var seconds;
      seconds = this.model.get("Video").Triggers[triggerid];
      if (seconds === void 0 || seconds === null) {
        return;
      }
      this.lastTrigger = triggerid;
      return this.seek(seconds);
    },
    triggerArp: function(prev) {
      var last, seconds;
      last = this.lastTrigger;
      seconds = null;
      if (prev) {
        while (last > 0 && (seconds === null || seconds === void 0)) {
          last--;
          seconds = this.model.get("Video").Triggers[last];
        }
        if (last === 0) {
          seconds = 0;
        }
      } else {
        while (last < this.model.get("Video").Triggers.length - 1 && (seconds === null || seconds === void 0)) {
          last++;
          seconds = this.model.get("Video").Triggers[last];
        }
      }
      if (seconds !== void 0 && seconds !== null) {
        this.lastTrigger = last;
        return this.seek(seconds);
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
    create: function() {
      var mp4, video, webm, ytid;
      video = this.model.get("Video");
      webm = video.get("webm");
      mp4 = video.get("mp4");
      ytid = video.get("ytid");
      if (webm && webm !== "" && Modernizr.video.webm !== "no") {
        return App.postMessageToViewer("createW", this.model.cid, webm);
      } else if (mp4 && mp4 !== "" && Modernizr.video.mp4 !== "no") {
        return App.postMessageToViewer("createM", this.model.cid, mp4);
      } else if (ytid && ytid !== "") {
        return App.postMessageToViewer("createY", this.model.cid, ytid);
      } else {
        return alert("You can't play this video in this browser (;_;)");
      }
    },
    initialize: function() {
      this.create();
      this.render();
      this.model.get("Composition").View.$(".players").append($(this.el));
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
}).call(this);
