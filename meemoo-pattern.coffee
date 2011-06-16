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
    for video in this.get("Composition").Videos.models
      for player in video.Players.models
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
        seconds = track.get("Player").get("Video").get("triggers")[trigger]
        if seconds isnt null and seconds isnt undefined
          this.get("Composition").queueMessage "/seek/#{track.get('Player').cid}/#{seconds}"
        
    #TODO change this for multiple patterns 
    # this.get("Composition").sendQueuedMessages()
    
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
  