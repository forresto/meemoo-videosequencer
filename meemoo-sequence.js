(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.Sequence = Backbone.Model.extend({
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
