### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

this.Composition = Backbone.Model.extend
  defaults:
    "title": "untitled composition"
    "description": "mixed with sembiki meemoo audio visual sequencer"
    "mixer": "me!"
    
  # events:
  #   "change": this.View.render()
    
  initialize: ->
    
    if this.get("loadJSON") isnt undefined
      
      pastedJSON = this.get("loadJSON")
      if pastedJSON isnt ""
        loadComp = JSON.parse(pastedJSON);
        if loadComp.bpm
          this.attributes.bpm = loadComp.bpm
        if loadComp.description
          this.attributes.description = loadComp.description
        if loadComp.mixer
          this.attributes.mixer = loadComp.mixer
        if loadComp.patterns
          this.attributes.patterns = loadComp.patterns
        if loadComp.players
          this.attributes.players = loadComp.players
        if loadComp.title
          this.attributes.title = loadComp.title
        if loadComp.sequences
          this.attributes.sequences = loadComp.sequences
        if loadComp.videos
          this.attributes.videos = loadComp.videos
          
    console.log this.attributes
    
    # Repopulate players and videos
    this.Videos = new VideoList()
    this.Players = new PlayerList()
    
    if this.attributes.players
      for player in this.attributes.players
        for video in this.attributes.videos
          if player.video_id is video.id
            addID = video.ytid
            if addID isnt ""
              newPlayer = this.addPlayer addID
              newPlayer.Video.Triggers = video.triggers
              player.newcid = newPlayer.cid
            break
              
    # Repopulate patterns
    this.Patterns = new PatternList()
    
    if this.attributes.patterns
      for pattern in this.attributes.patterns
        newPattern = new Pattern
          Composition: this
          trigger_id: pattern.trigger_id
          next: pattern.next
          chance: pattern.chance
          beats: pattern.beats
        this.Patterns.add newPattern
        pattern.newcid = newPattern.cid
        if pattern.tracks
          for track in pattern.tracks
            old_player_id = track.player_id
            for player in this.attributes.players
              if old_player_id is player.id
                newTrack = newPattern.addTrack this.Players.getByCid player.newcid
                newTrack.setLine track.line
                break
    else
      this.Patterns.add new Pattern
        Composition:this
        beats: 16
      
    # last pattern active
    this.Pattern = null
    this.nextPattern = null
    this.playing = false
    
    # Repopulate sequences
    this.Sequences = new SequenceList()
    
    # if this.attributes.sequences
    
    # timer loop
    if this.attributes.bpm
      this.setBpm this.attributes.bpm
    else
      this.setBpm(120)
    
    this.ListView = new CompositionListView {model:this}
    
  setBpm: (bpm) ->
    if 0 < bpm < 500
      this.set {bpm:bpm}
      this.bpm = bpm
      this.bpm_ms = Math.round 1000 / this.bpm * 60
    
  play: ->
    clearTimeout App.timer
    App.timer = setTimeout "App.Composition.step()", this.bpm_ms
    this.playing = true
    
  stop: ->
    clearTimeout App.timer
    this.playing = false
    
  step: ->
    try
      this.Pattern.step()
      this.play()
    
  cuePattern: (pattern) ->
    this.nextPattern = pattern
    if this.playing is false
      this.Pattern = pattern
      this.play()
      
  loop: ->
    this.Pattern = this.nextPattern
    
  multitrigger: (triggers) ->
    message = ""
    for item in triggers
      seconds = item.player.Video.Triggers[item.trigger]
      if seconds isnt null and seconds isnt undefined
        message += "seek:"
        message += "#{item.player.cid}:"
        message += "#{seconds}|"

    if message isnt ""
      App.postRawMessageToViewer message
    
  initializeView: ->
    this.View = new CompositionView {model:this}
    for player in this.Players.models
      player.initializeView()
    for video in this.Videos.models
      video.initializeView()
    for pattern in this.Patterns.models
      pattern.initializeView()
    # for sequence in this.Sequences.models
    #   sequence.initializeView()
    App.reloadVideos()
      
  addPlayer: (ytid) ->
    newPlayer = new Player 
      Composition:this
      ytid:ytid
    this.Players.add newPlayer
    newPlayer
    
  toJSON: ->
    jsonobject =
      id: this.id
      title: this.get("title")
      description: this.get("description")
      mixer: this.get("mixer")
      bpm: this.get("bpm")
      videos: this.Videos
      players: this.Players
      patterns: this.Patterns
      # sequences: this.Sequences
      
  delete: ->
    this.destroy()
    this.ListView.remove()
    try
      this.View.remove()
    
    
