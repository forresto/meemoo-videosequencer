### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

this.Pattern = Backbone.Model.extend
  defaults:
    trigger_id: 0
    chance: 1
    beats: 16
    next: 0
    
  initialize: ->
    this.Tracks = new TrackList()
    this.beat = 0
    
  initializeView: ->
    this.View = new PatternView {model:this, id:"pattern_#{this.cid}"}
    for track in this.Tracks.models
      track.initializeView()
      
  addTracks: ->
    for player in this.get("Composition").Players.models
      this.addTrack player
  
  addTrack: (player) ->
    newTrack = new Track({Pattern:this, Player:player})
    this.Tracks.add newTrack
    newTrack
    
  toJSON: ->
    jsonobject =
      id: this.cid
      trigger_id: parseInt this.get("trigger_id")
      chance: parseInt this.get("chance")
      next: parseInt this.get("next")
      beats: parseInt this.get("beats")
      tracks: this.Tracks

  play: ->
    this.get("Composition").cuePattern(this)
    this.beat = 0
    
  stop: ->
    this.get("Composition").stop()
    this.beat = 0
      
  step: ->
    if this.beat is 0
      this.View.startPlaying()
      
    for track in this.Tracks.models
      trigger = track.Line[this.beat]
      if trigger isnt null and trigger isnt undefined
        seconds = track.get("Player").Video.Triggers[trigger]
        if seconds isnt null and seconds isnt undefined
          this.get("Composition").queueMessage "seek:"+track.get("Player").cid+":"+seconds
        
    this.get("Composition").sendQueuedMessages()
    
    # highlight
    this.View.step()
    
    this.beat++
    if this.beat >= this.get("beats")
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
    "mouseover .navigable"       : "mouseoverNavigable"
    "change .pattern_beats"      : "setBeats"
    "blur .pattern_beats"        : "setBeats"
    "change .pattern_chance"     : "setChance"
    "blur .pattern_chance"       : "setChance"
    "click .pattern_play_button" : "play"
    "click .pattern_stop_button" : "stop"
    "keydown .pattern_trigger"   : "setTrigger"
    "keydown .pattern_next"      : "setNext"
    
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  setChance: (e) ->
    this.model.set
      chance: parseInt $(e.currentTarget).val()
    
  setTrigger: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid isnt -1
      this.model.set
        trigger_id: triggerid
      $(e.currentTarget).text App.triggers[triggerid]
    false
    
  setNext: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid isnt -1
      this.model.set
        next: triggerid
      $(e.currentTarget).text App.triggers[triggerid]
    false
      
  startPlaying: ->
    this.$(".beat").removeClass("cue")
    $(".patterns .beat").removeClass("active")
    #FIXME?
    # this.$(".pattern_trigger").addClass("active") 
    
  initialize: ->
    this.render()
    
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
    this.$('.navigable')
      .attr("tabindex", 0)
    
    this.model.get("Composition").View.$(".patterns").append $(this.el)
      
  delete: ->
    if confirm "Are you sure you want to remove this pattern (#{this.model.get('title')})?"
      this.model.delete()
      
  play: ->
    this.model.play()
    $(".pattern_trigger").removeClass("cue")
    this.$(".pattern_trigger").addClass("cue")
    
  stop: ->
    this.model.stop()
    this.$(".beat").removeClass("active")
    
  chooseTrack: ->
    dialog = $("<div></div>")
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
      
    $(this.el).append dialog
    dialog.dialog();
      
  addTrack: (player_id) ->
    newTrack = this.model.addTrack App.Composition.Players.getByCid(player_id)
    newTrack.initializeView()
    
  setBeats: ->
    beats = this.$(".pattern_beats").val()
    this.model.set {beats:beats}
    for track in this.model.Tracks.models
      track.View.initialize()
      
  step: ->
    this.$(".beat").removeClass("active")
    this.$(".beat_#{this.model.beat}").addClass("active")
    
  remove: ->
    $(this.el).remove()

