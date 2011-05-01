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
      this.Players = new PlayerList();
      this.Triggers = [];
      this.addTrigger(0, 0);
      if (this.get("title") === "") {
        return this.set({
          "title": this.get("ytid")
        });
      }
    },
    initializeView: function() {
      var player, _i, _len, _ref;
      this.View = new VideoView({
        model: this
      });
      _ref = this.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        player.initializeView();
      }
      return this.View.updateTriggers();
    },
    addTrigger: function(position, time) {
      if (position < App.triggers.length) {
        time = parseFloat(time);
        if (this.Triggers.indexOf(time) === -1) {
          this.Triggers[position] = time;
        }
      }
      if (this.View) {
        return this.View.updateTriggers();
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
        duration: parseFloat(this.get("duration")),
        webm: this.get("webm"),
        mp4: this.get("mp4"),
        ytid: this.get("ytid"),
        triggers: this.Triggers,
        players: this.Players
      };
    },
    addPlayer: function() {
      return this.Players.add(new Player({
        Composition: this.get("Composition"),
        Video: this
      }));
    },
    remove: function() {
      var player, _i, _len, _ref;
      _ref = this.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        if (player.View) {
          player.View.remove();
        } else {
          player.remove();
        }
      }
      return this.get("Composition").Videos.remove(this);
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
      "click .video-edit-triggers": "editTriggers",
      "click .video-edit-sources": "editSources",
      "click .video-addplayer": "addPlayer",
      "click .video-delete": "delete",
      "blur .video-webm": "saveWebm",
      "click .video-webm-test": "testWebm",
      "blur .video-mp4": "saveMp4",
      "click .video-mp4-test": "testMp4",
      "blur .video-ytid": "saveYtid",
      "click .video-ytid-test": "testYtid",
      "blur .video-duration": "saveDuration"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.render();
      this.$(".video-edit-triggers").button({
        icons: {
          primary: "ui-icon-tag"
        }
      });
      this.$(".video-edit-sources").button({
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
      this.$(".video-triggers").hide();
      this.$(".video-sources").hide();
      this.$(".video-ytid-test").button({
        icons: {
          primary: "ui-icon-video"
        }
      });
      this.$(".video-webm-test").button({
        icons: {
          primary: "ui-icon-video"
        }
      });
      this.$(".video-mp4-test").button({
        icons: {
          primary: "ui-icon-video"
        }
      });
      return this.model.get("Composition").View.$(".videos").append($(this.el));
    },
    saveTitle: function() {
      return this.model.set({
        "title": this.$(".video-title").text().trim()
      });
    },
    editTriggers: function() {
      return this.$(".video-triggers").toggle('fast');
    },
    editSources: function() {
      this.$(".video-test").empty();
      return this.$(".video-sources").toggle('fast');
    },
    saveWebm: function() {
      var input;
      input = this.$(".video-webm").val().trim();
      return this.model.set({
        webm: input
      });
    },
    saveMp4: function() {
      var input;
      input = this.$(".video-mp4").val().trim();
      return this.model.set({
        mp4: input
      });
    },
    saveYtid: function() {
      var input;
      input = this.$(".video-ytid").val().trim();
      if (input.indexOf("youtube.com") !== -1) {
        input = input.split("v=")[1].split("&")[0];
        this.$(".video-ytid").val(input);
      }
      return this.model.set({
        ytid: input
      });
    },
    saveDuration: function() {
      var duration;
      duration = parseFloat(this.$(".video-duration").val());
      if (duration === duration) {
        return this.model.set({
          "duration": duration
        });
      }
    },
    setDuration: function(time) {
      time = parseFloat(time);
      if (time === time) {
        this.$(".video-duration").val(time);
        return this.saveDuration();
      }
    },
    testWebm: function() {
      return this.testHtml5();
    },
    testMp4: function() {
      return this.testHtml5();
    },
    testHtml5: function() {
      var mp4, source, video, webm;
      $(".video-test").empty();
      video = $('<video autobuffer="metadata" controls></video>').data({
        video_id: this.model.cid
      }).bind("loadedmetadata", function() {
        var video_id;
        video_id = $(this).data("video_id");
        return App.Composition.Videos.getByCid(video_id).View.setDuration(this.duration);
      });
      webm = this.model.get("webm");
      if (_.isString(webm) && webm !== "") {
        source = $("<source />").attr({
          src: webm,
          type: "video/webm"
        });
        video.append(source);
      }
      mp4 = this.model.get("mp4");
      if (_.isString(mp4) && mp4 !== "") {
        source = $("<source />").attr({
          src: mp4,
          type: "video/mp4"
        });
        video.append(source);
      }
      return this.$(".video-test").append(video);
    },
    testYtid: function() {
      var atts, params, videodiv, ytid;
      $(".video-test").empty();
      ytid = this.model.get("ytid");
      if (_.isString(ytid) && ytid !== "") {
        videodiv = $('<div id="yt_test_d"></div>').data({
          "ytid": ytid,
          video_id: this.model.cid
        });
        videodiv.append($('<div id="yt_test"></div>'));
        this.$(".video-test").append(videodiv);
        params = {
          allowScriptAccess: "always",
          wmode: "opaque"
        };
        atts = {
          id: "yt_test"
        };
        return swfobject.embedSWF("http://www.youtube.com/e/" + ytid + "?enablejsapi=1&version=3&playerapiid=test", "yt_test", "480", "360", "8", null, null, params, atts);
      }
    },
    addPlayer: function() {
      return this.model.addPlayer();
    },
    updateTriggers: function() {
      var left, trigger, triggersformhtml, triggershtml, _i, _len, _ref;
      triggershtml = "";
      triggersformhtml = "";
      _ref = this.model.Triggers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        trigger = _ref[_i];
        if (trigger !== null && trigger >= 0 && this.model.get("duration") > 0) {
          left = trigger / this.model.get("duration") * 100;
          if (left <= 100) {
            triggershtml += "<span class='showtrigger v_" + this.model.cid + "_t_" + _i + "' style='left:" + left + "%;'>" + App.triggers[_i] + "</span>";
          }
        }
      }
      return $(".showtriggers_" + this.model.cid).html(triggershtml);
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this video (" + this.model.cid + ") and all players?")) {
        $(this.el).remove();
        return this.model.remove();
      }
    }
  });
  window.onYouTubePlayerReady = function(id) {
    var player, ytid;
    player = document.getElementById("yt_test");
    ytid = $("#yt_test_d").data("ytid");
    player.loadVideoById(ytid, 0, "medium");
    player.addEventListener("onError", "onPlayerError");
    return player.addEventListener("onStateChange", "onPlayerStateChange");
  };
  window.onPlayerError = function(errorCode) {
    var error;
    switch (errorCode) {
      case 2:
        error = "invalid video id";
        break;
      case 100:
        error = "video not found";
        break;
      case 101:
      case 150:
        error = "embedding not allowed";
        break;
      default:
        error = "unknown error";
    }
    return alert(("youtube error " + errorCode + ": ") + error);
  };
  window.onPlayerStateChange = function(e) {
    var player, video_id;
    if (e === 1) {
      player = document.getElementById("yt_test");
      video_id = $(player).parent().data("video_id");
      return App.Composition.Videos.getByCid(video_id).View.setDuration(player.getDuration());
    }
  };
}).call(this);
