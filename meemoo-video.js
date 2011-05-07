(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  This file is part of Meemoo.

    Meemoo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Meemoo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Meemoo.  If not, see <http://www.gnu.org/licenses/>.

  */  this.Video = Backbone.Model.extend({
    defaults: {
      "title": ""
    },
    initialize: function() {
      var loadthis;
      this.Players = new PlayerList();
      this.Triggers = [];
      this.addTrigger(0, 0);
      loadthis = this.get("firstValue");
      if (loadthis && loadthis !== "") {
        if (loadthis.indexOf(".webm") !== -1) {
          this.set({
            webm: loadthis
          });
        } else if (loadthis.indexOf(".mp4") !== -1 || loadthis.indexOf(".m4v") !== -1 || loadthis.indexOf(".mov") !== -1) {
          this.set({
            mp4: loadthis
          });
        } else if (loadthis.indexOf("youtube.com") !== -1) {
          loadthis = loadthis.split("v=")[1].split("&")[0];
          this.set({
            ytid: loadthis
          });
        } else {
          this.set({
            ytid: loadthis
          });
        }
      }
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
    testFirst: function() {
      var mp4, webm, ytid;
      webm = this.model.get("webm");
      if (_.isString(webm) && webm !== "") {
        this.testWebm();
        return;
      }
      mp4 = this.model.get("mp4");
      if (_.isString(mp4) && mp4 !== "") {
        this.testMp4();
        return;
      }
      ytid = this.model.get("ytid");
      if (_.isString(ytid) && ytid !== "") {
        this.testYtid();
      }
    },
    testWebm: function() {
      var source, video, webm;
      webm = this.model.get("webm");
      if (_.isString(webm) && webm !== "") {
        video = this.testHtml5();
        source = $("<source />").attr({
          src: webm,
          type: "video/webm"
        });
        video.append(source);
        return this.$(".video-test").append(video);
      }
    },
    testMp4: function() {
      var mp4, source, video;
      this.testHtml5();
      mp4 = this.model.get("mp4");
      if (_.isString(mp4) && mp4 !== "") {
        video = this.testHtml5();
        source = $("<source />").attr({
          src: mp4,
          type: "video/mp4"
        });
        video.append(source);
        return this.$(".video-test").append(video);
      }
    },
    testHtml5: function() {
      var video;
      $(".video-test").empty();
      video = $('<video autobuffer="metadata" controls></video>').data({
        video_id: this.model.cid
      }).bind("loadedmetadata", function() {
        var video_id;
        video_id = $(this).data("video_id");
        return App.Composition.Videos.getByCid(video_id).View.setDuration(this.duration);
      });
      return video;
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
      var duration;
      duration = parseFloat(this.model.get("duration"));
      if (duration !== duration) {
        alert("Please [Edit sources] and input the video's duration before adding a player.");
        return;
      }
      this.model.addPlayer();
      return _gaq.push(['_trackEvent', 'Video', 'Add Player ' + this.model.get("ytid"), JSON.stringify(this.model)]);
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
