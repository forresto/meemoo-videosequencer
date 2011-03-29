### 

Meemoo HTML Audio Visual Sequencer 
by Forrest Oliphant 
at Sembiki Interactive http://sembiki.com/ 
and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

Composition = Backbone.Model.extend
  defaults:
    "title": "untitled composition"
    "description": "mixed with sembiki meemoo audio visual sequencer"
    "mixer": "me!"
    
  initialize: ->
    if this.get("loadJSON") isnt undefined
      pastedJSON = this.get("loadJSON")
      if pastedJSON isnt ""
        loadComp = JSON.parse(pastedJSON);
        console.log loadComp
    this.Videos = new VideoList()
    this.Players = new PlayerList()
    this.View = new CompositionView {model:this}
  toJSON: ->
    jsonobject =
      info: 
        title: this.get("title")
        description: this.get("description")
        mixer: this.get("mixer")
      videos: this.Videos
      players: this.Players
    
CompositionList = Backbone.Collection.extend
  model: Composition
  
  
CompositionView = Backbone.View.extend
  tagName: "div"
  className: "composition"
  template: _.template $('#composition-template').html()
  
  events:
    "click .comp_load_button" : "load"
    "click .comp_save_button" : "save"
    "click .comp_delete_button" : "delete"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    this.render()
    $("#comp_dialog").append($(this.el))
    
    this.$('.comp_load_button')
      .button
        icons: { primary: "ui-icon-folder-open" }
    this.$('.comp_save_button')
      .button
        icons: { primary: "ui-icon-disk" }
    this.$('.comp_delete_button')
      .button
        icons: { primary: "ui-icon-trash" }
    
  load: ->
    $("#comp_dialog").dialog()
    
  save: ->
    $("#comp_export_dialog textarea").text(JSON.stringify this.model)
    $("#comp_export_dialog").dialog
      modal: true
      width: 400
      height: 300
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      false 
  
  
Video = Backbone.Model.extend
  initialize: ->
    this.Triggers = []
    this.View = new VideoView {model:this}
    this.addTrigger 0, 0
  addTrigger: (position, time) ->
    if position < App.triggers.length
      time = parseFloat(time)
      if _.indexOf(this.Triggers, time, true) is -1
        this.Triggers[position] = time
        this.Triggers.sort((a,b) -> a-b)
        this.View.updateTriggers()
  toJSON: ->
    jsonobject =
      id: this.cid
      ytid: this.get("ytid")
      triggers: this.Triggers
      
      
VideoList = Backbone.Collection.extend
  model: Video
  getOrAddVideo: (ytid) ->
    for thisvideo in this.models
      if ytid is thisvideo.get("ytid")
        return thisvideo
    # Else make a new one
    newVideo = new Video({ytid:ytid})
    this.add(newVideo)
    return newVideo

VideoView = Backbone.View.extend
  tagName: "div"
  className: "video"
  # template: _.template $('#video-template').html()
  
  render: ->
    # $(this.el).html this.template this.model.toJSON()
    # this.updateTriggers()
    return this
    
  initialize: ->
    # this.render()
    # $("#videos").append($(this.el))
    
  updateTriggers: ->
    triggershtml = ""
    for trigger in this.model.Triggers
      left = trigger / this.model.get("totaltime") * 100
      triggershtml += "<span class='showtrigger v_#{this.model.cid}_t_#{_i}' style='left:#{left}%;'>#{App.triggers[_i]}</span>"
    $(".showtriggers_#{this.model.cid}").html(triggershtml)
    


Player = Backbone.Model.extend
  # loaded, totalsize, time, totaltime
  initialize: ->
    if this.get("ytid")
      this.Video = App.Composition.Videos.getOrAddVideo this.get "ytid"
      this.View = new PlayerView {model:this}
      this.Video.View.updateTriggers()
      this.set({playing:true})
  remove: ->
    App.Composition.Players.remove(this)
    # this.destroy()
  change: ->
    this.View.updateinfo()
  toJSON: ->
    jsonobject =
      id: this.cid
      video_id: this.Video.cid


PlayerList = Backbone.Collection.extend
  model: Player


