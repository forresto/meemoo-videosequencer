(function() {
  /*

  Meemoo HTML Audio Visual Sequencer
    by Forrest Oliphant
      at Sembiki Interactive http://sembiki.com/
      and Media Lab Helsinki http://mlab.taik.fi/
  (copyleft) 2011

  Built with backbone.js, jQuery, and jQueryUI in CoffeeScript

  This file is part of Meemoo.

    Meemoo is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    Meemoo is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General
    Public License along with Meemoo.  If not, see
    <http://www.gnu.org/licenses/>.

  */  this.TrackView = Backbone.View.extend({
    tagName: "div",
    className: "track",
    template: _.template($('#track-template').html()),
    events: {
      "keydown .beat": "beatKeydown"
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      var beat, beats, html, i, _ref;
      $(this.el).empty();
      this.Beats = [];
      this.render();
      beats = this.model.get("Pattern").get("beats");
      for (i = 0, _ref = beats - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        html = App.triggers[this.model.Line[i]];
        if (html === null || html === void 0) {
          html = "&nbsp;";
        }
        beat = $("<span class='beat beat_" + i + " navigable'>" + html + "</span>");
        beat.data("beat", i);
        $(this.el).append(beat);
        this.Beats[i] = beat;
      }
      this.$('.navigable').attr("tabindex", 0);
      return this.model.get("Pattern").View.$(".pattern_tracks").append($(this.el));
    },
    beatKeydown: function(e) {
      var beat;
      beat = $(e.currentTarget).data("beat");
      switch (e.keyCode) {
        case 9:
          return true;
        case 8:
          this.focusPrev(beat);
          break;
        case 46:
          this.focusPrev(beat);
          break;
        case 38:
          this.focusPrevTrack(beat);
          break;
        case 40:
          this.focusNextTrack(beat);
          break;
        case 37:
          this.focusPrev(beat);
          break;
        case 39:
          this.focusNext(beat);
          break;
        default:
          this.setBeatKeycode(beat, e.keyCode);
          return false;
      }
      return false;
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
