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
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    Meemoo is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General
    Public License along with Meemoo.  If not, see
    <http://www.gnu.org/licenses/>.

  */  this.VideoView = Backbone.View.extend({
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
      "blur .video-duration": "saveDuration",
      "click .video-triggers-fill-straight": "triggersFillStraight",
      "click .video-triggers-fill-staggered": "triggersFillStaggered",
      "click .video-triggers-sort": "triggersSort",
      "click .video-triggers-clear": "triggersClear",
      "blur .video-triggers-edit input": "triggerEditInput"
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
      this.$(".video-triggers button").button();
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
    triggersFillStraight: function() {
      var division, duration, i, triggers, _ref;
      duration = parseFloat(this.model.get("duration"));
      if (duration === duration) {
        division = duration / App.triggers.length;
        triggers = [];
        for (i = 0, _ref = App.triggers.length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          triggers.push(i * division);
        }
        this.model.set({
          "triggers": triggers
        });
        return this.updateTriggers();
      }
    },
    triggersFillStaggered: function() {
      var col, division, duration, i, row, triggers, _ref;
      duration = parseFloat(this.model.get("duration"));
      if (duration === duration) {
        division = duration / App.triggers.length;
        triggers = [];
        for (i = 0, _ref = App.triggers.length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          row = Math.floor(i / 4);
          col = Math.floor(i % 4);
          triggers[col * 10 + row] = i * division;
        }
        this.model.set({
          "triggers": triggers
        });
        return this.updateTriggers();
      }
    },
    triggersSort: function() {
      var sorted, unsorted;
      unsorted = this.model.get("triggers");
      sorted = unsorted.sort(function(a, b) {
        if (a === null) {
          return 1;
        } else if (b === null) {
          return -1;
        } else {
          return a - b;
        }
      });
      this.model.set({
        "triggers": sorted
      });
      return this.updateTriggers();
    },
    triggersClear: function() {
      this.model.set({
        "triggers": [0]
      });
      return this.updateTriggers();
    },
    triggerEditInput: function(e) {
      var idx, input, time;
      input = $(e.target);
      idx = input.attr("data-idx");
      time = parseFloat(input.val());
      if (time === time) {
        return this.model.addTrigger(idx, time);
      }
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
        this.saveDuration();
        if (this.model.get("triggers").length === 0) {
          return this.triggersFillStaggered();
        }
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
      var duration, i, left, trigger, triggers, triggershtml, _ref;
      triggershtml = "";
      duration = parseFloat(this.model.get("duration"));
      if (duration === duration && duration > 0) {
        triggers = this.model.get("triggers");
        for (i = 0, _ref = App.triggers.length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          trigger = triggers[i];
          if (trigger !== null && trigger >= 0) {
            this.$(".video-triggers-edit-" + i + " input").val(trigger);
            left = trigger / duration * 100;
            if (left <= 100) {
              triggershtml += "<span class='showtrigger v_" + this.model.cid + "_t_" + i + "' style='left:" + left + "%;'>" + App.triggers[i] + "</span>";
            }
          } else {
            this.$(".video-triggers-edit-" + i + " input").val("");
          }
        }
        return $(".showtriggers_" + this.model.cid).html(triggershtml);
      }
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