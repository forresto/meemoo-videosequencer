### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

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

this.SequenceTrackView = Backbone.View.extend
  tagName: "div"
  className: "sequencetrack"
  template: _.template $('#sequencetrack-template').html()
  
  events:
    "keydown .beat" : "beatKeydown"
    "click .beat"   : "cueBeat"
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    $(this.el).empty()
    this.Beats = []
    this.render()
    length = this.model.get("Sequence").get("length")
    for i in [0..length-1]
      html = App.triggers[this.model.Line[i]]
      if html is null or html is undefined
        html = "&nbsp;"
      beat = $("<span class='sequencebeat beat beat_#{i} navigable'>#{html}</span>")
      beat.data("beat", i)
      $(this.el).append(beat)
      this.Beats[i] = beat
      
    this.$('.navigable').attr("tabindex", 0)
    this.model.get("Sequence").View.$(".sequence_tracks").append $(this.el)
    
  cueBeat: (e) ->
    this.$(".beat").removeClass("cue")
    beat = $(e.currentTarget).data("beat")
    beatel = this.Beats[beat]
    beatel.addClass("cue")
    this.model.get("Sequence").cue(beat)
    
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
