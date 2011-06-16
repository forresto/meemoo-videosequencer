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

this.SequenceTrack = Backbone.Model.extend
  
  initialize: ->
    this.Line = []
    
  initializeView: ->
    this.View = new SequenceTrackView {model:this}
    
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
      line: this.Line
      
  delete: ->
    this.destroy()
    this.View.remove()
    
    
this.SequenceTrackList = Backbone.Collection.extend
  model: Track
