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

this.Track = Backbone.Model.extend
  
  initialize: ->
    this.Line = []
    this.pattern_id = this.get("Pattern").cid
    
  initializeView: ->
    this.View = new TrackView {model:this, Pattern:this.get("Pattern")}
    
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
      player_id: this.get("Player").cid
      line: this.Line
      
  delete: ->
    this.destroy()
    this.View.remove()
    
    
this.TrackList = Backbone.Collection.extend
  model: Track

this.TrackView = Backbone.View.extend
  tagName: "div"
  className: "track"
  template: _.template $('#track-template').html()
  
  events:
    "keydown .beat"        : "beatKeydown"
    
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    $(this.el).empty()
    this.Beats = []
    this.render()
    beats = this.model.get("Pattern").get("beats")
    for i in [0..beats-1]
      html = App.triggers[this.model.Line[i]]
      if html is null or html is undefined
        html = "&nbsp;"
      beat = $("<span class='beat beat_#{i} navigable'>#{html}</span>")
      beat.data("beat", i)
      $(this.el).append(beat)
      this.Beats[i] = beat
      
    this.$('.navigable').attr("tabindex", 0)
    this.model.get("Pattern").View.$(".pattern_tracks").append $(this.el)
    
  beatKeydown: (e) ->
    beat = $(e.currentTarget).data("beat")
    # console.log e.keyCode
    switch e.keyCode
      when 9 then return true # tab
      when 8 then this.focusPrev(beat) # delete
      when 46 then this.focusPrev(beat) # esc
      when 38 then this.focusPrevTrack(beat) # up
      when 40 then this.focusNextTrack(beat) # down
      when 37 then this.focusPrev(beat) # left
      when 39 then this.focusNext(beat) # right
      else this.setBeatKeycode(beat, e.keyCode); return false # trigger keys
    false
    
  setBeatKeycode: (beat, keyCode) ->
    triggerid = App.keycodes.indexOf(keyCode)
    if triggerid is -1
      if keyCode is 32 or keyCode is 8 or keyCode is 46 or keyCode is 27 # space, bksp, del, esc
        triggerid = null
      else
        return
        
    newText = if triggerid is null then "&nbsp;" else App.triggers[triggerid]
    this.Beats[beat].html(newText);
    
    this.model.setBeat(beat, triggerid)
    
    if keyCode isnt 32 and triggerid is null # not space
      this.focusPrev(beat)
    else
      this.focusNext(beat)
    
  focusPrev: (beat) ->
    if beatel = this.Beats[beat-1]
      beatel.focus()
    else if beatel = this.Beats[this.Beats.length-1] # wrap around to end
      beatel.focus()
    false
      
  focusNext: (beat) ->
    if beatel = this.Beats[beat+1]
      beatel.focus()
    else if beatel = this.Beats[0] # wrap around to start
      beatel.focus()
    false
      
  focusPrevTrack: (beat) ->
    if beatel = this.Beats[beat].parent().prev().children(".beat_#{beat}")
      beatel.focus()
    false
      
  focusNextTrack: (beat) ->
    if beatel = this.Beats[beat].parent().next().children(".beat_#{beat}")
      beatel.focus()
    false
    
  setBeat: (beat, triggerid) ->
    newText = if triggerid is null then "&nbsp;" else App.triggers[triggerid]
    this.Beats[beat].html(newText);
    
  delete: ->
    if confirm "Are you sure you want to remove this pattern (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    $(this.el).remove()
