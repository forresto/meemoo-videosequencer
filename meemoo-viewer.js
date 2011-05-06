(function() {
  /*

  HTML Audio Visual Sequencer
  by Forrest Oliphant
  at Sembiki Interactive http://sembiki.com/
  and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with jQuery in CoffeeScript

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

  */  var ASPECT, ASPECTRATIO, appWindow, createH, createM, createW, createY, hide, mute, pause, play, postMessageToApp, recieveMessage, remove, resizeTimer, seek, show, sizePosition, unmute, volume;
  resizeTimer = null;
  appWindow = window.opener ? window.opener : window.parent ? window.parent : void 0;
  postMessageToApp = function(message) {
    return appWindow.postMessage(message, window.location.protocol + "//" + window.location.host);
  };
  recieveMessage = function(e) {
    var action, id, item, message, messages, value, _i, _len;
    if (e.origin !== window.location.protocol + "//" + window.location.host) {
      return;
    }
    messages = e.data.split("|");
    for (_i = 0, _len = messages.length; _i < _len; _i++) {
      item = messages[_i];
      message = item.split("/");
      action = message[1];
      id = message[2];
      value = message[3];
      switch (action) {
        case "createW":
          createW(id, value);
          break;
        case "createM":
          createM(id, value);
          break;
        case "createY":
          createY(id, value);
          break;
        case "remove":
          remove(id);
          break;
        case "seek":
          seek(id, value);
          break;
        case "play":
          play(id);
          break;
        case "pause":
          pause(id);
          break;
        case "hide":
          hide(id);
          break;
        case "show":
          show(id);
          break;
        case "mute":
          mute(id);
          break;
        case "unmute":
          unmute(id);
          break;
        case "volume":
          volume(id, value);
      }
    }
    return updatePlayerInfo();
  };
  window.addEventListener("message", recieveMessage, false);
  createY = function(id, value) {
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
    $('#player_d_' + id).data("ytid", value).data("cid", id).data("type", "youtube");
    return resizeTimer = setTimeout(sizePosition, 250);
  };
  createW = function(id, value) {
    return createH(id, value, "webm");
  };
  createM = function(id, value) {
    return createH(id, value, "mp4");
  };
  createH = function(id, value, type) {
    if ($("#player_d_" + id).length > 0) {
      return;
    }
    if (value.length < 3) {
      return;
    }
    value = decodeURIComponent(value);
    $('#players').append($('<div id="player_d_' + id + '" class="player_d"></div>').data("cid", id).data("type", "htmlvideo").append($("<video id='player_o_" + id + "' src='" + value + "' autobuffer='auto' preload autoplay></video>")));
    return resizeTimer = setTimeout(sizePosition, 250);
  };
  remove = function(id) {
    var cid, player, playerd, _i, _len, _ref;
    if (id === "ALL") {
      _ref = $(".player_d");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        playerd = _ref[_i];
        cid = $(playerd).data('cid');
        player = document.getElementById("player_o_" + cid);
        if (player.tagName === "VIDEO") {
          player.pause();
          player.src = "";
        } else {
          player.stopVideo();
        }
      }
      return $("#players").empty();
    } else {
      player = document.getElementById("player_o_" + id);
      if (player) {
        if (player.tagName === "VIDEO") {
          player.pause();
          player.src = "";
        } else {
          player.stopVideo();
        }
        $(player).parent().remove();
        return sizePosition();
      }
    }
  };
  seek = function(id, value) {
    var loadedPercent, player, seekPercent;
    player = document.getElementById("player_o_" + id);
    if (player) {
      if (player.tagName === "VIDEO") {
        loadedPercent = player.buffered.end() / player.duration;
        seekPercent = (parseFloat(value) + 20) / player.duration;
        if (loadedPercent === 1 || seekPercent < loadedPercent) {
          return player.currentTime = value;
        }
      } else {
        loadedPercent = player.getVideoBytesLoaded() / player.getVideoBytesTotal();
        seekPercent = (parseFloat(value) + 20) / player.getDuration();
        if (loadedPercent === 1 || seekPercent < loadedPercent) {
          return player.seekTo(value, false);
        }
      }
    }
  };
  play = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      if (player.tagName === "VIDEO") {
        return player.play();
      } else {
        return player.playVideo();
      }
    }
  };
  pause = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      if (player.tagName === "VIDEO") {
        return player.pause();
      } else {
        return player.pauseVideo();
      }
    }
  };
  hide = function(id) {
    return $("player_d_" + id).hide();
  };
  show = function(id) {
    return $("player_d_" + id).show();
  };
  mute = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      if (player.tagName === "VIDEO") {
        return player.muted = true;
      } else {
        return player.mute();
      }
    }
  };
  unmute = function(id) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      if (player.tagName === "VIDEO") {
        return player.muted = false;
      } else {
        return player.unMute();
      }
    }
  };
  volume = function(id, value) {
    var player;
    player = document.getElementById("player_o_" + id);
    if (player) {
      if (player.tagName === "VIDEO") {
        return player.volume = value / 100;
      } else {
        return player.setVolume(value);
      }
    }
  };
  window.onYouTubePlayerReady = function(id) {
    var player, ytid;
    player = document.getElementById("player_o_" + id);
    ytid = $("#player_d_" + id).data("ytid");
    player.loadVideoById(ytid, 0, "medium");
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
    _ref = $(".player_d");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      player = _ref[_i];
      cid = $(player).data('cid');
      message += cid + ":";
      playero = document.getElementById("player_o_" + cid);
      if (playero) {
        if (playero.duration) {
          message += Math.round(playero.buffered.end() * 1000) / 1000 + ":" + Math.round(playero.duration * 1000) / 1000 + ":" + Math.round(playero.currentTime * 1000) / 1000 + ":" + Math.round(playero.duration * 1000) / 1000;
        } else if (playero.getDuration) {
          message += playero.getVideoBytesLoaded() + ":" + playero.getVideoBytesTotal() + ":" + playero.getCurrentTime() + ":" + playero.getDuration();
        }
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
    visiblePlayers = visibleFrames.children("object, video");
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
