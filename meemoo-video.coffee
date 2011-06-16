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

this.Video = Backbone.Model.extend
  # events:
  #   "change:triggers" : "updateTriggers"
    
  defaults:
    "title": ""
    "triggers": []
    
  initialize: ->
    this.Players = new PlayerList()
    
    loadthis = this.get("firstValue")
    if loadthis and loadthis isnt ""
      if (loadthis.indexOf(".webm") isnt -1)
        this.set
          webm: loadthis
          # testFirst: "webm"
      else if (loadthis.indexOf(".mp4") isnt -1 or loadthis.indexOf(".m4v") isnt -1 or loadthis.indexOf(".mov") isnt -1)
        this.set
          mp4: loadthis
          # testFirst: "mp4"
      else if (loadthis.indexOf("youtube.com") isnt -1) # Full yt url
        loadthis = loadthis.split("v=")[1].split("&")[0]
        this.set
          ytid: loadthis
          # testFirst: "ytid"
      else
        this.set
          ytid: loadthis
          # testFirst: "ytid"
    
    if this.get("title") is ""
      this.set
        "title": this.get("ytid")
    
  initializeView: ->
    this.View = new VideoView {model:this}
    for player in this.Players.models
      player.initializeView()
    this.updateTriggers()
    
  addTrigger: (position, time) ->
    if position < App.triggers.length # if there is room for triggers
      time = parseFloat(time)
      if this.get("triggers").indexOf(time) is -1 # if the time isn't a trigger already
        this.get("triggers")[position] = time
        this.updateTriggers()
  updateTriggers: ->
    if this.View
      this.View.updateTriggers()
  toJSON: ->
    jsonobject =
      id       : this.cid
      title    : this.get("title")
      duration : parseFloat this.get("duration")
      webm     : this.get("webm")
      mp4      : this.get("mp4")
      ytid     : this.get("ytid")
      triggers : this.get("triggers")
      players  : this.Players
      
  addPlayer: ->
    #TODO safety for no sources
    this.Players.add new Player
      Composition: this.get("Composition")
      Video: this
      
  remove: ->
    for player in this.Players.models
      if player.View
        player.View.remove()
      else 
        player.remove()
        
    this.get("Composition").Videos.remove(this)
    
this.VideoList = Backbone.Collection.extend
  model: Video
  getOrAddVideo: (composition, ytid) ->
    for thisvideo in this.models
      # if ytid is thisvideo.get("ytid") or webm is thisvideo.get("webm") or mp4 is thisvideo.get("mp4")
      if ytid is thisvideo.get("ytid")
        return thisvideo
    # Else make a new one
    newVideo = new Video({Composition:composition, ytid:ytid})
    this.add(newVideo)
    return newVideo
