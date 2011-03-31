(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Video = Backbone.Model.extend({
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
  this.VideoList = Backbone.Collection.extend({
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
  this.VideoView = Backbone.View.extend({
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
        if (trigger !== null) {
          left = trigger / this.model.get("totaltime") * 100;
          triggershtml += "<span class='showtrigger v_" + this.model.cid + "_t_" + _i + "' style='left:" + left + "%;'>" + App.triggers[_i] + "</span>";
        }
      }
      return $(".showtriggers_" + this.model.cid).html(triggershtml);
    }
  });
}).call(this);
