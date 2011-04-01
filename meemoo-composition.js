(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Composition = Backbone.Model.extend({
    defaults: {
      "title": "untitled composition",
      "description": "mixed with sembiki meemoo audio visual sequencer",
      "mixer": "me!"
    },
    initialize: function() {
      var addID, loadComp, newPlayer, pastedJSON, player, video, _i, _len, _ref, _results;
      if (this.get("loadJSON") !== void 0) {
        pastedJSON = this.get("loadJSON");
        if (pastedJSON !== "") {
          loadComp = JSON.parse(pastedJSON);
          console.log(loadComp);
        }
      }
      this.View = new CompositionView({
        model: this
      });
      this.Videos = new VideoList();
      this.Players = new PlayerList();
      if (this.attributes.players) {
        _ref = this.attributes.players;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          player = _ref[_i];
          _results.push((function() {
            var _i, _len, _ref, _results;
            _ref = this.attributes.videos;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              video = _ref[_i];
              _results.push(player.video_id === video.id ? (addID = video.ytid, addID !== "" ? (newPlayer = this.addPlayer(addID), newPlayer.Video.Triggers = video.triggers) : void 0) : void 0);
            }
            return _results;
          }).call(this));
        }
        return _results;
      }
    },
    initializeView: function() {
      var player, video, _i, _j, _len, _len2, _ref, _ref2;
      _ref = this.Players.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        player.initializeView();
      }
      _ref2 = this.Videos.models;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        video = _ref2[_j];
        video.initializeView();
      }
      return App.reloadVideos();
    },
    addPlayer: function(ytid) {
      var newPlayer;
      newPlayer = new Player({
        Composition: this,
        ytid: ytid
      });
      this.Players.add(newPlayer);
      return newPlayer;
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.id,
        title: this.get("title"),
        description: this.get("description"),
        mixer: this.get("mixer"),
        videos: this.Videos,
        players: this.Players
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    }
  });
  this.CompositionList = Backbone.Collection.extend({
    model: Composition,
    localStorage: new Store("compositions")
  });
  this.CompositionView = Backbone.View.extend({
    tagName: "div",
    className: "composition",
    template: _.template($('#composition-list-template').html()),
    events: {
      "click .comp_load_button": "load",
      "click .comp_export_button": "export",
      "click .comp_delete_button": "delete"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$('.comp_load_button').button({
        icons: {
          primary: "ui-icon-folder-open"
        }
      });
      this.$('.comp_export_button').button({
        icons: {
          primary: "ui-icon-clipboard"
        }
      });
      this.$('.comp_delete_button').button({
        icons: {
          primary: "ui-icon-trash"
        }
      });
      return this;
    },
    initialize: function() {
      this.render();
      $("#comp_dialog").append($(this.el));
      $("#comp_info_title").text(this.model.get("title"));
      $("#comp_info_mixer").text(this.model.get("mixer"));
      return $("#comp_info_description").text(this.model.get("description"));
    },
    save: function() {
      return this.render();
    },
    load: function() {
      return false;
    },
    "export": function() {
      $("#comp_export_dialog textarea").text(JSON.stringify(this.model));
      return $("#comp_export_dialog").dialog({
        modal: true,
        width: 400,
        height: 300
      });
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this composition (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    remove: function() {
      return $(this.el).remove();
    }
  });
}).call(this);