PlayerView = Backbone.View.extend
  
  tagName: "div"
  className: "control"
  template: _.template $('#control-template').html()
  
  events:
    "click .playbutton" : "play"
    "click .pausebutton" : "pause"
    "click .mutebutton" : "mute"
    "click .unmutebutton" : "unmute"
    "slide .volumeslider" : "volume"
    "click .addtriggerbutton" : "addtrigger"
    "click .removebutton" : "remove"
    "mouseover .playprogress" : "playprogressOver"
    "click .playprogress" : "playprogressClick"
    "keydown .playprogress" : "playprogressKey"
    
  playpause: ->
    if this.model.get("playing") then this.pause() else this.play()
    
  play: ->
    this.model.set({playing:true})
    window.App.postMessageToViewer("play", this.model.cid)
    
  pause: ->
    this.model.set({playing:false})
    window.App.postMessageToViewer("pause", this.model.cid)
    
  mute: ->
    window.App.postMessageToViewer("mute", this.model.cid)
    
  unmute: ->
    window.App.postMessageToViewer("unmute", this.model.cid)
    
  volume: (e, ui) ->
    window.App.postMessageToViewer("volume", this.model.cid, ui.value)
    
  remove: ->
    if confirm "Are you sure you want to remove this player (#{this.model.cid})?"
      window.App.postMessageToViewer("remove", this.model.cid)
      $(this.el).remove()
      this.model.remove()
      
  addtrigger: ->
    if this.model.get('totaltime') > 0
      this.model.Video.addTrigger this.model.Video.Triggers.length, this.model.get('time')
      
  playprogressOver: (e) ->
    e.currentTarget.focus()
  
  playprogressClick: (e) ->
    seekpercent = (e.offsetX - 5) / $(e.currentTarget).width()
    if this.model.get('loaded') is this.model.get('totalsize') or seekpercent < (this.model.get('loaded') - 250000) / this.model.get('totalsize')
      this.seek seekpercent * this.model.get('totaltime')

  seek: (seconds) ->
    window.App.postMessageToViewer("seek", this.model.cid, seconds)

  focusPrev: () ->
    this.$('.playprogress').parent().prev().children('.playprogress').focus()
    
  focusNext: () ->
    this.$('.playprogress').parent().next().children('.playprogress').focus()
      
  playprogressKey: (e) ->
    # console.log e.keyCode
    switch e.keyCode
      when 32 then this.playpause() # space: pause/play
      when 38 then this.focusPrev() # up: pause/play
      when 40 then this.focusNext() # down: pause/play
      else this.trigger e.keyCode # trigger keys
      
  trigger: (keyCode) ->
    triggerid = App.keycodes.indexOf(keyCode)
    if (triggerid isnt -1)
      seconds = this.model.Video.Triggers[triggerid]
      if (seconds isnt undefined)
        this.seek seconds
    
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  updateinfo: ->
    if this.model.get('totalsize') > 0
      this.$('.statusmessage').html "#{this.model.get('time')} / #{this.model.get('totaltime')} <br /> #{this.model.get('loaded')} / #{this.model.get('totalsize')}"
      this.$('.playprogress').progressbar "value", this.model.get('time')/this.model.get('totaltime')*100
      this.$('.loadprogress').progressbar "value", this.model.get('loaded')/this.model.get('totalsize')*100
    
  initialize: ->
    window.App.postMessageToViewer "create", this.model.cid, this.model.get("ytid")
    
    this.render()
    $("#players").append($(this.el))
    
    # jQuery UI elements
    this.$('.playbutton')
      .button
        icons: { primary: "ui-icon-play" }
        text: false
    this.$('.pausebutton')
      .button
        icons: { primary: "ui-icon-pause" }
        text: false
    this.$('.mutebutton')
      .button
        icons: { primary: "ui-icon-volume-off" }
        text: false
    this.$('.unmutebutton')
      .button
        icons: { primary: "ui-icon-volume-on" }
        text: false
    this.$('.volumeslider')
      .slider
        value: 100,
        min: 0,
        max: 100
    this.$('.addtriggerbutton')
      .button
        icons: { primary: "ui-icon-plus" }
        text: false
    # this.$('.statusmessage')
    this.$('.removebutton')
      .button
        icons: { primary: "ui-icon-trash" }
        text: false
    this.$('.playprogress')
      .progressbar {value: 0}
    this.$('.loadprogress')
      .progressbar {value: 0}
      
      
    return this
    



