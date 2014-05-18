var talkkie = require('talkkie'),
    fs = require('graceful-fs');

// Import training data
var classifier = new talkkie.Classifier();
classifier.import('/Users/Me/Dropbox/Projects/msc/node_modules/talkkie/lib/training/training.json');

// Read a test script
fs.readFile('/Users/Me/Desktop/Scripts/Musical/sweeney-todd-the-demon-barber-of-fleet-street.txt', 'utf8', function (err, contents) {
  if (err) throw err;

  var genre = classifier.classify(contents);
  console.log(genre);
});
