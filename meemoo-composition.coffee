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

this.Composition = Backbone.Model.extend
  defaults:
    "title": "untitled composition"
    "description": "mixed with sembiki meemoo audio visual sequencer"
    "mixer": "me!"
    
  # events:
  #   "change": this.View.render()
    
  initialize: ->
    
    if this.get("loadJSON") isnt undefined
      pastedJSON = this.get("loadJSON")
      if pastedJSON isnt ""
        loadComp = JSON.parse(pastedJSON);
        if loadComp.id
          # Simplest tracking of parents
          this.attributes.parent_id = loadComp.id
          if loadComp.parent_id
            this.attributes.parent_id += "," + loadComp.parent_id
        if loadComp.bpm
          this.attributes.bpm = loadComp.bpm
        if loadComp.description
          this.attributes.description = "Forked from " + loadComp.title + " by " + loadComp.mixer + " --- " + loadComp.description
        if loadComp.mixer
          this.attributes.mixer = loadComp.mixer
        if loadComp.patterns
          this.attributes.patterns = loadComp.patterns
        # if loadComp.players
        #   this.attributes.players = loadComp.players
        if loadComp.title
          this.attributes.title = "Re: " + loadComp.title
        if loadComp.sequences
          this.attributes.sequences = loadComp.sequences
        if loadComp.videos
          this.attributes.videos = loadComp.videos
          
    # console.log this.attributes
    
    # Repopulate players and videos
    this.Videos = new VideoList()
    # this.Players = new PlayerList()
    
    if this.attributes.videos
      for video in this.attributes.videos
        newVideo = new Video
          Composition: this
          title: video.title
          duration: video.duration
          webm: video.webm
          mp4: video.mp4
          ytid: video.ytid
          triggers: video.triggers
        video.newcid = newVideo.cid
        this.Videos.add newVideo
        if video.players
          for player in video.players
            newPlayer = new Player
              Composition: this
              Video: newVideo
            newPlayer.oldcid = player.id
            player.newcid = newPlayer.cid
            newVideo.Players.add newPlayer
            
    # Repopulate patterns
    this.Patterns = new PatternList()
    
    if this.attributes.patterns
      for pattern in this.attributes.patterns
        newPattern = new Pattern
          Composition: this
          trigger_id: pattern.trigger_id
          next: pattern.next
          chance: pattern.chance
          beats: pattern.beats
        this.Patterns.add newPattern
        pattern.newcid = newPattern.cid
        if pattern.tracks
          for track in pattern.tracks
            old_player_id = track.player_id
            for video in this.Videos.models
              for player in video.Players.models
                if old_player_id is player.oldcid
                  newTrack = newPattern.addTrack player
                  newTrack.setLine track.line
                  break
      
    # no pattern active
    this.Pattern = null
    this.nextPattern = null
    this.playing = false
    this.queuedMessages = ""
    
    # Repopulate sequences
    this.Sequences = new SequenceList()
    
    if this.attributes.sequences
      for sequence in this.attributes.sequences
        newSeq = new Sequence
          Composition: this
          length: sequence.length
        this.Sequences.add newSeq
        if sequence.tracks
          for track in sequence.tracks
            if track.line.length > 0
              newSeqTrack = newSeq.addTrack()
              newSeqTrack.setLine track.line
              
    # no pattern active
    this.Sequence = null
    this.nextSequence = null
    
    # timer loop
    if this.attributes.bpm
      this.setBpm this.attributes.bpm
    else
      this.setBpm(120)
    
    this.ListView = new CompositionListView {model:this}
    
  setBpm: (bpm) ->
    if 0 < bpm <= 500
      this.set {bpm:bpm}
      this.bpm = bpm
      this.bpm_ms = Math.round( 1000 * 60 / this.bpm )
      this.play()
    
  play: ->
    clearTimeout App.timer
    App.timer = setTimeout "App.Composition.step()", this.bpm_ms
    
  stop: ->
    this.Pattern = null
    # clearTimeout App.timer
    this.playing = false
    
  step: ->
    if this.Pattern
      this.Pattern.step()
    this.sendQueuedMessages()
    this.play()
    
  cuePattern: (pattern) ->
    this.nextPattern = pattern
    if this.playing is false
      this.Pattern = pattern
      this.nextPattern = null
      this.playing = true
      
  cueSequence: (sequence) ->
    this.nextSequence = sequence
    if this.playing is false
      this.Sequence = sequence
      this.nextSequence = null
      this.loop()
      this.playing = true
      
  playSequence: (sequence) ->
    this.Sequence = sequence
    this.nextPattern = null
    this.loop()
    # this.play()
      
  stopSequence: (sequence) ->
    if this.Sequence is sequence
      this.Sequence = null
      
  loop: ->
    if this.nextPattern isnt null
      this.Pattern = this.nextPattern
      this.nextPattern = null
      this.Sequence = null
      return
      
    if this.nextSequence isnt null
      this.Sequence = this.nextSequence
      this.nextSequence = null
    
    next_id = null
    if this.Sequence isnt null
      # next by sequence
      next_id = this.Sequence.step()
    if next_id is null 
      if this.Pattern isnt null
        # next by pattern next
        next_id = this.Pattern.get("next")
      
    # weighted random, with help from http://stackoverflow.com/questions/1761626/weighted-random-numbers
    sum_of_chance = 0
    choices = []
    for pattern in this.Patterns.models
      if pattern.get("trigger_id") is next_id
        sum_of_chance += pattern.get("chance")
        choices.push(pattern)
    if choices.length is 1
      this.Pattern = choices[0]
    else if choices.length > 1
      rnd = Math.random()*sum_of_chance
      for choice in choices
        if(rnd < choice.get("chance"))
          this.Pattern = choice
          return
        rnd -= choice.get("chance")
    
  multitrigger: (triggers) ->
    message = ""
    for item in triggers
      seconds = item.player.Video.get("triggers")[item.trigger]
      if seconds isnt null and seconds isnt undefined
        message += "/seek/"
        message += "#{item.player.cid}/"
        message += "#{seconds}|"
        
    if message isnt ""
      App.postRawMessageToViewer message
      
  queueMessage: (message) ->
    this.queuedMessages += message+"|"
        
  sendQueuedMessages: ->
    if this.queuedMessages is ""
      this.queuedMessages = "/"
    App.postRawMessageToViewer this.queuedMessages
    this.queuedMessages = ""
    
  initializeView: ->
    this.View = new CompositionView {model:this}
    # for player in this.Players.models
    #   player.initializeView()
    for video in this.Videos.models
      video.initializeView()
    for pattern in this.Patterns.models
      pattern.initializeView()
    for sequence in this.Sequences.models
      sequence.initializeView()
    this.saveLastSaved()
    
    setTimeout "App.reloadVideos()", 2000
      
    
  addVideo: (first_load="") ->
    newVideo = new Video
      Composition: this
      firstValue: first_load
    this.Videos.add newVideo
    newVideo
    
  addPattern: ->
    trigger_id = this.Patterns.models.length
    newPattern = new Pattern
      Composition: this
      trigger_id: trigger_id
      next: trigger_id
    this.Patterns.add newPattern
    newPattern.addTracks()
    newPattern
    
  addSequence: ->
    newSequence = new Sequence
      Composition: this
    this.Sequences.add newSequence
    newSequence.addTrack()
    newSequence
    
  toJSON: ->
    jsonobject =
      id: this.id
      title: this.get("title")
      description: this.get("description")
      mixer: this.get("mixer")
      bpm: this.get("bpm")
      videos: this.Videos
      patterns: this.Patterns
      sequences: this.Sequences
      parent_id: this.get("parent_id")
      
  delete: ->
    this.destroy()
    this.ListView.remove()
    try
      this.View.remove()
  
  saveLastSaved: ->
    this.lastsaved = JSON.stringify(this)
  
  changesMade: ->
    unsaved = this.lastsaved isnt JSON.stringify(this)
    if this.View and unsaved
      this.View.$(".composition-save-button").button({label:"Save!!!"})
    return unsaved
    
  getPlayerByCid: (cid) ->
    for video in this.Videos.models
      for player in video.Players.models
        if player.cid is cid
          return player
    return null
  
    
