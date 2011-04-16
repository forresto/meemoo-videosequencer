### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

###

this.Player = Backbone.Model.extend
  # loaded, totalsize, time, totaltime
  initialize: ->
    if this.get("ytid")
      this.Video = this.get("Composition").Videos.getOrAddVideo this.get "ytid"
    if this.get("Composition") is App.Composition
      this.initializeView()
      this.Video.initializeView()
  initializeView: ->
    this.View = new PlayerView {model:this}
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

this.PlayerList = Backbone.Collection.extend
  model: Player

this.PlayerView = Backbone.View.extend
  
  tagName: "div"
  className: "control"
  template: _.template $('#control-template').html()
  
  lastTrigger: 0
  
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
    this.model.Video.View.updateTriggers()
    
  pause: ->
    this.model.set({playing:false})
    window.App.postMessageToViewer("pause", this.model.cid)
    this.model.Video.View.updateTriggers()
    
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
      
  # add 10 triggers
  addtrigger: ->
    if this.model.get('totaltime') > 0
      lastTriggerTime = 0
      for trigger in this.model.Video.Triggers
        if trigger > lastTriggerTime
          lastTriggerTime = Math.ceil trigger
      freeTrigger = this.model.Video.Triggers.length
      for i in [0..8]
        this.model.Video.addTrigger freeTrigger+i, lastTriggerTime + ((i + 1) * 2)
      
  playprogressOver: (e) ->
    $(e.currentTarget).focus()
  
  playprogressClick: (e) ->
    seekpercent = (e.layerX - 5) / $(e.currentTarget).width()
    this.seek seekpercent * this.model.get('totaltime')
    
  seek: (seconds) ->
    # this.$('.playprogress').progressbar "value", seconds/this.model.get('totaltime')*100
    window.App.postMessageToViewer "seek", this.model.cid, seconds
      
  focusPrev: () ->
    this.$('.playprogress').parent().prev().children('.playprogress').focus()
    false
      
  focusNext: () ->
    this.$('.playprogress').parent().next().children('.playprogress').focus()
    false
    
  playprogressKey: (e) ->
    # console.log e.keyCode
    switch e.keyCode
      when 32 then this.playpause() # space
      when 38 then this.focusPrev() # up
      when 40 then this.focusNext() # down
      when 37 then this.triggerArp(true) # left
      when 39 then this.triggerArp(false) # right
      else this.triggerCode e.keyCode # trigger keys
    false
      
  triggerCode: (keyCode) ->
    triggerid = App.keycodes.indexOf(keyCode)
    if (triggerid isnt -1)
      this.triggerOrAdd(triggerid)
    
  triggerOrAdd: (triggerid) ->
    seconds = this.model.Video.Triggers[triggerid]
    if (seconds is undefined or seconds is null)
      # New trigger
      this.model.Video.addTrigger triggerid, this.model.get('time')
    else
      this.lastTrigger = triggerid
      this.seek seconds
  
  trigger: (triggerid) ->
    seconds = this.model.Video.Triggers[triggerid]
    if (seconds is undefined or seconds is null)
      return
    this.lastTrigger = triggerid
    this.seek seconds
        
  triggerArp: (prev) ->
    last = this.lastTrigger
    seconds = null
    if prev
      while last > 0 && (seconds is null or seconds is undefined)
        last--
        seconds = this.model.Video.Triggers[last]
      if last is 0 then seconds = 0
    else #next
      while last < this.model.Video.Triggers.length-1 && (seconds is null or seconds is undefined)
        last++
        seconds = this.model.Video.Triggers[last]
    if seconds isnt undefined and seconds isnt null
      this.lastTrigger = last
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
    this.model.get("Composition").View.$(".players").append($(this.el))
    
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