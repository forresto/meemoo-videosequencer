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
    App.Composition = this
    
    if this.get("loadJSON") isnt undefined
      pastedJSON = this.get("loadJSON")
      if pastedJSON isnt ""
        loadComp = JSON.parse(pastedJSON);
        console.log loadComp
    this.Videos = new VideoList()
    this.Players = new PlayerList()
    this.View = new CompositionView {model:this}
    
    # Repopulate players and videos
    if this.attributes.players
      for player in this.attributes.players
        for video in this.attributes.videos
          if player.video_id == video.id
            addID = video.ytid
            if addID isnt ""
              newPlayer = new Player {ytid:addID}
              this.Players.add newPlayer
              newPlayer.Video.Triggers = video.triggers
              newPlayer.Video.View.updateTriggers()
    
    
  toJSON: ->
    jsonobject =
      id: this.id
      title: this.get("title")
      description: this.get("description")
      mixer: this.get("mixer")
      videos: this.Videos
      players: this.Players
      
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
