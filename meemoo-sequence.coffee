### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 

this.Sequence = Backbone.Model.extend
  # defaults:
  #   
  # initialize: ->
  #   
  # initializeView: ->
    
  toJSON: ->
    jsonobject =
      id: this.id
      
  delete: ->
    this.destroy()
    this.View.remove()
    

this.SequenceList = Backbone.Collection.extend
  model: Sequence
  
  
this.SequenceView = Backbone.View.extend
  tagName: "div"
  className: "sequence"
  template: _.template $('#sequence-template').html()
  
  # events:
  
  render: ->
    $(this.el).html this.template this.model.toJSON()
    return this
    
  initialize: ->
    this.render()
    $("#patterns").append $(this.el)
    
  delete: ->
    if confirm "Are you sure you want to remove this composition (#{this.model.get('title')})?"
      this.model.delete()
      
  remove: ->
    $(this.el).remove()
