/*jslint node:true*/
'use strict';

var express = require('express'),
    path = require('path'),
    helmet = require('helmet'),
    bodyParser = require('body-parser'),
    app = express(),
    uuidv1 = require('uuid/v1'),
    TreeModel = require('tree-model'),
    server = require('http').createServer(app),
    fs = require('fs'),
    Primus = require('primus'),
    primus = new Primus(server, {
        transformer: 'websockets',
        parser: 'JSON'
    });

// hint: TreeModel, tree and root are
// globally available on this page
var tree = new TreeModel();

var root;

// Connect the middleware to express.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(helmet());
primus.save(__dirname + '/http/js/vendor/primus.js');
console.log(path.join(__dirname, '/http'));

// Connect Express Routes
app.use(express['static'](path.join(__dirname, '/http')));

// Start Express
server.listen((process.env.PORT || 3306));
console.log('Things should be good to go.');

// Find the node that we are working with
function findNode(id) {
    return root.first(function (node) {
        return node.model.id === id;
    });
}

// Get a count of all nodes
function findAllNodes() {
    return root.all(function (node) {
        return true;
    });
}

// Quick function to create a random number
function createRandomNumber(data) {
    return Math.floor((Math.random() * data.max) + data.min);
}

// Build a random number array for our nodes
function buildNumberArray(data) {
    var count = 0;
    var builtArray = [];
    while (count < data.count) {
        builtArray.push(createRandomNumber(data));
        count++;
    }
    return builtArray;
}

function saveTree() {
    // Gather all the nodes and then convert it to JSON
    fs.writeFile("tree.json", JSON.stringify(root.model) , function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function loadTree(callback) {
    // Get the tree from the file
    fs.readFile('tree.json', function read(err, data) {
        if (err) {
            throw err;
        }

        buildNodeTree(JSON.parse(data), callback);
    });

    function buildNodeTree(parsedData, callback) {
        // Load the tree
        tree = new TreeModel();

        // Parse the tree
        root = tree.parse(parsedData);
        if (callback) {
            callback();
        }
    }
}

primus.on('connection', function (spark) {
    spark.write({
        tree: root.model
    });

    spark.on('data', function message(data) {
        if (data.request !== undefined) {
            try {
                // Find a node based off of the id
                var foundNode = findNode(data.id);
                switch (data.request) {
                    case 'drop':
                        foundNode.drop();
                        console.log('dropped');
                        break;
                    case 'add':
                        var values = buildNumberArray(data);
                        // Parse the new node
                        var newNode = tree.parse({
                            id: uuidv1(),
                            children: [],
                            name: data.name,
                            max: data.max,
                            min: data.min,
                            values: values
                        });
                        // Add it to the parent
                        root.addChild(newNode);
                        console.log('added');
                        break;
                    case 'edit':
                        foundNode.model.name = data.name;
                        foundNode.model.min = data.min;
                        foundNode.model.max = data.max;
                        values = buildNumberArray(data);
                        foundNode.model.values = values;
                        console.log('factory edited and new numbers generated');
                        break;
                    case undefined:
                        console.log('this was never defined');
                        break;
                    default:
                        return;
                }
                if (data.request !== undefined) {
                    saveTree();
                    primus.write({tree: root.model});
                }
            } catch (error) {
                console.log(error);
            }
        }
    });
});

loadTree();