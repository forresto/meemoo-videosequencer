(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Player = Backbone.Model.extend({
    initialize: function() {
      if (this.get("ytid")) {
        this.Video = this.get("Composition").Videos.getOrAddVideo(this.get("ytid"));
      }
      if (this.get("Composition") === App.Composition) {
        this.initializeView();
        return this.Video.initializeView();
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
      window.App.postMessageToViewer("play", this.model.cid);
      return this.model.Video.View.updateTriggers();
    },
    pause: function() {
      this.model.set({
        playing: false
      });
      window.App.postMessageToViewer("pause", this.model.cid);
      return this.model.Video.View.updateTriggers();
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
      seekpercent = (e.layerX - 5) / $(e.currentTarget).width();
      return this.seek(seekpercent * this.model.get('totaltime'));
    },
    seek: function(seconds) {
      if (this.model.get('loaded') === this.model.get('totalsize') || (seconds + 10) / this.model.get('totaltime') < this.model.get('loaded') / this.model.get('totalsize')) {
        this.$('.playprogress').progressbar("value", seconds / this.model.get('totaltime') * 100);
        return window.App.postMessageToViewer("seek", this.model.cid, seconds);
      }
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
        case 37:
          return this.triggerArp(true);
        case 39:
          return this.triggerArp(false);
        default:
          return this.triggerCode(e.keyCode);
      }
    },
    triggerCode: function(keyCode) {
      var triggerid;
      triggerid = App.keycodes.indexOf(keyCode);
      return this.trigger(triggerid);
    },
    trigger: function(triggerid) {
      var seconds;
      if (triggerid !== -1) {
        seconds = this.model.Video.Triggers[triggerid];
        if (seconds === void 0 || seconds === null) {
          return this.model.Video.addTrigger(triggerid, this.model.get('time'));
        } else {
          this.lastTrigger = triggerid;
          return this.seek(seconds);
        }
      }
    },
    triggerArp: function(prev) {
      var last, seconds;
      last = this.lastTrigger;
      seconds = null;
      if (prev) {
        while (last > 0 && (seconds === null || seconds === void 0)) {
          last--;
          seconds = this.model.Video.Triggers[last];
        }
        if (last === 0) {
          seconds = 0;
        }
      } else {
        while (last < this.model.Video.Triggers.length - 1 && (seconds === null || seconds === void 0)) {
          last++;
          seconds = this.model.Video.Triggers[last];
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
}).call(this);