this.CompositionList = Backbone.Collection.extend
  model: Composition
  localStorage: new Store("compositions")
  
  
this.CompositionListView = Backbone.View.extend
  tagName: "div"
  className: "composition-list"
  template: _.template $('#composition-list-template').html()
  
  events:
    "click .comp_load_button" : "load"
    "click .comp_export_button" : "export"
    "click .comp_delete_button" : "delete"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    
    this.$('.comp_load_button')
      .button
        icons: { primary: "ui-icon-folder-open" }
    this.$('.comp_export_button')
      .button
        icons: { primary: "ui-icon-clipboard" }
    this.$('.comp_delete_button')
      .button
        icons: { primary: "ui-icon-trash" }
    
    return this
    
  initialize: ->
    this.render()
    $("#comp_dialog").append $(this.el)
    
    # $("#comp_info_title").text this.model.get("title")
    # $("#comp_info_mixer").text this.model.get("mixer")
    # $("#comp_info_description").text this.model.get("description")
    # $("#bpm").val this.model.get("bpm")
    
  save: ->
    this.render()
    
  load: ->
    App.loadComposition this.model
    $("comp_dialog").dialog("close")
    
  export: ->
    $("#comp_export_dialog textarea").text(JSON.stringify this.model)
    $("#comp_export_dialog").dialog
      modal: true
      width: 400
      height: 300
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    $(this.el).remove()


this.CompositionView = Backbone.View.extend
  tagName: "div"
  className: "composition"
  template: _.template $('#composition-template').html()
  
  events:
    "click .composition-save-button" : "save"
    "click .composition-export-button" : "export"
    "mouseover .navigable" : "mouseoverNavigable"
    "keydown .automulti" : "automulti"
    "keydown .automulti2" : "automulti2"
    "click .pattern-add-link" : "addPattern"
    "click .comp-add-player" : "addPlayer"
    
  render: ->
    $(this.el).html this.template this.model.toJSON()
    
    this.$('.composition-save-button')
      .button
        icons: { primary: "ui-icon-disk" }
        
    this.$('.composition-export-button')
      .button
        icons: { primary: "ui-icon-clipboard" }
        
    this.$('.automulti')
      .button
        icons: { primary: "ui-icon-battery-1" }
          
    this.$('.automulti2')
      .button
        icons: { primary: "ui-icon-battery-3" }
        
    this.$('.comp-add-player')
      .button
        icons: { primary: "ui-icon-plus" }
        
    this.$(".patterns-tabs").tabs()
    
  initialize: ->
    this.render()
    $("#setup").append $(this.el)
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  addPattern: ->
    trigger_id = this.model.Patterns.models.length
    newPattern = new Pattern
      Composition: App.Composition
      trigger_id: trigger_id
      chance: 1.0
      next: trigger_id
      beats: 16
    this.model.Patterns.add newPattern
    newPattern.initializeView()

  addPlayer: ->
    ytid = this.$(".addplayerid").val()
    if ytid isnt ""
      this.model.addPlayer ytid
    
  # triggers 0-9 in videos 0-3
  automulti: (e) -> 
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid is -1 
      return
      
    player = Math.floor(triggerid / 10)
    if this.model.Players.models[player]
      this.model.Players.models[player].View.trigger(triggerid % 10)
      
  # all triggers in all videos
  automulti2: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid is -1 
      return
      
    triggers = []
    
    for player in this.model.Players.models
      trigger = {}
      trigger.player = player
      trigger.trigger = triggerid
      triggers.push trigger
      
    this.model.multitrigger triggers
    
  save: ->
    this.model.save
      title : $.trim this.$(".comp_info_title").text()
      mixer : $.trim this.$(".comp_info_mixer").text()
      description : $.trim this.$(".comp_info_description").text()
      bpm : parseInt this.$(".comp_info_bpm").val()
    this.model.setBpm parseInt this.$(".comp_info_bpm").val()
    this.model.ListView.render()
    
  export: ->
    this.model.ListView.export()
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    this.model.stop() # stop patterns
    for player in this.model.Players.models
      App.postMessageToViewer("remove", player.cid)
    $(this.el).empty().remove()
