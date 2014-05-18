# talkkie
Movie script genre classifier.

## Getting Started
Install the module with: `npm install talkkie`

```javascript
var talkkie = require('talkkie');
var classifier = new talkkie.Classifier();
```

## Documentation

### Training
Pass in multiple scripts to traing the classifier.

```javascript
var script1 = '...';
var script2 = '...';
var script3 = '...';

classifier.train(script1, 'Action');
classifier.train(script1, 'Comedy');
classifier.train(script1, 'Horror');
```

### Classifying
Classify a script. Optionally pass in an options object.

```javascript
var unkown = '...';
var genre = classifier.classify(unknown);

// -> 'Action'
```

### Exporting training data
Export tarining data as JSON for later use.

```javascript
classifier.export('/Desktop/training.json')
```
  - If a path is not specified training.json will be saved to lib/training

### Import training data
Import training JSON.

```javascript
classifier.import('/Desktop/training.json')
```
  - If a path is not specified it will look for training.json in lib/training

## Examples
See /examples folder.

## How it Works
We use the simple Naive Bayes' theorem to classify movie scripts into genres. This works by essentially counting word occurences in each genre of a training data set. We then compute the probabilities for each word w.r.t each genre. To classify a script we again simply add up all of the previously calculated probabalities w.r.t each genre. The genre with the highest total wins.

_(Some notes)_:
 - We automatically ignore a list of 100 most common words found in English when counting word occurences.
 - We have not implemented classification for the Musical genre (honestly this is not really a genre anyways)
 - A pre-generated training.json is included in lib/training

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Tim Kendall, Ian Jackson. Licensed under the MIT license.
