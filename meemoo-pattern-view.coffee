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

this.PatternView = Backbone.View.extend
  tagName: "div"
  className: "pattern"
  template: _.template $('#pattern-template').html()
  
  events:
    "click .pattern_addtrack_button" : "chooseTrack"
    "mouseover .navigable"       : "mouseoverNavigable"
    "change .pattern_beats"      : "setBeats"
    "blur .pattern_beats"        : "setBeats"
    "change .pattern_chance"     : "setChance"
    "blur .pattern_chance"       : "setChance"
    "click .pattern_play_button" : "play"
    "click .pattern_stop_button" : "stop"
    "keydown .pattern_trigger"   : "setTrigger"
    "keydown .pattern_next"      : "setNext"
    
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  setChance: (e) ->
    this.model.set
      chance: parseInt $(e.currentTarget).val()
    
  setTrigger: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid isnt -1
      this.model.set
        trigger_id: triggerid
      $(e.currentTarget).text App.triggers[triggerid]
    false
    
  setNext: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid isnt -1
      this.model.set
        next: triggerid
      $(e.currentTarget).text App.triggers[triggerid]
    false
      
  startPlaying: ->
    this.$(".beat").removeClass("cue")
    $(".patterns .beat").removeClass("active")
    #FIXME?
    # this.$(".pattern_trigger").addClass("active") 
    
  initialize: ->
    this.render()
    
    this.$('.pattern_play_button')
      .button
        icons: { primary: "ui-icon-play" }
        text: false
    this.$('.pattern_stop_button')
      .button
        icons: { primary: "ui-icon-stop" }
        text: false
    this.$('.pattern_addtrack_button')
      .button
        icons: { primary: "ui-icon-plus" }
    this.$('.navigable')
      .attr("tabindex", 0)
    
    this.model.get("Composition").View.$(".patterns").append $(this.el)
      
  delete: ->
    if confirm "Are you sure you want to remove this pattern (#{this.model.get('title')})?"
      this.model.delete()
      
  play: ->
    this.model.play()
    $(".pattern_trigger").removeClass("cue")
    this.$(".pattern_trigger").addClass("cue")
    
  stop: ->
    this.model.stop()
    this.$(".beat").removeClass("active")
    
  chooseTrack: ->
    dialog = $("<div></div>")
    for video in this.model.get("Composition").Videos.models
      for player in video.Players.models
        disabled = false
        # disable button if used already
        for track in this.model.Tracks.models
          if track.get("Player").cid is player.cid
            disabled = true 
        addplayerbutton = $("<div>#{player.cid}</div>")
        addplayerbutton
          .data
            pattern_id : this.model.cid
            player_id : player.cid
          .button
            disabled : disabled
          .click ->
            pattern_id = $(this).data "pattern_id"
            player_id = $(this).data "player_id"
            App.Composition.Patterns.getByCid(pattern_id).View.addTrack player_id
            $(dialog).dialog("close")
        dialog.append(addplayerbutton);
      
    $(this.el).append dialog
    dialog.dialog();
      
  addTrack: (player_id) ->
    newTrack = this.model.addTrack App.Composition.getPlayerByCid(player_id)
    newTrack.initializeView()
    
  setBeats: ->
    beats = this.$(".pattern_beats").val()
    this.model.set {beats:beats}
    for track in this.model.Tracks.models
      track.View.initialize()
      
  step: ->
    this.$(".beat").removeClass("active")
    this.$(".beat_#{this.model.beat}").addClass("active")
    
  remove: ->
    $(this.el).remove()

