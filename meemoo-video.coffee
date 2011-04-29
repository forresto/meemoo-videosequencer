### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

###

this.Video = Backbone.Model.extend
  defaults:
    "title": ""
  
  initialize: ->
    this.Triggers = []
    this.addTrigger 0, 0
    if this.get("title") is ""
      this.set
        "title": this.get("ytid")
    if this.get("Composition") is App.Composition
      this.initializeView()
  initializeView: ->
    this.View = new VideoView {model:this}
  addTrigger: (position, time) ->
    if position < App.triggers.length # if there is room for triggers
      time = parseFloat(time)
      if this.Triggers.indexOf(time) is -1 # if the time isn't a trigger already
        this.Triggers[position] = time
  change: ->
    # this.Triggers.sort((a,b) -> a-b)
    if this.View
      this.View.updateTriggers()
  toJSON: ->
    jsonobject =
      id: this.cid
      title: this.get("title")
      ytid: this.get("ytid")
      webm: this.get("webm")
      mp4: this.get("mp4")
      triggers: this.Triggers
      
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

this.VideoView = Backbone.View.extend
  tagName: "div"
  className: "video"
  template: _.template $('#video-template').html()
  
  events:
    # "focus .video-title" : "editTitle"
    "blur .video-title" : "saveTitle"
    "click .video-edittriggers" : "editTriggers"
    "click .video-addplayer" : "addPlayer"
    "click .video-delete" : "delete"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    this.render()
    
    this.$(".video-edittriggers").button
      icons: { primary: "ui-icon-pencil" }
    this.$(".video-addplayer").button
      icons: { primary: "ui-icon-plus" }
    this.$(".video-delete").button
      icons: { primary: "ui-icon-trash" }
      text: false
    
    this.model.get("Composition").View.$(".videos").append($(this.el))
    this.updateTriggers()
    
  # editTitle: ->
  #   document.designMode = 'on'
    
  saveTitle: ->
    # document.designMode = 'off'
    this.model.set
      "title" : this.$(".video-title").text()
  
  updateTriggers: ->
    triggershtml = ""
    for trigger in this.model.Triggers
      if trigger isnt null and trigger >= 0 and this.model.get("totaltime") > 0
        left = trigger / this.model.get("totaltime") * 100
        if left < 100
          triggershtml += "<span class='showtrigger v_#{this.model.cid}_t_#{_i}' style='left:#{left}%;'>#{App.triggers[_i]}</span>"
    $(".showtriggers_#{this.model.cid}").html(triggershtml)
