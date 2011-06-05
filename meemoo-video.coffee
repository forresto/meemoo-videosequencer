### 

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

###

this.Video = Backbone.Model.extend
  # events:
  #   "change:triggers" : "updateTriggers"
    
  defaults:
    "title": ""
    "triggers": []
    
  initialize: ->
    this.Players = new PlayerList()
    
    loadthis = this.get("firstValue")
    if loadthis and loadthis isnt ""
      if (loadthis.indexOf(".webm") isnt -1)
        this.set
          webm: loadthis
          # testFirst: "webm"
      else if (loadthis.indexOf(".mp4") isnt -1 or loadthis.indexOf(".m4v") isnt -1 or loadthis.indexOf(".mov") isnt -1)
        this.set
          mp4: loadthis
          # testFirst: "mp4"
      else if (loadthis.indexOf("youtube.com") isnt -1) # Full yt url
        loadthis = loadthis.split("v=")[1].split("&")[0]
        this.set
          ytid: loadthis
          # testFirst: "ytid"
      else
        this.set
          ytid: loadthis
          # testFirst: "ytid"
    
    if this.get("title") is ""
      this.set
        "title": this.get("ytid")
    
  initializeView: ->
    this.View = new VideoView {model:this}
    for player in this.Players.models
      player.initializeView()
    this.updateTriggers()
    
  addTrigger: (position, time) ->
    if position < App.triggers.length # if there is room for triggers
      time = parseFloat(time)
      if this.get("triggers").indexOf(time) is -1 # if the time isn't a trigger already
        this.get("triggers")[position] = time
        this.updateTriggers()
  updateTriggers: ->
    if this.View
      this.View.updateTriggers()
  toJSON: ->
    jsonobject =
      id       : this.cid
      title    : this.get("title")
      duration : parseFloat this.get("duration")
      webm     : this.get("webm")
      mp4      : this.get("mp4")
      ytid     : this.get("ytid")
      triggers : this.get("triggers")
      players  : this.Players
      
  addPlayer: ->
    #TODO safety for no sources
    this.Players.add new Player
      Composition: this.get("Composition")
      Video: this
      
  remove: ->
    for player in this.Players.models
      if player.View
        player.View.remove()
      else 
        player.remove()
        
    this.get("Composition").Videos.remove(this)
    
this.VideoList = Backbone.Collection.extend
  model: Video
  getOrAddVideo: (composition, ytid) ->
    for thisvideo in this.models
      # if ytid is thisvideo.get("ytid") or webm is thisvideo.get("webm") or mp4 is thisvideo.get("mp4")
      if ytid is thisvideo.get("ytid")
        return thisvideo
    # Else make a new one
    newVideo = new Video({Composition:composition, ytid:ytid})
    this.add(newVideo)
    return newVideo

