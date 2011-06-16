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

this.Player = Backbone.Model.extend
  defaults:
    "volume": 100

  # loaded, totalsize, time, totaltime
  initialize: ->
    if this.get("Composition") is App.Composition
      this.initializeView()
  initializeView: ->
    this.View = new PlayerView {model:this}
    this.set({playing:true})
  remove: ->
    this.get("Video").Players.remove(this)
  change: ->
    this.View.updateinfo()
  toJSON: ->
    jsonobject =
      id: this.cid
      # video_id: this.Video.cid
      volume: parseInt this.get("volume")
      
this.PlayerList = Backbone.Collection.extend
  model: Player
