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

this.Sequence = Backbone.Model.extend
  defaults:
    length: 16
    
  initialize: ->
    this.Tracks = new SequenceTrackList()
    this.beat = -1
    
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
    
  cue: (beat) ->
    this.beat = beat-1
    
  play: ->
    # this.beat = -1 # since loop is called to get first pattern
    this.get("Composition").cueSequence(this)
    
  stop: ->
    this.beat = -1
    this.get("Composition").stopSequence(this)
    
  step: ->
    this.beat++
    if this.beat >= this.get("length") 
      this.beat = 0
    # highlight
    this.View.step()
    next_id = this.Tracks.models[0].Line[this.beat]
    if next_id is undefined
      next_id = null
    return next_id
    
this.SequenceList = Backbone.Collection.extend
  model: Sequence
  
  
this.SequenceView = Backbone.View.extend
  tagName: "div"
  className: "sequence"
  template: _.template $('#sequence-template').html()
  
  events:
    "mouseover .navigable"         : "mouseoverNavigable"
    "change .sequence_length"      : "setLength"
    "blur .sequence_length"        : "setLength"
    "click .sequence_play_button"  : "play"
    "click .sequence_stop_button"  : "stop"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    this.render()
    
    this.$('.sequence_play_button')
      .button
        icons: { primary: "ui-icon-play" }
        text: false
    this.$('.sequence_stop_button')
      .button
        icons: { primary: "ui-icon-stop" }
        text: false
    this.$('.navigable')
      .attr("tabindex", 0)
    
    this.model.get("Composition").View.$(".sequences").append $(this.el)
    
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  setLength: ->
    length = this.$(".sequence_length").val()
    if 0 < length < 1000
      this.model.set {length:length}
      for track in this.model.Tracks.models
        track.View.initialize()
      
  remove: ->
    $(this.el).remove()
    
  play: ->
    # $(".sequencetrack .beat").removeClass("active")
    this.model.play()
    
  stop: ->
    this.model.stop()
    this.$(".beat").removeClass("active")
    
  step: ->
    this.$(".beat").removeClass("cue")
    $(".sequencetrack .beat").removeClass("active")
    this.$(".beat_#{this.model.beat}").addClass("active")
