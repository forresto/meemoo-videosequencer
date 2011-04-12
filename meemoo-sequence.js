(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Sequence = Backbone.Model.extend({
    defaults: {
      length: 16
    },
    initialize: function() {
      return this.Tracks = new SequenceTrackList();
    },
    initializeView: function() {
      var track, _i, _len, _ref, _results;
      this.View = new SequenceView({
        model: this
      });
      _ref = this.Tracks.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        _results.push(track.initializeView());
      }
      return _results;
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        id: this.cid,
        length: parseInt(this.get("length")),
        tracks: this.Tracks
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    },
    addTrack: function() {
      var newTrack;
      newTrack = new SequenceTrack({
        Sequence: this
      });
      this.Tracks.add(newTrack);
      return newTrack;
    }
  });
  this.SequenceList = Backbone.Collection.extend({
    model: Sequence
  });
  this.SequenceView = Backbone.View.extend({
    tagName: "div",
    className: "sequence",
    template: _.template($('#sequence-template').html()),
    events: {
      "mouseover .navigable": "mouseoverNavigable",
      "change .sequence_length": "setLength",
      "blur .sequence_length": "setLength"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.render();
      this.model.get("Composition").View.$(".sequences").append($(this.el));
      this.$('.sequence_play_button').button({
        icons: {
          primary: "ui-icon-play"
        },
        text: false
      });
      return this.$('.sequence_stop_button').button({
        icons: {
          primary: "ui-icon-stop"
        },
        text: false
      });
    },
    mouseoverNavigable: function(e) {
      return $(e.currentTarget).focus();
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this composition (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    setLength: function() {
      var length, track, _i, _len, _ref, _results;
      length = this.$(".sequence_length").val();
      this.model.set({
        length: length
      });
      _ref = this.model.Tracks.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        _results.push(track.View.initialize());
      }
      return _results;
    },
    remove: function() {
      return $(this.el).remove();
    }
  });
}).call(this);