AppView = Backbone.View.extend

  template: _.template $('#application-template').html()
  
  triggers_us: ["1","2","3","4","5","6","7","8","9","0",
    "q","w","e","r","t","y","u","i","o","p",
    "a","s","d","f","g","h","j","k","l",";",
    "z","x","c","v","b","n","m",",",".","/"]
  keycodes_us: [49,50,51,52,53,54,55,56,57,48,
    81,87,69,82,84,89,85,73,79,80,
    65,83,68,70,71,72,74,75,76,186,
    90,88,67,86,66,78,77,188,190,191]
  
  # events:
  #   "click #addplayer" : "addPlayer"
  #   "click #popoutbutton" : "popoutViewer"
    
  initialize: ->
    # Load application framework
    #TODO add browser tests
    $('#intro').hide()
    $('#application').html this.template
    
    #TODO multiple/custom keyboard layouts?
    this.triggers = this.triggers_us 
    this.keycodes = this.keycodes_us
    
    # Add UI elements
    
    this.viewer = document.getElementById("viewer").contentWindow
    
    $('#popoutbutton')
      .button
        icons: { primary: "ui-icon-newwin" }
      .click ->
        window.App.popoutViewer()
        
    $('#loadcomposition')
      .button
        icons: { primary: "ui-icon-folder-open" }
      .click ->
        $("#comp_dialog").dialog
          modal: true
          width: 400
        # pastedJSON = prompt("Paste the saved block of text here, or just press OK for a new empty composition:")
        # newComp = new Composition({loadJSON:pastedJSON})
        # App.Compositions.add(newComp)
        # App.Composition = newComp
    
    $('#addplayer')
      .button
        icons: { primary: "ui-icon-plus" }
      .click ->
        newId = $('#addplayerid').val()
        App.Composition.Players.add(new Player({ytid:newId}));
        return false
        
    this.Compositions = new CompositionList()
    this.Composition = new Composition()
    this.Compositions.add(this.Composition)
    
  popoutViewer: ->
    this.viewer = window.open("viewer.html", "popoutviewer")
    if this.viewer.name is "popoutviewer"
      $('#container').hide()
      $('#viewer').remove()
      $('#setup').addClass("floatingsetup")
      # Reload videos in popout
      setTimeout "App.reloadVideos()", 2500
    
  popinViewer: ->
    if this.viewer.name is "popoutviewer"
      $('#container').prepend('<iframe src="viewer.html" id="viewer" name="inviewer"></iframe>')
      this.viewer = document.getElementById("viewer").contentWindow
      $('#container').show()
      $('#setup').removeClass("floatingsetup")
      setTimeout "App.reloadVideos()", 2500
    
  reloadVideos: ->
    for player in App.Composition.Players.models
      App.postMessageToViewer "create", player.cid, player.Video.get("ytid")
      
  postMessageToViewer: (action, id, value) ->
    this.viewer.postMessage "#{action}:#{id}:#{value}", window.location.protocol + "//" + window.location.host
    
  recieveMessage: (e) ->
    if e.data is "POPOUTCLOSED"
      App.popinViewer()
    else
      playerinfos = e.data.split("|")
      for playerinfo in playerinfos
        info = playerinfo.split(":")
        id = info[0]
        loaded = info[1]
        totalsize = info[2]
        time = info[3]
        totaltime = info[4]
        if id isnt ""
          player = this.Composition.Players.getByCid(id)
          if player
            player.set({loaded:loaded,totalsize:totalsize,time:time,totaltime:totaltime})
            player.Video.set({totaltime:totaltime})
    

# Initialize app
$ ->
  window.App = new AppView()
  
  
# Util


recieveMessage = (e) ->
  if e.origin isnt window.location.origin
    return
  window.App.recieveMessage e

window.addEventListener "message", recieveMessage, false
