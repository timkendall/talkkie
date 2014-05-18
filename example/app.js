var talkkie = require('../lib/talkkie'),
    fs = require('graceful-fs');

// Import training data
var classifier = new talkkie.Classifier();
classifier.import('/Users/Me/Dropbox/Projects/msc/node_modules/talkkie/lib/training/training.json');

// Read a test script
fs.readFile('/Users/Me/Desktop/Scripts/Comedy/american-splendor.txt', 'utf8', function (err, contents) {
  if (err) throw err;

  // Classify
  var detailed = classifier.classify(contents, { detailed: true });

  // Loop through detailed object
  for (var field in detailed) {
    if (field === 'Classified') console.log('Classified as: ' + detailed.Classified)
    else console.log(field + ': ' + detailed[field] + '%');
  }
  // -> ["Classified as: Drama - Action: 24.55%, Comedy: 24.41%, Drama: 26.13%, Horror: 24.92% "]
});
