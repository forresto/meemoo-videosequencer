coffee -c *.coffee
cat meemoo-credit.js lib/underscore.js lib/backbone.js lib/backbone-localstorage.js meemoo-composition.js meemoo-composition-view.js meemoo-video.js meemoo-video-view.js meemoo-player.js meemoo-player-view.js meemoo-pattern.js meemoo-pattern-view.js meemoo-patterntrack.js meemoo-patterntrack-view.js meemoo-sequence.js meemoo-sequence-view.js meemoo-sequencetrack.js meemoo-sequencetrack-view.js meemoo.js | uglifyjs -o meemoo.min.js
git commit -a