this.VideoView = Backbone.View.extend
  tagName: "div"
  className: "video"
  template: _.template $('#video-template').html()
  
  events:
    # "focus .video-title" : "editTitle"
    "blur .video-title"          : "saveTitle"
    "click .video-edit-triggers" : "editTriggers"
    "click .video-edit-sources"  : "editSources"
    "click .video-addplayer"     : "addPlayer"
    "click .video-delete"        : "delete"
    
    "blur .video-webm"           : "saveWebm"
    "click .video-webm-test"     : "testWebm"
    "blur .video-mp4"            : "saveMp4"
    "click .video-mp4-test"      : "testMp4"
    "blur .video-ytid"           : "saveYtid"
    "click .video-ytid-test"     : "testYtid"
    "blur .video-duration"       : "saveDuration"
    
    "click .video-triggers-fill-straight"  : "triggersFillStraight"
    "click .video-triggers-fill-staggered" : "triggersFillStaggered"
    "click .video-triggers-sort"           : "triggersSort"
    "click .video-triggers-clear"          : "triggersClear"
    "blur .video-triggers-edit input"      : "triggerEditInput"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    this.render()
    
    this.$(".video-edit-triggers").button
      icons: { primary: "ui-icon-tag" }
    this.$(".video-edit-sources").button
      icons: { primary: "ui-icon-pencil" }
    this.$(".video-addplayer").button
      icons: { primary: "ui-icon-plus" }
    this.$(".video-delete").button
      icons: { primary: "ui-icon-trash" }
      text: false
      
    this.$(".video-triggers").hide()
    this.$(".video-triggers button").button()
    
    this.$(".video-sources").hide()
    this.$(".video-ytid-test").button
      icons: { primary: "ui-icon-video" }
    this.$(".video-webm-test").button
      icons: { primary: "ui-icon-video" }
    this.$(".video-mp4-test").button
      icons: { primary: "ui-icon-video" }
    
    this.model.get("Composition").View.$(".videos").append($(this.el))
    
    
  # editTitle: ->
  #   document.designMode = 'on'
    
  saveTitle: ->
    # document.designMode = 'off'
    this.model.set
      "title" : this.$(".video-title").text().trim()
      
  editTriggers: ->
    this.$(".video-triggers").toggle('fast')
    
  triggersFillStraight: ->
    duration = parseFloat this.model.get("duration")
    if duration is duration # !NaN
      division = duration / App.triggers.length
      triggers = []
      for i in [0..App.triggers.length-1]
        triggers.push i*division
      this.model.set({"triggers":triggers})
      this.updateTriggers()
      
  triggersFillStaggered: ->
    duration = parseFloat this.model.get("duration")
    if duration is duration # !NaN
      division = duration / App.triggers.length
      triggers = []
      for i in [0..App.triggers.length-1]
        row = Math.floor i/4
        col = Math.floor i%4
        triggers[col*10+row] = i*division
      this.model.set({"triggers":triggers})
      this.updateTriggers()
      
  triggersSort: ->
    unsorted = this.model.get("triggers")
    sorted = unsorted.sort((a,b) -> if a is null then 1 else if b is null then -1 else a-b)
    this.model.set({"triggers":sorted})
    this.updateTriggers()
    
  triggersClear: ->
    this.model.set({"triggers":[0]})
    this.updateTriggers()
    
  triggerEditInput: (e) ->
    input = $(e.target)
    idx = input.attr("data-idx")
    time = parseFloat(input.val())
    if time is time
      this.model.addTrigger(idx, time)
    
    
  editSources: ->
    this.$(".video-test").empty()
    this.$(".video-sources").toggle('fast')
    
  saveWebm: ->
    input = this.$(".video-webm").val().trim()
    this.model.set({webm:input})
  saveMp4: ->
    input = this.$(".video-mp4").val().trim()
    this.model.set({mp4:input})
  saveYtid: ->
    input = this.$(".video-ytid").val().trim()
    if (input.indexOf("youtube.com") isnt -1) # Full yt url
      input = input.split("v=")[1].split("&")[0]
      this.$(".video-ytid").val(input)
    this.model.set({ytid:input})
  saveDuration: ->
    duration = parseFloat this.$(".video-duration").val()
    if duration is duration # Not NaN
      this.model.set({"duration":duration})
      
  setDuration: (time) ->
    time = parseFloat time
    if time is time # Not NaN
      this.$(".video-duration").val(time)
      this.saveDuration()
      if this.model.get("triggers").length is 0
        this.triggersFillStaggered()
      
  testFirst: ->
    webm = this.model.get("webm")
    if _.isString(webm) and webm isnt ""
      this.testWebm()
      return
    mp4 = this.model.get("mp4")
    if _.isString(mp4) and mp4 isnt ""
      this.testMp4()
      return
    ytid = this.model.get("ytid")
    if _.isString(ytid) and ytid isnt ""
      this.testYtid()
      return
    
    
  testWebm: ->
    webm = this.model.get("webm")
    if _.isString(webm) and webm isnt ""
      video = this.testHtml5()
      source = $("<source />").attr
        src: webm
        type: "video/webm"
      video.append(source)
      this.$(".video-test").append(video)
  testMp4: ->
    this.testHtml5()
    mp4 = this.model.get("mp4")
    if _.isString(mp4) and mp4 isnt ""
      video = this.testHtml5()
      source = $("<source />").attr
        src: mp4
        type: "video/mp4"
      video.append(source)
      this.$(".video-test").append(video)
  testHtml5: ->
    $(".video-test").empty()
    video = $('<video autobuffer="metadata" controls></video>')
      .data
        video_id : this.model.cid
      .bind "loadedmetadata", ->
        video_id = $(this).data("video_id")
        App.Composition.Videos.getByCid(video_id).View.setDuration this.duration
    return video
    
  testYtid: ->
    $(".video-test").empty()
    ytid = this.model.get("ytid")
    if _.isString(ytid) and ytid isnt ""
      videodiv = $('<div id="yt_test_d"></div>')
        .data
          "ytid" : ytid
          video_id : this.model.cid
      videodiv.append $('<div id="yt_test"></div>')
      
      this.$(".video-test").append(videodiv)
      
      params = { allowScriptAccess: "always", wmode: "opaque" }
      atts = { id: "yt_test" }
      swfobject.embedSWF "http://www.youtube.com/e/#{ytid}?enablejsapi=1&version=3&playerapiid=test", 
        "yt_test", "480", "360", "8", null, null, params, atts
  
  addPlayer: ->
    duration = parseFloat this.model.get("duration")
    if duration isnt duration
      alert "Please [Edit sources] and input the video's duration before adding a player."
      return
      
    this.model.addPlayer()
    
    # Research
    _gaq.push(['_trackEvent', 'Video', 'Add Player '+this.model.get("ytid") , JSON.stringify(this.model)])
    
    
  updateTriggers: ->
    triggershtml = ""
    duration = parseFloat this.model.get("duration");
    if duration is duration and duration > 0
      triggers = this.model.get("triggers")
      for i in [0..App.triggers.length]
        trigger = triggers[i]
        if trigger isnt null and trigger >= 0
          this.$(".video-triggers-edit-#{i} input").val(trigger)
          left = trigger / duration * 100
          if left <= 100
            triggershtml += "<span class='showtrigger v_#{this.model.cid}_t_#{i}' style='left:#{left}%;'>#{App.triggers[i]}</span>"
        else
          this.$(".video-triggers-edit-#{i} input").val("")
      # All players triggger views
      $(".showtriggers_#{this.model.cid}").html(triggershtml)
    
  delete: ->
    if confirm "Are you sure you want to remove this video (#{this.model.cid}) and all players?"
      $(this.el).remove()
      this.model.remove()



window.onYouTubePlayerReady = (id) ->
  player = document.getElementById("yt_test")
  ytid = $("#yt_test_d").data("ytid")

  # Player is ready, load video
  player.loadVideoById(ytid, 0, "medium") # small (240), medium (360), large (480)

  # Status updates
  player.addEventListener("onError", "onPlayerError")
  player.addEventListener("onStateChange", "onPlayerStateChange")

# An error is thrown by the player
window.onPlayerError = (errorCode) ->
  switch errorCode
    when 2 then error = "invalid video id"
    when 100 then error = "video not found"
    when 101, 150 then error = "embedding not allowed"
    else error = "unknown error"
  alert("youtube error #{errorCode}: " + error);

window.onPlayerStateChange = (e) ->
  if e is 1
    player = document.getElementById("yt_test")
    video_id = $(player).parent().data("video_id")
    App.Composition.Videos.getByCid(video_id).View.setDuration player.getDuration()
    