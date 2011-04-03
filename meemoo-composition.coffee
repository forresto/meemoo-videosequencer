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
    "bpm": 100
    
  # events:
  #   "change": this.View.render()
    
  initialize: ->
    if this.get("loadJSON") isnt undefined
      #TODO
      pastedJSON = this.get("loadJSON")
      if pastedJSON isnt ""
        loadComp = JSON.parse(pastedJSON);
        console.log loadComp
    
    # Repopulate players and videos
    this.Videos = new VideoList()
    this.Players = new PlayerList()
    
    if this.attributes.players
      for player in this.attributes.players
        for video in this.attributes.videos
          if player.video_id == video.id
            addID = video.ytid
            if addID isnt ""
              newPlayer = this.addPlayer addID
              newPlayer.Video.Triggers = video.triggers
              
    # Repopulate patterns and sequences
    this.Patterns = new PatternList()
    this.Patterns.add new Pattern({Composition:this})
    this.Sequences = new SequenceList()
    
    # if this.attributes.patterns
    
    # if this.attributes.sequences
    
  initializeView: ->
    this.View = new CompositionView {model:this}
    for player in this.Players.models
      player.initializeView()
    for video in this.Videos.models
      video.initializeView()
    for pattern in this.Patterns.models
      pattern.initializeView()
    for sequence in this.Sequences.models
      sequence.initializeView()
    App.reloadVideos()
      
  addPlayer: (ytid) ->
    newPlayer = new Player 
      Composition:this
      ytid:ytid
    this.Players.add newPlayer
    # for pattern in this.Patterns
    #   pattern.addPlayer newPlayer.cid
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
      sequences: this.Sequences
      
  delete: ->
    this.destroy()
    this.View.remove()
    
    
this.CompositionList = Backbone.Collection.extend
  model: Composition
  localStorage: new Store("compositions")
  
  
this.CompositionView = Backbone.View.extend
  tagName: "div"
  className: "composition"
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
    
    $("#comp_info_title").text this.model.get("title")
    $("#comp_info_mixer").text this.model.get("mixer")
    $("#comp_info_description").text this.model.get("description")
    $("#bpm").val this.model.get("bpm")
    
    $("#patterns-tabs").tabs()
    $("#addpattern").click ->
      App.Composition.Patterns.add new Pattern({Composition:App.Composition})
    
    
  save: ->
    this.render()
    
  load: ->
    #TODO
    false 
    
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
