### 

Meemoo HTML Audio Visual Sequencer 
  by Forrest Oliphant 
    at Sembiki Interactive http://sembiki.com/ 
    and Media Lab Helsinki http://mlab.taik.fi/ 
(copyleft) 2011 

Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

### 


AppView = Backbone.View.extend

  template: _.template $('#application-template').html()
  
  triggers_us: ["1","2","3","4","5","6","7","8","9","0",
    "q","w","e","r","t","y","u","i","o","p",
    "a","s","d","f","g","h","j","k","l",";",
    "z","x","c","v","b","n","m",",",".","/"]
  keycodes_us: [49,50,51,52,53,54,55,56,57,48,
    81,87,69,82,84,89,85,73,79,80,
    65,83,68,70,71,72,74,75,76,186,
    90,88,67,86,66,78,77,188,190,191]
  
  # events:
  #   "click #addplayer" : "addPlayer"
  #   "click #popoutbutton" : "popoutViewer"
    
  initialize: ->
    # Load application framework
    #TODO add browser tests
    $('#intro').hide()
    $('#application').html this.template
    
    #TODO multiple/custom keyboard layouts?
    this.triggers = this.triggers_us 
    this.keycodes = this.keycodes_us
    
    # Add UI elements
    
    this.viewer = document.getElementById("viewer").contentWindow
    
    $('#popoutbutton')
      .button
        icons: { primary: "ui-icon-newwin" }
      .click ->
        window.App.popoutViewer()
        
    $('#newcomposition')
      .button
        icons: { primary: "ui-icon-document" }
      .click ->
        if confirm "Are you sure you want to start with a new blank composition?"
          # newComp = new Composition()
          App.Composition = App.Compositions.create()
            
    $('#loadcomposition')
      .button
        icons: { primary: "ui-icon-folder-open" }
      .click ->
        $("#comp_dialog").dialog
          modal: true
          width: 400
          
    $('#composition-save')
      .button
        icons: { primary: "ui-icon-disk" }
      .click ->
        App.Composition.save
          title : $("#comp_info_title").text()
          mixer : $("#comp_info_mixer").text()
          description : $("#comp_info_description").text()
        App.Composition.View.render()
        
    $('#composition-export')
      .button
        icons: { primary: "ui-icon-clipboard" }
      .click ->
        App.Composition.View.export()
    
    $('#comp_import_button')
      .button
        icons: { primary: "ui-icon-arrowthickstop-1-s" }
      .click ->
        pastedJSON = $("comp_import_text").text()
        App.Composition = App.Compositions.create({loadJSON:pastedJSON})
    
    $('#addplayer')
      .button
        icons: { primary: "ui-icon-plus" }
      .click ->
        App.addPlayer $('#addplayerid').val()
        return false
        
  initializeCompositions: ->
    this.Compositions = new CompositionList()
    this.Compositions.fetch()
    #HACK
    this.reloadVideos()
      
  addPlayer: (ytid) ->
    if App.Composition is undefined
      App.Composition = App.Compositions.create()
    App.Composition.Players.add new Player {ytid:ytid}
    
  popoutViewer: ->
    this.viewer = window.open("viewer.html", "popoutviewer")
    $('#container').hide()
    $('#viewer').remove()
    $('#setup').addClass("floatingsetup")
    
  popinViewer: ->
    if $("#viewer").length is 0
      $('#container').prepend('<iframe src="viewer.html" id="viewer" name="inviewer"></iframe>')
      this.viewer = document.getElementById("viewer").contentWindow
      $('#container').show()
      $('#setup').removeClass("floatingsetup")
      
  reloadVideos: ->
    @reload = ->
      for player in App.Composition.Players.models
        player.set({loaded:0,time:0})
        App.postMessageToViewer "create", player.cid, player.Video.get("ytid") 
    setTimeout @reload, 2500
      
  postMessageToViewer: (action, id, value) ->
    App.viewer.postMessage "#{action}:#{id}:#{value}", window.location.protocol + "//" + window.location.host
    
  recieveMessage: (msg) ->
    if msg is "-=POPOUTCLOSED=-"
      App.popinViewer()
    else if msg is "-=REFRESH=-"
      App.reloadVideos()
    else
      playerinfos = msg.split("|")
      for playerinfo in playerinfos
        info = playerinfo.split(":")
        id = info[0]
        loaded = info[1]
        totalsize = info[2]
        time = info[3]
        totaltime = info[4]
        if id isnt ""
          player = this.Composition.Players.getByCid(id)
          if player
            player.set({loaded:loaded,totalsize:totalsize,time:time,totaltime:totaltime})
            player.Video.set({totaltime:totaltime})
    

# Initialize app
$ ->
  window.App = new AppView()
  window.App.initializeCompositions()
  
  
# Util


recieveMessage = (e) ->
  if e.origin isnt window.location.protocol + "//" + window.location.host
    return
  window.App.recieveMessage e.data

window.addEventListener "message", recieveMessage, false
