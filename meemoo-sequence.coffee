### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

This file is part of Meemoo.
  
  Meemoo is free software: you can redistribute it and/or modify 
  it under the terms of the GNU Affero General Public License as 
  published by the Free Software Foundation, either version 3 of 
  the License, or (at your option) any later version.
  
  Meemoo is distributed in the hope that it will be useful, but 
  WITHOUT ANY WARRANTY; without even the implied warranty of 
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the 
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General 
  Public License along with Meemoo.  If not, see 
  <http://www.gnu.org/licenses/>.

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
  