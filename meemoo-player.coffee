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

this.Player = Backbone.Model.extend
  defaults:
    "volume": 100

  # loaded, totalsize, time, totaltime
  initialize: ->
    if this.get("Composition") is App.Composition
      this.initializeView()
  initializeView: ->
    this.View = new PlayerView {model:this}
    this.set({playing:true})
  remove: ->
    this.get("Video").Players.remove(this)
  change: ->
    this.View.updateinfo()
  toJSON: ->
    jsonobject =
      id: this.cid
      # video_id: this.Video.cid
      volume: parseInt this.get("volume")
      
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
    "click .removebutton" : "removeConfirm"
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
    this.model.set({volume:ui.value})
    window.App.postMessageToViewer("volume", this.model.cid, ui.value)
    
  removeConfirm: ->
    if confirm "Are you sure you want to remove this player (#{this.model.cid})?"
      this.remove()
      
  remove: ->
    window.App.postMessageToViewer("remove", this.model.cid)
    $(this.el).remove()
    this.model.remove()
      
  # add 10 triggers
  addtrigger: ->
    if this.model.get('totaltime') > 0
      lastTriggerTime = 0
      for trigger in this.model.get("Video").get("triggers")
        if trigger > lastTriggerTime
          lastTriggerTime = Math.ceil trigger
      freeTrigger = this.model.get("Video").get("triggers").length
      for i in [0..8]
        this.model.get("Video").addTrigger freeTrigger+i, lastTriggerTime + ((i + 1) * 2)
      
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
    seconds = parseFloat this.model.get("Video").get("triggers")[triggerid]
    if seconds isnt seconds # Is NaN
      # New trigger
      this.model.get("Video").addTrigger triggerid, this.model.get('time')
    else
      this.lastTrigger = triggerid
      this.seek seconds
  
  trigger: (triggerid) ->
    seconds = this.model.get("Video").get("triggers")[triggerid]
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
        seconds = this.model.get("Video").get("triggers")[last]
      if last is 0 then seconds = 0
    else #next
      while last < this.model.get("Video").get("triggers").length-1 && (seconds is null or seconds is undefined)
        last++
        seconds = this.model.get("Video").get("triggers")[last]
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
    
  create: ->
    video = this.model.get("Video")
    webm = video.get("webm")
    mp4 = video.get("mp4")
    ytid = video.get("ytid")
    
    if webm and webm isnt "" and Modernizr.video and Modernizr.video.webm isnt "no"
      App.postMessageToViewer "createW", this.model.cid, encodeURIComponent(webm)
    else if mp4 and mp4 isnt "" and Modernizr.video and Modernizr.video.mp4 isnt "no"
      App.postMessageToViewer "createM", this.model.cid, encodeURIComponent(mp4)
    else if ytid and ytid isnt ""
      App.postMessageToViewer "createY", this.model.cid, ytid
    else 
      alert "You can't play this video in this browser (;_;)"
    
  initialize: ->
    this.create()
    this.render()
    
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
      
    this.model.get("Composition").View.$(".players").append($(this.el))
    this.model.get("Video").View.updateTriggers()
    
      
    return this