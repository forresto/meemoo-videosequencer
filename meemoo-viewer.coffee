###

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

###


resizeTimer = null
# playerinfointerval = null

# visibleFrames

appWindow = 
  if window.opener then window.opener 
  else if window.parent then window.parent
  
  
postMessageToApp = (message) ->
  appWindow.postMessage message, window.location.protocol + "//" + window.location.host
  
  
recieveMessage = (e) ->
  if e.origin isnt window.location.protocol + "//" + window.location.host
    return
    
  messages = e.data.split("|")
  for item in messages
    message = item.split("/")
    action = message[1] # create, destroy, seek, play, pause, mute
    id = message[2]
    value = message[3]
    switch action
      when "createW" then createW id, value
      when "createM" then createM id, value
      when "createY" then createY id, value
      when "remove"  then remove  id
      when "seek"    then seek    id, value
      when "play"    then play    id
      when "pause"   then pause   id
      when "hide"    then hide    id
      when "show"    then show    id
      when "mute"    then mute    id
      when "unmute"  then unmute  id
      when "volume"  then volume  id, value
      
  # Update with beat
  updatePlayerInfo()
  

window.addEventListener("message", recieveMessage, false)


createY = (id,value) ->
  if $("#player_d_"+id).length > 0 # that id player already exists
    return
  
  if value.length < 3 # no ytid
    return
    
  $('#players').append '<div id="player_d_'+id+'" class="player_d"><div id="player_r_'+id+'"></div></div>'
  
  params = { allowScriptAccess: "always", wmode: "opaque" }
  atts = { id: "player_o_"+id }
  swfobject.embedSWF "http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=#{id}", 
    "player_r_#{id}", "320", "240", "8", null, null, params, atts
    
  $('#player_d_'+id)
    .data("ytid", value)
    .data("cid", id)
    .data("type", "youtube")
    
  resizeTimer = setTimeout(sizePosition, 250)

createW = (id, value) ->
  createH id, value, "webm"

createM = (id, value) ->
  createH id, value, "mp4"

createH = (id, value, type) ->
  if $("#player_d_"+id).length > 0 # that id player already exists
    return
    
  if value.length < 3 # no url
    return
    
  # full urls
  value = decodeURIComponent(value)
  
  $('#players')
    .append $('<div id="player_d_'+id+'" class="player_d"></div>')
      .data("cid", id)
      .data("type", "htmlvideo")
      .append $("<video id='player_o_#{id}' src='#{value}' autobuffer='auto' preload autoplay></video>")
  
  resizeTimer = setTimeout(sizePosition, 250)
  
remove = (id) ->
  if id is "ALL"
    for playerd in $(".player_d")
      cid = $(playerd).data('cid')
      player = document.getElementById "player_o_#{cid}"
      if player.tagName is "VIDEO"
        player.pause()
        player.src = ""
      else
        try player.stopVideo()
    $("#players").empty()
  else
    player = document.getElementById "player_o_#{id}"
    if player
      if player.tagName is "VIDEO"
        player.pause()
        player.src = ""
      else
        try player.stopVideo()
      $(player).parent().remove()
      sizePosition()

seek = (id,value) ->
  player = document.getElementById "player_o_#{id}"
  if player
    if player.tagName is "VIDEO"
      loadedPercent = player.buffered.end() / player.duration
      seekPercent = (parseFloat(value) + 3) / player.duration
      # don't seek over the buffer, safety of 3 seconds
      if loadedPercent is 1 or seekPercent < loadedPercent
        player.currentTime = value
    else
      loadedPercent = player.getVideoBytesLoaded() / player.getVideoBytesTotal()
      seekPercent = (parseFloat(value) + 20) / player.getDuration()
      # don't seek over the buffer, safety of 20 seconds
      if loadedPercent is 1 or seekPercent < loadedPercent
        try player.seekTo(value, false)

play = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    if player.tagName is "VIDEO"
      player.play()
    else
      try player.playVideo()

pause = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    if player.tagName is "VIDEO"
      player.pause()
    else
      try player.pauseVideo()

hide = (id) ->
  $("player_d_#{id}").hide()

show = (id) ->
  $("player_d_#{id}").show()

mute = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    if player.tagName is "VIDEO"
      player.muted = true
    else
      try player.mute()

unmute = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    if player.tagName is "VIDEO"
      player.muted = false
    else
      try player.unMute()

