/*
 * Classifier
 * https://github.com/timkendall/Classifier
 *
 * Copyright (c) 2014 Tim Kendall, Ian Jackson
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash'),
  path = require('path'),
  fs = require('graceful-fs'),
  mkdirp = require('mkdirp'),
  async = require('async');

// List of default words to ignore when training/classifying
var ignore = [
  'time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life', 'hand',
  'part', 'child', 'eye', 'woman', 'place', 'work', 'week', 'case', 'point', 'government',
  'company', 'number', 'group', 'problem', 'fact',
  'be', 'have', 'do', 'say', 'get', 'make', 'go', 'known', 'take', 'see',
  'come', 'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work',
  'seem', 'feel', 'try', 'leave', 'call',
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old',
  'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important',
  'few', 'public', 'bad', 'same', 'able',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up',
  'about', 'into', 'over', 'after', 'beneath', 'under', 'above',
  'the', 'and', 'a', 'that', 'I', 'it', 'not', 'he', 'as', 'you',
  'this', 'but', 'his', 'they', 'her', 'she', 'or', 'an', 'will', 'my',
  'one', 'all', 'would', 'there', 'their' ];

var Classifier = function (options) {
  options = options || {};
  this.ignore = options.ignore || ignore;

  this.training = {
    genres: {},
    words: {},
    totals: {}
  };
}

Classifier.prototype.initialize = function (data) {
  this.training = data || this.training;
};


Classifier.prototype.train = function (script, genre) {
  var wordOccurences = countWordOccurrences(script);

  // Count scripts trained for genre
  if (!this.training.genres[genre]) this.training.genres[genre] = 0;
  this.training.genres[genre] += 1;

  for (var i = 0; i < wordOccurences.length; ++i) {
    var word = wordOccurences[i];

    // Count occurences in each genre for individual words
    if (!this.training.words[word][genre]) this.training.words[word][genre] = 0;
    this.training.words[word][genre] += 1;

    // Count totals
    if (!this.training.totals[genre]) this.training.totals[genre] = 0;
    this.training.totals[genre] += 1;
  }
};

Classifier.prototype.classify = function (script, options) {
  options = options || {};
  this.detailed = options.detailed || false;

  // Add unique word count
  var uniqueWords = 0;
  for (var key in this.training.words) {
    ++uniqueWords;
  }

  // Generate probabilities from training word counts
  var logProbabilities = generateLogProbabilities(this.training, uniqueWords);
  // Get object of word occurences for this script
  var wordOccurences = countWordOccurrences(this.ignore, script);
  // dfddf
  var scriptProbabilities = generateScriptProbabilities(this.training, wordOccurences, logProbabilities);

  // Analyze results, classify script in genre with highest probability
  var highest = scriptProbabilities['Action'];
  var classifiedGenre = 'Action';
  for (var prob in scriptProbabilities) {
    if (scriptProbabilities[prob] > highest) {
      highest = scriptProbabilities[prob];
      classifiedGenre = prob;
    }
  }

  // Return results
  if (this.detailed) {
    var details = generatePercentages(scriptProbabilities);
    details.Classified = classifiedGenre;

    return details;
  } else {
     return classifiedGenre;
  }
};

Classifier.prototype.import = function (path) {
  var location = path || 'training/training.json';
  // Import our training data
  var raw = fs.readFileSync(location).toString();
  this.training = JSON.parse(raw);
};

Classifier.prototype.export = function (path) {
  var destination = path || 'training/training.json';
  // Convert our training data to JSON
  var json = JSON.stringify(this.training, null, 2);

  // Save in current directory
  fs.writeFile(destination, json, function (err) {
    if (err) console.log(err);
    else  console.log('Training JSON saved.');
  });
};

exports.Classifier = Classifier;

// Take in a script, count word occurences
function countWordOccurrences (ignore, string) {
  // Error handling
  if (!ignore) ignore = new Array();
  else if (ignore && !Array.isArray(ignore)) return new Error('countWordOccurrences() requires the ignore param to be an array');
  if (string.length === 0) return {};

  var wordOccurences = {};

  // Tokenize string
  var tokens = string.match(/([A-Z])\w+/g);

  // Keep synchronous
  for (var i = 0; i < tokens.length; ++i) {
    var word = tokens[i];
    // Ignore words, using ugly _.filter to match case-insensitive
    if ((_.filter(ignore, function (token) { return token.toLowerCase() === word.toLowerCase(); })).length !== 0) continue;
    // Add word field if doesn't exist
    if(!wordOccurences[word]) wordOccurences[word] = 0;
    // Count
    wordOccurences[word] += 1;
  }

  return wordOccurences;
};

function generatePercentages (probabilities) {
  // Reduce object to array of values (final probabilities)
  var values = _.values(probabilities);
  // Add up all values
  var total = _.reduce(values, function (sum, num) {
    return sum + num;
  });

  // Convert probabilities to percentages
  for (var prob in probabilities) {
    probabilities[prob] = ((probabilities[prob] / total) * 100).toFixed(2);
  }

  return probabilities;
}

function generateLogProbabilities (training, uniqueWords) {
  var logProbabilities = {};

  // Setup object with fields for each genre
  for (var genre in training.totals) {
    logProbabilities[genre] = {};
  }

  // Calculate probablities for each word w.r.t each genre
  for (var word in training.words) {
    for (var genre in training.words[word]) {
      var numerator = training.words[word][genre] + 1;
      var denominator = training.totals[genre] + uniqueWords;
      var probability = Math.log(numerator/denominator);
      logProbabilities[genre][word] = -1 * probability;
    }
  }

  return logProbabilities;
}

function generateScriptProbabilities (training, wordOccurences, logProbabilities) {
  // Object to hold probabilities
  var scriptProbabilities = {}

  // Setup object with fields for each genre
  for (var genre in training.totals) {
    scriptProbabilities[genre] = 0;
  }

  // Baye's Probability Theorem
  for (var word in wordOccurences) {
    var wordCount = wordOccurences[word];

    if (training.words[word]) {
      for (var genre in training.words[word]) {
        // P(word | genre) for each word and genre
        scriptProbabilities[genre] += logProbabilities[genre][word];
      }
    } else {
      // Just add 1 if word from script isn't in training
      for (var genre in scriptProbabilities) {
        ++scriptProbabilities[genre];
      }
    }
  }

  // Don't think we need this...
  for (var prob in scriptProbabilities) {
    scriptProbabilities[prob] *= 1/(Object.keys(training.totals).length);
  }

  return scriptProbabilities;
}