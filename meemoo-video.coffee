### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

###

this.Video = Backbone.Model.extend
  initialize: ->
    this.Triggers = []
    this.addTrigger 0, 0
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
      ytid: this.get("ytid")
      triggers: this.Triggers
      
      
this.VideoList = Backbone.Collection.extend
  model: Video
  getOrAddVideo: (ytid) ->
    for thisvideo in this.models
      if ytid is thisvideo.get("ytid")
        return thisvideo
    # Else make a new one
    newVideo = new Video({ytid:ytid})
    this.add(newVideo)
    return newVideo

this.VideoView = Backbone.View.extend
  tagName: "div"
  className: "video"
  # template: _.template $('#video-template').html()
  
  render: ->
    # $(this.el).html this.template this.model.toJSON()
    # this.updateTriggers()
    return this
    
  initialize: ->
    this.updateTriggers()
    # this.render()
    # $("#videos").append($(this.el))
    
  updateTriggers: ->
    triggershtml = ""
    for trigger in this.model.Triggers
      if trigger isnt null and trigger >= 0 and this.model.get("totaltime") > 0
        left = trigger / this.model.get("totaltime") * 100
        triggershtml += "<span class='showtrigger v_#{this.model.cid}_t_#{_i}' style='left:#{left}%;'>#{App.triggers[_i]}</span>"
    $(".showtriggers_#{this.model.cid}").html(triggershtml)
