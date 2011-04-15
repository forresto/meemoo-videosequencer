(function() {
  /*

  HTML Audio Visual Sequencer
  by Forrest Oliphant
  at Sembiki Interactive http://sembiki.com/
  and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with jQuery in CoffeeScript

  */  var ASPECT, ASPECTRATIO, appWindow, create, hide, mute, pause, play, playerinfointerval, postMessageToApp, recieveMessage, remove, resizeTimer, seek, show, sizePosition, unmute, volume;
  resizeTimer = null;
  playerinfointerval = null;
  appWindow = window.opener ? window.opener : window.parent ? window.parent : void 0;
  postMessageToApp = function(message) {
    return appWindow.postMessage(message, window.location.protocol + "//" + window.location.host);
  };
  recieveMessage = function(e) {
    var action, id, item, message, messages, value, _i, _len, _results;
    if (e.origin !== window.location.protocol + "//" + window.location.host) {
      return;
    }
    messages = e.data.split("|");
    _results = [];
    for (_i = 0, _len = messages.length; _i < _len; _i++) {
      item = messages[_i];
      message = item.split(":");
      action = message[0];
      id = message[1];
      value = message[2];
      _results.push((function() {
        switch (action) {
          case "create":
            return create(id, value);
          case "remove":
            return remove(id);
          case "seek":
            return seek(id, value);
          case "play":
            return play(id);
          case "pause":
            return pause(id);
          case "hide":
            return hide(id);
          case "show":
            return show(id);
          case "mute":
            return mute(id);
          case "unmute":
            return unmute(id);
          case "volume":
            return volume(id, value);
        }
      })());
    }
    return _results;
  };
  window.addEventListener("message", recieveMessage, false);
  create = function(id, value) {
    var atts, params;
    if ($("#player_d_" + id).length > 0) {
      return;
    }
    if (value.length < 3) {
      return;
    }
    $('#players').append('<div id="player_d_' + id + '" class="player_d"><div id="player_r_' + id + '"></div></div>');
    params = {
      allowScriptAccess: "always",
      wmode: "opaque"
    };
    atts = {
      id: "player_o_" + id
    };
    swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=" + id, "player_r_" + id, "320", "240", "8", null, null, params, atts);
    $('#player_d_' + id).data("ytid", value).data("cid", id);
    return resizeTimer = setTimeout(sizePosition, 250);
  };
  remove = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      player.stopVideo();
      $(player).parent().remove();
      return sizePosition();
    }
  };
  seek = function(id, value) {
    var loadedPercent, player, seekPercent;
    player = document.getElementById("player_o_" + id);
    if (player) {
      loadedPercent = player.getVideoBytesLoaded() / player.getVideoBytesTotal();
      seekPercent = (parseFloat(value) + 20) / player.getDuration();
      if (loadedPercent === 1 || seekPercent < loadedPercent) {
        return player.seekTo(value, false);
      }
    }
  };
  play = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return player.playVideo();
    }
  };
  pause = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return player.pauseVideo();
    }
  };
  hide = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return $(player).parent().hide();
    }
  };
  show = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return $(player).parent().show();
    }
  };
  mute = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return player.mute();
    }
  };
  unmute = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return player.unMute();
    }
  };
  volume = function(id, value) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      return player.setVolume(value);
    }
  };
  window.onYouTubePlayerReady = function(id) {
    var player, ytid;
    player = document.getElementById("player_o_" + id);
    ytid = $("#player_d_" + id).data("ytid");
    player.loadVideoById(ytid, 0, "medium");
    if (playerinfointerval === null) {
      playerinfointerval = setInterval(updatePlayerInfo, 500);
    }
    updatePlayerInfo();
    return player.addEventListener("onError", "onPlayerError");
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
  window.updatePlayerInfo = function() {
    var cid, message, player, playero, _i, _len, _ref;
    message = "";
    _ref = $(".player_d:visible");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      player = _ref[_i];
      cid = $(player).data('cid');
      message += cid + ":";
      playero = document.getElementById("player_o_" + cid);
      if (playero && playero.getDuration) {
        message += playero.getVideoBytesLoaded() + ":" + playero.getVideoBytesTotal() + ":" + playero.getCurrentTime() + ":" + playero.getDuration();
      }
      message += "|";
    }
    return postMessageToApp(message);
  };
  $(window).unload(function() {
    if (window.name === "popoutviewer") {
      postMessageToApp("-=POPOUTCLOSED=-");
    }
    return postMessageToApp("-=REFRESH=-");
  });
  ASPECT = [4, 3];
  ASPECTRATIO = ASPECT[0] / ASPECT[1];
  $(window).resize(function() {
    clearTimeout(resizeTimer);
    return resizeTimer = setTimeout(sizePosition, 250);
  });
  sizePosition = function() {
    var columnWidth, divH, divW, frame, h, height, marL, marT, numvids, player_o, spaceAvailable, vidH, vidW, visibleFrames, visiblePlayers, w, width, _i, _len, _results;
    visibleFrames = $(".player_d:visible");
    visiblePlayers = $(".player_d:visible object");
    numvids = visibleFrames.length;
    w = $("#players").width();
    h = $("#players").height();
    columnWidth = Math.floor(w / 30);
    if (numvids === 1) {
      width = columnWidth * 30;
      spaceAvailable = 0;
    } else if (numvids <= 4) {
      width = columnWidth * 15;
      spaceAvailable = 4;
    } else if (numvids <= 9) {
      width = columnWidth * 10;
      spaceAvailable = 9;
    } else if (numvids <= 25) {
      width = columnWidth * 6;
      spaceAvailable = 25;
    } else {
      spaceAvailable = 0;
    }
    height = Math.floor(width * ASPECT[1] / ASPECT[0]);
    _results = [];
    for (_i = 0, _len = visibleFrames.length; _i < _len; _i++) {
      frame = visibleFrames[_i];
      divW = width;
      divH = height;
      spaceAvailable -= 1;
      if (_len === 2 && _i === 0) {
        if (Math.random() > .5) {
          divW = width * 2;
        } else {
          divH = height * 2;
        }
      }
      if (_len === 3 && _i === 0) {
        if (Math.random() > .5) {
          divW = width * 2;
        } else {
          divH = height * 2;
        }
      } else if (_len > 4 && spaceAvailable > 1 && Math.random() > .5) {
        if (Math.random() > .5) {
          divW = width * 2;
        } else {
          divH = height * 2;
        }
        spaceAvailable -= 1;
      } else if (_len > 7 && _i < 6 && spaceAvailable > 1 && Math.random() > .5) {
        divW = width * 2;
        divH = height * 2;
        spaceAvailable -= 3;
      }
      $(frame).css("width", divW);
      $(frame).css("height", divH);
      if (divW / divH === ASPECTRATIO) {
        vidW = divW;
        vidH = divH;
        marL = 0;
        marT = 0;
      }
      if (divW / divH > ASPECTRATIO) {
        vidW = divW;
        vidH = Math.floor(vidW * ASPECT[1] / ASPECT[0]);
        marL = 0;
        marT = Math.floor((divH - vidH) / 2);
      } else {
        vidH = divH;
        vidW = Math.floor(vidH * ASPECT[0] / ASPECT[1]);
        marL = Math.floor((divW - vidW) / 2);
        marT = 0;
      }
      player_o = visiblePlayers[_i];
      $(player_o).attr("width", vidW);
      $(player_o).attr("height", vidH);
      $(player_o).css("margin-left", marL);
      _results.push($(player_o).css("margin-top", marT));
    }
    return _results;
  };
}).call(this);
