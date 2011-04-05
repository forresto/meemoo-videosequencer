### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

### 
# Patterns
### 

this.Pattern = Backbone.Model.extend
  initialize: ->
    this.beat = 0
    this.beats = if this.get("beats") <= 0 then 16 else this.get("beats")
    this.Tracks = new TrackList()
    
  initializeView: ->
    this.View = new PatternView {model:this, id:"pattern_#{this.cid}"}
    for track in this.Tracks.models
      track.initializeView()
      
  # addTracks: ->
  #   for player in this.get("Composition").Players.models
  #     this.addTrack player
  
  setBeats: (beats) ->
    this.beats = beats
    
  addTrack: (player) ->
    newTrack = new Track({Pattern:this, Player:player})
    this.Tracks.add newTrack
    newTrack
    
  toJSON: ->
    jsonobject =
      id: this.cid
      beats: parseInt(this.beats)
      tracks: this.Tracks

  play: ->
    this.get("Composition").cuePattern(this)
    
  stop: ->
    this.get("Composition").stop()
    this.beat = 0
      
  step: ->
    triggers = []
    
    for track in this.Tracks.models
      trigger = track.Line[this.beat]
      if trigger isnt null and trigger isnt undefined
        thistrigger = {}
        thistrigger.player = track.get("Player")
        thistrigger.trigger = trigger
        triggers.push thistrigger
        
    this.get("Composition").multitrigger triggers
      
    # highlight
    this.View.step()
    
    this.beat++
    if this.beat >= this.beats
      this.beat = 0
      this.get("Composition").loop()
      
  delete: ->
    this.destroy()
    this.View.remove()
    

this.PatternList = Backbone.Collection.extend
  model: Pattern
  
  
this.PatternView = Backbone.View.extend
  tagName: "div"
  className: "pattern"
  template: _.template $('#pattern-template').html()
  
  events:
    "click .pattern_addtrack_button" : "chooseTrack"
    "mouseover .navigable" : "mouseoverNavigable"
    "change .pattern_beats" : "setBeats"
    "blur .pattern_beats" : "setBeats"
    "click .pattern_play_button" : "play"
    "click .pattern_stop_button" : "stop"
    
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  initialize: ->
    this.render()
    this.model.get("Composition").View.$(".patterns-tabs").append $(this.el)
    this.model.get("Composition").View.$(".patterns-tabs").tabs()
    
    this.$('.pattern_play_button')
      .button
        icons: { primary: "ui-icon-play" }
        text: false
    this.$('.pattern_stop_button')
      .button
        icons: { primary: "ui-icon-stop" }
        text: false
    this.$('.pattern_addtrack_button')
      .button
        icons: { primary: "ui-icon-plus" }
        
    # for track in this.model.Tracks.models
    #   track.initializeView()
    
  delete: ->
    if confirm "Are you sure you want to remove this pattern (#{this.model.get('title')})?"
      this.model.delete()
      
  play: ->
    this.model.play()
    
  stop: ->
    this.model.stop()
    this.$(".beat").removeClass("active")
    
  chooseTrack: ->
    dialog = $("<div></div>")
    $(this.el).append dialog
    for player in App.Composition.Players.models
      disabled = false
      # disable button if used already
      for track in this.model.Tracks.models
        if track.get("Player").cid is player.cid
          disabled = true 
      playerel = $("<div>#{player.cid}</div>")
      playerel
        .data
          pattern_id : this.model.cid
          player_id : player.cid
        .button
          disabled : disabled
        .click ->
          pattern_id = $(this).data "pattern_id"
          player_id = $(this).data "player_id"
          App.Composition.Patterns.getByCid(pattern_id).View.addTrack player_id
          $(dialog).dialog("close")
      dialog.append(playerel);
      
    dialog.dialog();
      
  addTrack: (player_id) ->
    newTrack = this.model.addTrack App.Composition.Players.getByCid(player_id)
    newTrack.initializeView()
    
  setBeats: ->
    beats = this.$(".pattern_beats").val()
    this.model.setBeats beats
    for track in this.model.Tracks.models
      track.View.initialize()
      
  step: ->
    this.$(".beat").removeClass("active")
    this.$(".beat_#{this.model.beat}").addClass("active")
    
  remove: ->
    $(this.el).remove()


