### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

###

this.Video = Backbone.Model.extend
  defaults:
    "title": ""
  
  initialize: ->
    this.Players = new PlayerList()
    this.Triggers = []
    this.addTrigger 0, 0
    if this.get("title") is ""
      this.set
        "title": this.get("ytid")
    # if this.get("Composition") is App.Composition
    #   this.initializeView()
  initializeView: ->
    this.View = new VideoView {model:this}
    for player in this.Players.models
      player.initializeView()
    this.View.updateTriggers()
    
  addTrigger: (position, time) ->
    if position < App.triggers.length # if there is room for triggers
      time = parseFloat(time)
      if this.Triggers.indexOf(time) is -1 # if the time isn't a trigger already
        this.Triggers[position] = time
    if this.View
      this.View.updateTriggers()
  change: ->
    # this.Triggers.sort((a,b) -> a-b)
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
      triggers : this.Triggers
      players  : this.Players
      
  addPlayer: ->
    if this.get("ytid") isnt ""
      this.Players.add new Player
        Composition: this.get("Composition")
        Video: this
      
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
      
  testWebm: ->
    this.testHtml5()
  testMp4: ->
    this.testHtml5()
  testHtml5: ->
    $(".video-test").empty()
    video = $('<video autobuffer="metadata" controls></video>')
      .data
        video_id : this.model.cid
      .bind "loadedmetadata", ->
        video_id = $(this).data("video_id")
        App.Composition.Videos.getByCid(video_id).View.setDuration this.duration
    webm = this.model.get("webm")
    if _.isString(webm) and webm isnt ""
      source = $("<source />").attr
        src: webm
        type: "video/webm"
      video.append(source)
    mp4 = this.model.get("mp4")
    if _.isString(mp4) and mp4 isnt ""
      source = $("<source />").attr
        src: mp4
        type: "video/mp4"
      video.append(source)
    this.$(".video-test").append(video)
    
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
    this.model.addPlayer()
  
  updateTriggers: ->
    triggershtml = ""
    triggersformhtml = ""
    for trigger in this.model.Triggers
      if trigger isnt null and trigger >= 0 and this.model.get("duration") > 0
        left = trigger / this.model.get("duration") * 100
        if left <= 100
          triggershtml += "<span class='showtrigger v_#{this.model.cid}_t_#{_i}' style='left:#{left}%;'>#{App.triggers[_i]}</span>"
    $(".showtriggers_#{this.model.cid}").html(triggershtml)



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
    