this.CompositionList = Backbone.Collection.extend
  model: Composition
  localStorage: new Store("compositions")
  
  
this.CompositionListView = Backbone.View.extend
  tagName: "div"
  className: "composition-list"
  template: _.template $('#composition-list-template').html()
  
  events:
    "click .comp_load_button" : "load"
    "click .comp_export_button" : "export"
    "click .comp_delete_button" : "delete"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    
    this.$('.comp_load_button')
      .button
        icons: { primary: "ui-icon-folder-open" }
    this.$('.comp_export_button')
      .button
        icons: { primary: "ui-icon-clipboard" }
    this.$('.comp_delete_button')
      .button
        icons: { primary: "ui-icon-trash" }
    
    return this
    
  initialize: ->
    this.render()
    $("#comp_dialog").append $(this.el)
    
  load: ->
    if App.Composition.changesMade()
      if !confirm "You have unsaved changes in the current composition. Discard unsaved changes?"
        $("#comp_dialog").dialog("close")
        return
    App.loadComposition this.model
    $("#comp_dialog").dialog("close")
    
  export: ->
    $("#comp_export_dialog textarea").text(JSON.stringify this.model)
    $("#comp_export_dialog").dialog
      width: 400
      height: 300
      position: "right top"
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    $(this.el).remove()
    
