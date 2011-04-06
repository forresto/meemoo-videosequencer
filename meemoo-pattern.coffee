### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

this.Pattern = Backbone.Model.extend
  initialize: ->
    this.Tracks = new TrackList()
    
  initializeView: ->
    this.View = new PatternView {model:this, id:"pattern_#{this.cid}"}
    for track in this.Tracks.models
      track.initializeView()
      
  # addTracks: ->
  #   for player in this.get("Composition").Players.models
  #     this.addTrack player
  
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
      this.View.$(".beat").removeClass("cue")
      this.View.$(".beat").removeClass("active")
      this.View.$(".pattern_trigger").addClass("active")
      
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
      
  setNext: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid isnt -1
      this.model.set
        next: triggerid
      $(e.currentTarget).text App.triggers[triggerid]
    
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
        
    this.$('.navigable').attr("tabindex", 0)
        
    # for track in this.model.Tracks.models
    #   track.initializeView()
    
  delete: ->
    if confirm "Are you sure you want to remove this pattern (#{this.model.get('title')})?"
      this.model.delete()
      
  play: ->
    this.model.play()
    this.$(".pattern_trigger").addClass("cue")
    
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
    this.model.set {beats:beats}
    for track in this.model.Tracks.models
      track.View.initialize()
      
  step: ->
    this.$(".beat").removeClass("active")
    this.$(".beat_#{this.model.beat}").addClass("active")
    
  remove: ->
    $(this.el).remove()

