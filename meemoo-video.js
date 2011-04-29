(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Video = Backbone.Model.extend({
    defaults: {
      "title": ""
    },
    initialize: function() {
      this.Triggers = [];
      this.addTrigger(0, 0);
      if (this.get("title") === "") {
        this.set({
          "title": this.get("ytid")
        });
      }
      if (this.get("Composition") === App.Composition) {
        return this.initializeView();
      }
    },
    initializeView: function() {
      return this.View = new VideoView({
        model: this
      });
    },
    addTrigger: function(position, time) {
      if (position < App.triggers.length) {
        time = parseFloat(time);
        if (this.Triggers.indexOf(time) === -1) {
          return this.Triggers[position] = time;
        }
      }
    },
    change: function() {
      if (this.View) {
        return this.View.updateTriggers();
      }
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        title: this.get("title"),
        ytid: this.get("ytid"),
        webm: this.get("webm"),
        mp4: this.get("mp4"),
        triggers: this.Triggers
      };
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
  this.VideoView = Backbone.View.extend({
    tagName: "div",
    className: "video",
    template: _.template($('#video-template').html()),
    events: {
      "blur .video-title": "saveTitle",
      "click .video-edittriggers": "editTriggers",
      "click .video-addplayer": "addPlayer",
      "click .video-delete": "delete"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.render();
      this.$(".video-edittriggers").button({
        icons: {
          primary: "ui-icon-pencil"
        }
      });
      this.$(".video-addplayer").button({
        icons: {
          primary: "ui-icon-plus"
        }
      });
      this.$(".video-delete").button({
        icons: {
          primary: "ui-icon-trash"
        },
        text: false
      });
      this.model.get("Composition").View.$(".videos").append($(this.el));
      return this.updateTriggers();
    },
    saveTitle: function() {
      return this.model.set({
        "title": this.$(".video-title").text()
      });
    },
    updateTriggers: function() {
      var left, trigger, triggershtml, _i, _len, _ref;
      triggershtml = "";
      _ref = this.model.Triggers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        trigger = _ref[_i];
        if (trigger !== null && trigger >= 0 && this.model.get("totaltime") > 0) {
          left = trigger / this.model.get("totaltime") * 100;
          if (left < 100) {
            triggershtml += "<span class='showtrigger v_" + this.model.cid + "_t_" + _i + "' style='left:" + left + "%;'>" + App.triggers[_i] + "</span>";
          }
        }
      }
      return $(".showtriggers_" + this.model.cid).html(triggershtml);
    }
  });
}).call(this);
