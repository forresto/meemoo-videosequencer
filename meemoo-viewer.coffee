###

HTML Audio Visual Sequencer
by Forrest Oliphant 
at Sembiki Interactive http://sembiki.com/
and Media Lab Helsinki http://mlab.taik.fi/
(copyleft) 2011 

Built with jQuery in CoffeeScript

###


resizeTimer = null
playerinfointerval = null

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
    message = item.split(":")
    action = message[0] # create, destroy, seek, play, pause, mute
    id = message[1]
    value = message[2]
    switch action
      when "create"  then create  id,value
      when "remove"  then remove  id
      when "seek"    then seek    id,value
      when "play"    then play    id
      when "pause"   then pause   id
      when "hide"    then hide    id
      when "show"    then show    id
      when "mute"    then mute    id
      when "unmute"  then unmute  id
      when "volume"  then volume  id,value
  

window.addEventListener("message", recieveMessage, false)


create = (id,value) ->
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
    
  resizeTimer = setTimeout(sizePosition, 250)
  
  
remove = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    player.stopVideo()
    $(player).parent().remove()
    sizePosition()


seek = (id,value) ->
  player = document.getElementById "player_o_#{id}"
  if player
    # don't seek over the buffer, safety of 20 seconds
    loadedPercent = player.getVideoBytesLoaded() / player.getVideoBytesTotal()
    seekPercent = (parseFloat(value) + 20) / player.getDuration()
    if loadedPercent is 1 or seekPercent < loadedPercent
      player.seekTo(value, false)


play = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    player.playVideo()


pause = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    player.pauseVideo()


hide = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    $(player).parent().hide()


show = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    $(player).parent().show()


mute = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    player.mute()


unmute = (id) ->
  player = document.getElementById "player_o_#{id}"
  if player
    player.unMute()


volume = (id,value) ->
  player = document.getElementById "player_o_#{id}"
  if player
    player.setVolume(value)



window.onYouTubePlayerReady = (id) ->
  player = document.getElementById("player_o_#{id}")
  ytid = $("#player_d_#{id}").data("ytid")

  # Player is ready, load video
  player.loadVideoById(ytid, 0, "medium") # small (240), medium (360), large (480)

  # Status updates
  if playerinfointerval is null
    playerinfointerval = setInterval(updatePlayerInfo, 500)
  updatePlayerInfo()
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
  for player in $(".player_d:visible")
    cid = $(player).data('cid')
    message += cid + ":" 
    playero = document.getElementById "player_o_#{cid}"
    if playero and playero.getDuration
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
  visiblePlayers = $(".player_d:visible object")
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
    