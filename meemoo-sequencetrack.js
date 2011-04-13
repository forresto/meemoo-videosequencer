(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  */  this.SequenceTrack = Backbone.Model.extend({
    initialize: function() {
      return this.Line = [];
    },
    initializeView: function() {
      return this.View = new SequenceTrackView({
        model: this
      });
    },
    setLine: function(line) {
      return this.Line = line;
    },
    addTrigger: function(position, trigger) {
      return this.Line[position] = trigger;
    },
    setBeat: function(beat, triggerid) {
      this.Line[beat] = triggerid;
      if (this.View) {
        return this.View.setBeat(beat, triggerid);
      }
    },
    toJSON: function() {
      var jsonobject;
      return jsonobject = {
        line: this.Line
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    }
  });
  this.SequenceTrackList = Backbone.Collection.extend({
    model: Track
  });
  this.SequenceTrackView = Backbone.View.extend({
    tagName: "div",
    className: "sequencetrack",
    template: _.template($('#sequencetrack-template').html()),
    events: {
      "keydown .beat": "beatKeydown",
      "click .beat": "cueBeat"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      var beat, html, i, length, _ref;
      $(this.el).empty();
      this.Beats = [];
      this.render();
      length = this.model.get("Sequence").get("length");
      for (i = 0, _ref = length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        html = App.triggers[this.model.Line[i]];
        if (html === null || html === void 0) {
          html = "&nbsp;";
        }
        beat = $("<span class='sequencebeat beat beat_" + i + " navigable'>" + html + "</span>");
        beat.data("beat", i);
        $(this.el).append(beat);
        this.Beats[i] = beat;
      }
      this.$('.navigable').attr("tabindex", 0);
      return this.model.get("Sequence").View.$(".sequence_tracks").append($(this.el));
    },
    cueBeat: function(e) {
      var beat, beatel;
      this.$(".beat").removeClass("cue");
      beat = $(e.currentTarget).data("beat");
      beatel = this.Beats[beat];
      beatel.addClass("cue");
      return this.model.get("Sequence").cue(beat);
    },
    beatKeydown: function(e) {
      var beat;
      beat = $(e.currentTarget).data("beat");
      switch (e.keyCode) {
        case 9:
          return true;
        case 8:
          return this.focusPrev(beat);
        case 46:
          return this.focusPrev(beat);
        case 38:
          return this.focusPrevTrack(beat);
        case 40:
          return this.focusNextTrack(beat);
        case 37:
          return this.focusPrev(beat);
        case 39:
          return this.focusNext(beat);
        default:
          this.setBeatKeycode(beat, e.keyCode);
          return false;
      }
    },
    setBeatKeycode: function(beat, keyCode) {
      var newText, triggerid;
      triggerid = App.keycodes.indexOf(keyCode);
      if (triggerid === -1) {
        if (keyCode === 32 || keyCode === 8 || keyCode === 46 || keyCode === 27) {
          triggerid = null;
        } else {
          return;
        }
      }
      newText = triggerid === null ? "&nbsp;" : App.triggers[triggerid];
      this.Beats[beat].html(newText);
      this.model.setBeat(beat, triggerid);
      if (keyCode !== 32 && triggerid === null) {
        return this.focusPrev(beat);
      } else {
        return this.focusNext(beat);
      }
    },
    focusPrev: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat - 1]) {
        beatel.focus();
      } else if (beatel = this.Beats[this.Beats.length - 1]) {
        beatel.focus();
      }
      return false;
    },
    focusNext: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat + 1]) {
        beatel.focus();
      } else if (beatel = this.Beats[0]) {
        beatel.focus();
      }
      return false;
    },
    focusPrevTrack: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat].parent().prev().children(".beat_" + beat)) {
        beatel.focus();
      }
      return false;
    },
    focusNextTrack: function(beat) {
      var beatel;
      if (beatel = this.Beats[beat].parent().next().children(".beat_" + beat)) {
        beatel.focus();
      }
      return false;
    },
    setBeat: function(beat, triggerid) {
      var newText;
      newText = triggerid === null ? "&nbsp;" : App.triggers[triggerid];
      return this.Beats[beat].html(newText);
    },
    "delete": function() {
      if (confirm("Are you sure you want to remove this pattern (" + (this.model.get('title')) + ")?")) {
        return this.model["delete"]();
      }
    },
    remove: function() {
      return $(this.el).remove();
    }
  });
}).call(this);