### 
# Pattern tracks
### 


this.Track = Backbone.Model.extend
  
  initialize: ->
    this.Line = []
    this.pattern_id = this.get("Pattern").cid
    this.beats = this.get("Pattern").beats
    
  initializeView: ->
    this.View = new TrackView {model:this, Pattern:this.get("Pattern")}
    
  setLine: (line) ->
    this.Line = line
    
  addTrigger: (position, trigger) ->
    this.Line[position] = trigger
    
  setBeat: (beat, triggerid) ->
    this.Line[beat] = triggerid
    if this.View
      this.View.setBeat(beat, triggerid)
  
  toJSON: ->
    jsonobject =
      player_id: this.get("Player").cid
      line: this.Line
      
  delete: ->
    this.destroy()
    this.View.remove()
    
    
this.TrackList = Backbone.Collection.extend
  model: Track

this.TrackView = Backbone.View.extend
  tagName: "div"
  className: "track"
  template: _.template $('#track-template').html()
  
  events:
    "mouseover .beat" : "beatOver"
    "keydown .beat"   : "beatKeydown"
    
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    $(this.el).empty()
    this.Beats = []
    this.render()
    beats = this.model.get("Pattern").beats
    for i in [0..beats-1]
      html = App.triggers[this.model.Line[i]]
      if html is null or html is undefined
        html = "&nbsp;"
      beat = $("<span class='beat beat_#{i} navigable' id='pattern_#{this.model.pattern_id}_track_#{this.model.cid}_beat_#{i}' tabindex='0'>#{html}</span>")
      beat.data("beat", i)
      $(this.el).append(beat)
      this.Beats[i] = beat
      
    this.model.get("Pattern").View.$(".pattern_tracks").append $(this.el)
    
  beatOver: (e) ->
    $(e.currentTarget).focus()

  beatKeydown: (e) ->
    beat = $(e.currentTarget).data("beat")
    # console.log e.keyCode
    switch e.keyCode
      when 9 then return true # tab
      when 8 then this.focusPrev(beat) # delete
      when 46 then this.focusPrev(beat) # esc
      when 38 then this.focusPrevTrack(beat) # up
      when 40 then this.focusNextTrack(beat) # down
      when 37 then this.focusPrev(beat) # left
      when 39 then this.focusNext(beat) # right
      else this.setBeatKeycode(beat, e.keyCode); return false # trigger keys
    
  setBeatKeycode: (beat, keyCode) ->
    triggerid = App.keycodes.indexOf(keyCode)
    if triggerid is -1
      if keyCode is 32 or keyCode is 8 or keyCode is 46 or keyCode is 27 # space, bksp, del, esc
        triggerid = null
      else
        return
        
    newText = if triggerid is null then "&nbsp;" else App.triggers[triggerid]
    this.Beats[beat].html(newText);
    
    this.model.setBeat(beat, triggerid)
    
    if keyCode isnt 32 and triggerid is null # not space
      this.focusPrev(beat)
    else
      this.focusNext(beat)
    
  focusPrev: (beat) ->
    if beatel = this.Beats[beat-1]
      beatel.focus()
    false
      
  focusNext: (beat) ->
    if beatel = this.Beats[beat+1]
      beatel.focus()
    false
      
  focusPrevTrack: (beat) ->
    if beatel = this.Beats[beat].parent().prev().children(".beat_#{beat}")
      beatel.focus()
    false
      
  focusNextTrack: (beat) ->
    if beatel = this.Beats[beat].parent().next().children(".beat_#{beat}")
      beatel.focus()
    false
    
  setBeat: (beat, triggerid) ->
    newText = if triggerid is null then "&nbsp;" else App.triggers[triggerid]
    this.Beats[beat].html(newText);
    
  delete: ->
    if confirm "Are you sure you want to remove this pattern (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    $(this.el).remove()