volume = (id,value) ->
  player = document.getElementById "player_o_#{id}"
  if player
    if player.tagName is "VIDEO"
      player.volume = value/100
    else
      try player.setVolume(value)


window.onYouTubePlayerReady = (id) ->
  player = document.getElementById("player_o_#{id}")
  ytid = $("#player_d_#{id}").data("ytid")

  # Player is ready, load video
  player.loadVideoById(ytid, 0, "medium") # small (240), medium (360), large (480)

  # Status updates
  # if playerinfointerval is null
  #   playerinfointerval = setInterval(updatePlayerInfo, 500)
  # updatePlayerInfo()
  player.addEventListener("onError", "onPlayerError")
  # player.addEventListener("onStateChange", "onPlayerStateChange")

# An error is thrown by the player
window.onPlayerError = (errorCode) ->
  switch errorCode
    when 2 then error = "invalid video id"
    when 100 then error = "video not found"
    when 101, 150 then error = "embedding not allowed"
    else error = "unknown error"
  alert("youtube error #{errorCode}: " + error);


window.updatePlayerInfo = ->
  message = ""
  for player in $(".player_d")
    cid = $(player).data('cid')
    message += cid + ":" 
    playero = document.getElementById "player_o_#{cid}"
    if playero
      if playero.duration #HTML video ready
        message += Math.round(playero.buffered.end()*1000)/1000 + ":" + Math.round(playero.duration*1000)/1000 + ":" + Math.round(playero.currentTime*1000)/1000 + ":" + Math.round(playero.duration*1000)/1000
      else if playero.getDuration #YouTube video ready
        message += playero.getVideoBytesLoaded() + ":" + playero.getVideoBytesTotal() + ":" + playero.getCurrentTime() + ":" + playero.getDuration()
    message += "|"
  postMessageToApp message
  
$(window).unload ->
  if window.name is "popoutviewer"
    postMessageToApp "-=POPOUTCLOSED=-" #FIXME: doesn't fire in Safari, only getting refresh
  postMessageToApp "-=REFRESH=-"


# 
# Sizing
# 

ASPECT = [4,3]
ASPECTRATIO = ASPECT[0]/ASPECT[1]

# Bind to window resize
$(window).resize ->
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(sizePosition, 250);

sizePosition = ->
  visibleFrames = $(".player_d:visible")
  visiblePlayers = visibleFrames.children("object, video")
  numvids = visibleFrames.length
  w = $("#players").width()
  h = $("#players").height()
  
  columnWidth = Math.floor w/30
  
  if numvids is 1
    width = columnWidth * 30
    spaceAvailable = 0
  else if numvids <= 4
    width = columnWidth * 15
    spaceAvailable = 4
  else if numvids <= 9
    width = columnWidth * 10
    spaceAvailable = 9
  else if numvids <= 25
    width = columnWidth * 6
    spaceAvailable = 25
  else
    spaceAvailable = 0
  
  height = Math.floor width*ASPECT[1]/ASPECT[0]

  for frame in visibleFrames
    divW = width
    divH = height
    
    # TODO clean this up
    spaceAvailable -= 1
    if _len is 2 and _i is 0
      if Math.random() > .5
        divW = width*2
      else 
        divH = height*2
    if _len is 3 and _i is 0
      if Math.random() > .5
        divW = width*2
      else 
        divH = height*2
    else if _len > 4 and spaceAvailable > 1 and Math.random() > .5
      if Math.random() > .5
        divW = width*2
      else 
        divH = height*2
      spaceAvailable -= 1
    else if _len > 7 and _i < 6 and spaceAvailable > 1 and Math.random() > .5
      divW = width*2
      divH = height*2
      spaceAvailable -= 3
    
    $(frame).css "width", divW
    $(frame).css "height", divH
    
    if divW/divH is ASPECTRATIO
      vidW = divW
      vidH = divH
      marL = 0
      marT = 0
    if divW/divH > ASPECTRATIO
      vidW = divW
      vidH = Math.floor(vidW*ASPECT[1]/ASPECT[0])
      marL = 0
      marT = Math.floor((divH-vidH)/2)
    else
      vidH = divH
      vidW = Math.floor(vidH*ASPECT[0]/ASPECT[1])
      marL = Math.floor((divW-vidW)/2)
      marT = 0
    
    player_o = visiblePlayers[_i]
    $(player_o).attr "width", vidW
    $(player_o).attr "height", vidH
    $(player_o).css "margin-left", marL
    $(player_o).css "margin-top", marT
    