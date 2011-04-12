### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

this.Sequence = Backbone.Model.extend
  defaults:
    length: 16
    
  initialize: ->
    this.Tracks = new SequenceTrackList()
    
  initializeView: ->
    this.View = new SequenceView {model:this}
    for track in this.Tracks.models
      track.initializeView()
    
  toJSON: ->
    jsonobject =
      id: this.cid
      length: parseInt this.get("length")
      tracks: this.Tracks
      
  delete: ->
    this.destroy()
    this.View.remove()
    
  addTrack: ->
    newTrack = new SequenceTrack {Sequence:this}
    this.Tracks.add newTrack
    newTrack
    

this.SequenceList = Backbone.Collection.extend
  model: Sequence
  
  
this.SequenceView = Backbone.View.extend
  tagName: "div"
  className: "sequence"
  template: _.template $('#sequence-template').html()
  
  events:
    "mouseover .navigable" : "mouseoverNavigable"
    "change .sequence_length"      : "setLength"
    "blur .sequence_length"        : "setLength"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    this.render()
    this.model.get("Composition").View.$(".sequences").append $(this.el)
    
    this.$('.sequence_play_button')
      .button
        icons: { primary: "ui-icon-play" }
        text: false
    this.$('.sequence_stop_button')
      .button
        icons: { primary: "ui-icon-stop" }
        text: false
    
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  setLength: ->
    length = this.$(".sequence_length").val()
    this.model.set {length:length}
    for track in this.model.Tracks.models
      track.View.initialize()
      
  remove: ->
    $(this.el).remove()
