coffee -c *.coffee
cat meemoo-credit.js lib/underscore.js lib/backbone.js lib/backbone-localstorage.js meemoo-composition.js meemoo-video.js meemoo-player.js meemoo-pattern.js meemoo-patterntrack.js meemoo-sequence.js meemoo-sequencetrack.js meemoo.js | uglifyjs -o meemoo.min.js
git commit -a
