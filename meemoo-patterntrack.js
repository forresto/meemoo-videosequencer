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

  */  this.Track = Backbone.Model.extend({
    initialize: function() {
      this.Line = [];
      return this.pattern_id = this.get("Pattern").cid;
    },
    initializeView: function() {
      return this.View = new TrackView({
        model: this,
        Pattern: this.get("Pattern")
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
        player_id: this.get("Player").cid,
        line: this.Line
      };
    },
    "delete": function() {
      this.destroy();
      return this.View.remove();
    }
  });
  this.TrackList = Backbone.Collection.extend({
    model: Track
  });
}).call(this);
