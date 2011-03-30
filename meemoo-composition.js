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
      var loadComp, pastedJSON;
      if (this.get("loadJSON") !== void 0) {
        pastedJSON = this.get("loadJSON");
        if (pastedJSON !== "") {
          loadComp = JSON.parse(pastedJSON);
          console.log(loadComp);
        }
      }
      this.Videos = new VideoList();
      this.Players = new PlayerList();
      return this.View = new CompositionView({
        model: this
      });
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        info: {
          title: this.get("title"),
          description: this.get("description"),
          mixer: this.get("mixer")
        },
        videos: this.Videos,
        players: this.Players
      };
    }
  });
  this.CompositionList = Backbone.Collection.extend({
    model: Composition
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
      return this;
    },
    initialize: function() {
      this.render();
      $("#comp_dialog").append($(this.el));
      $("#comp_info_title").text(this.model.get("title"));
      $("#comp_info_description").text(this.model.get("description"));
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
      return this.$('.comp_delete_button').button({
        icons: {
          primary: "ui-icon-trash"
        }
      });
    },
    save: function() {
      return this.model.set({
        title: $("#comp_info_title").text(),
        description: $("#comp_info_description").text()
      });
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
        return false;
      }
    }
  });
}).call(this);
