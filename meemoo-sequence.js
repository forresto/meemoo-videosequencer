(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Sequence = Backbone.Model.extend({
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
        id: this.id
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    }
  });
  this.SequenceList = Backbone.Collection.extend({
    model: Sequence
  });
  this.SequenceView = Backbone.View.extend({
    tagName: "div",
    className: "sequence",
    template: _.template($('#sequence-template').html()),
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.render();
      return $("#patterns").append($(this.el));
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
