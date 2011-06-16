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

this.CompositionView = Backbone.View.extend
  tagName: "div"
  className: "composition"
  template: _.template $('#composition-template').html()
  
  events:
    "click .composition-save-button"   : "save"
    "click .composition-export-button" : "export"
    "mouseover .navigable"             : "mouseoverNavigable"
    "keydown .automulti"               : "automulti"
    "keydown .automulti2"              : "automulti2"
    "click .add-video"                 : "addVideo"
    "click .add-pattern"               : "addPattern"
    "click .add-sequence"              : "addSequence"
    "click .play-all-button"           : "playAll"
    "click .pause-all-button"          : "pauseAll"
    "blur .editable"                   : "setInfo"
    "blur .comp_info_bpm"              : "setBpm"
    # "change .comp_info_bpm" : "setBpm" # Doesn't seem to fire
    
    
  render: ->
    $(this.el).html this.template this.model.toJSON()
    
    this.$('.composition-save-button')
      .button
        icons: { primary: "ui-icon-disk" }
        
    this.$('.composition-export-button')
      .button
        icons: { primary: "ui-icon-clipboard" }
        
    this.$('.automulti')
      .button
        icons: { primary: "ui-icon-battery-1" }
          
    this.$('.automulti2')
      .button
        icons: { primary: "ui-icon-battery-3" }
        
    this.$('.add-video')
      .button
        icons: { primary: "ui-icon-plus" }

    this.$('.add-pattern')
      .button
        icons: { primary: "ui-icon-plus" }
        
    this.$('.add-sequence')
      .button
        icons: { primary: "ui-icon-plus" }
        
    this.$('.play-all-button')
      .button
        icons: { primary: "ui-icon-play" }
        
    this.$('.pause-all-button')
      .button
        icons: { primary: "ui-icon-pause" }
    
    # this.$(".patterns-tabs").tabs()
    
  initialize: ->
    this.render()
    $("#setup").append $(this.el)
    
  mouseoverNavigable: (e) ->
    $(e.currentTarget).focus()
    
  addVideo: ->
    newVideo = this.model.addVideo this.$(".add-video-input").val()
    this.$(".add-video-input").val("")
    newVideo.initializeView()
    newVideo.View.$(".video-sources").show()
    newVideo.View.testFirst()
    
  
  # addPlayer: ->
  #   input = this.$(".addplayerid").val()
  #   if input is ""
  #     return
  #   # Full yt url
  #   if (input.indexOf("youtube.com") isnt -1)
  #     input = input.split("v=")[1].split("&")[0]
  #   # Full src for <video>
  #   if (input.indexOf("http://") isnt -1)
  #     input = input.split("v=")[1].split("&")[0]
  #   this.model.addPlayer input
      
  addPattern: ->
    newPattern = this.model.addPattern()
    newPattern.initializeView()
      
  addSequence: ->
    newSequence = this.model.addSequence()
    newSequence.initializeView()
    
    
  # triggers 0-9 in videos 0-3
  automulti: (e) -> 
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid is -1 
      return
      
    count = 0
    for video in this.model.Videos.models
      for player in video.Players.models
        if count is Math.floor(triggerid / 10)
          player.View.trigger(triggerid % 10)
          break
        else 
          count++
        
  # all triggers in all videos
  automulti2: (e) ->
    triggerid = App.keycodes.indexOf(e.keyCode)
    if triggerid is -1 
      return
      
    triggers = ""
    
    for video in this.model.Videos.models
      seconds = parseFloat video.get("triggers")[triggerid]
      if seconds is seconds # Isnt NaN
        for player in video.Players.models
          triggers += "/seek/#{player.cid}/#{seconds}|"
    App.postRawMessageToViewer triggers
        
  playAll: ->
    for video in this.model.Videos.models
      for player in video.Players.models
        player.View.play()
    
  pauseAll: ->
    for video in this.model.Videos.models
      for player in video.Players.models
        player.View.pause()
    
  save: ->
    this.model.save()
    this.model.saveLastSaved()
    this.model.ListView.render()
    this.$(".composition-save-button").button({label:"Save"})
    
    # Research
    _gaq.push(['_trackEvent', 'Composition', 'Save '+this.model.id, JSON.stringify(this.model)])
    
    
  setInfo: ->
    this.model.set
      title : this.$(".comp_info_title").text().trim()
      mixer : this.$(".comp_info_mixer").text().trim()
      description : this.$(".comp_info_description").text().trim()
    # this.model.unsavedChanges()
    
  setBpm: ->
    this.model.setBpm parseInt this.$(".comp_info_bpm").val()
    # this.model.unsavedChanges()
    
  export: ->
    this.model.ListView.export()
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    this.model.stop() # stop patterns
    App.postMessageToViewer("remove", "ALL")
    $(this.el).empty().remove()
