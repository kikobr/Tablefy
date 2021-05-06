/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/ml-distance-euclidean/lib-es6/euclidean.js":
/*!*****************************************************************!*\
  !*** ./node_modules/ml-distance-euclidean/lib-es6/euclidean.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "squaredEuclidean": () => (/* binding */ squaredEuclidean),
/* harmony export */   "euclidean": () => (/* binding */ euclidean)
/* harmony export */ });
function squaredEuclidean(p, q) {
    let d = 0;
    for (let i = 0; i < p.length; i++) {
        d += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return d;
}
function euclidean(p, q) {
    return Math.sqrt(squaredEuclidean(p, q));
}


/***/ }),

/***/ "./node_modules/ml-knn/src/KDTree.js":
/*!*******************************************!*\
  !*** ./node_modules/ml-knn/src/KDTree.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ KDTree)
/* harmony export */ });
/*
 * Original code from:
 *
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

function Node(obj, dimension, parent) {
  this.obj = obj;
  this.left = null;
  this.right = null;
  this.parent = parent;
  this.dimension = dimension;
}

class KDTree {
  constructor(points, metric) {
    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) {
      this.dimensions = points.dimensions;
      this.root = points;
      restoreParent(this.root);
    } else {
      this.dimensions = new Array(points[0].length);
      for (var i = 0; i < this.dimensions.length; i++) {
        this.dimensions[i] = i;
      }
      this.root = buildTree(points, 0, null, this.dimensions);
    }
    this.metric = metric;
  }

  // Convert to a JSON serializable structure; this just requires removing
  // the `parent` property
  toJSON() {
    const result = toJSONImpl(this.root, true);
    result.dimensions = this.dimensions;
    return result;
  }

  nearest(point, maxNodes, maxDistance) {
    const metric = this.metric;
    const dimensions = this.dimensions;
    var i;

    const bestNodes = new BinaryHeap(function (e) {
      return -e[1];
    });

    function nearestSearch(node) {
      const dimension = dimensions[node.dimension];
      const ownDistance = metric(point, node.obj);
      const linearPoint = {};
      var bestChild, linearDistance, otherChild, i;

      function saveNode(node, distance) {
        bestNodes.push([node, distance]);
        if (bestNodes.size() > maxNodes) {
          bestNodes.pop();
        }
      }

      for (i = 0; i < dimensions.length; i += 1) {
        if (i === node.dimension) {
          linearPoint[dimensions[i]] = point[dimensions[i]];
        } else {
          linearPoint[dimensions[i]] = node.obj[dimensions[i]];
        }
      }

      linearDistance = metric(linearPoint, node.obj);

      if (node.right === null && node.left === null) {
        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }
        return;
      }

      if (node.right === null) {
        bestChild = node.left;
      } else if (node.left === null) {
        bestChild = node.right;
      } else {
        if (point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
        } else {
          bestChild = node.right;
        }
      }

      nearestSearch(bestChild);

      if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        saveNode(node, ownDistance);
      }

      if (
        bestNodes.size() < maxNodes ||
        Math.abs(linearDistance) < bestNodes.peek()[1]
      ) {
        if (bestChild === node.left) {
          otherChild = node.right;
        } else {
          otherChild = node.left;
        }
        if (otherChild !== null) {
          nearestSearch(otherChild);
        }
      }
    }

    if (maxDistance) {
      for (i = 0; i < maxNodes; i += 1) {
        bestNodes.push([null, maxDistance]);
      }
    }

    if (this.root) {
      nearestSearch(this.root);
    }

    const result = [];
    for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
      if (bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
      }
    }
    return result;
  }
}

function toJSONImpl(src) {
  const dest = new Node(src.obj, src.dimension, null);
  if (src.left) dest.left = toJSONImpl(src.left);
  if (src.right) dest.right = toJSONImpl(src.right);
  return dest;
}

function buildTree(points, depth, parent, dimensions) {
  const dim = depth % dimensions.length;

  if (points.length === 0) {
    return null;
  }
  if (points.length === 1) {
    return new Node(points[0], dim, parent);
  }

  points.sort((a, b) => a[dimensions[dim]] - b[dimensions[dim]]);

  const median = Math.floor(points.length / 2);
  const node = new Node(points[median], dim, parent);
  node.left = buildTree(points.slice(0, median), depth + 1, node, dimensions);
  node.right = buildTree(points.slice(median + 1), depth + 1, node, dimensions);

  return node;
}

function restoreParent(root) {
  if (root.left) {
    root.left.parent = root;
    restoreParent(root.left);
  }

  if (root.right) {
    root.right.parent = root;
    restoreParent(root.right);
  }
}

// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html
class BinaryHeap {
  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  }

  pop() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  peek() {
    return this.content[0];
  }

  size() {
    return this.content.length;
  }

  bubbleUp(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      } else {
        // Found a parent that is less, no need to move it further.
        break;
      }
    }
  }

  sinkDown(n) {
    // Look up the target element and its score.
    var length = this.content.length;
    var element = this.content[n];
    var elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2;
      var child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        var child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N];
        var child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      } else {
        // Otherwise, we are done.
        break;
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/ml-knn/src/index.js":
/*!******************************************!*\
  !*** ./node_modules/ml-knn/src/index.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ KNN)
/* harmony export */ });
/* harmony import */ var ml_distance_euclidean__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ml-distance-euclidean */ "./node_modules/ml-distance-euclidean/lib-es6/euclidean.js");
/* harmony import */ var _KDTree__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./KDTree */ "./node_modules/ml-knn/src/KDTree.js");




class KNN {
  /**
   * @param {Array} dataset
   * @param {Array} labels
   * @param {object} options
   * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
   * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
   */
  constructor(dataset, labels, options = {}) {
    if (dataset === true) {
      const model = labels;
      this.kdTree = new _KDTree__WEBPACK_IMPORTED_MODULE_1__.default(model.kdTree, options);
      this.k = model.k;
      this.classes = new Set(model.classes);
      this.isEuclidean = model.isEuclidean;
      return;
    }

    const classes = new Set(labels);

    const { distance = ml_distance_euclidean__WEBPACK_IMPORTED_MODULE_0__.euclidean, k = classes.size + 1 } = options;

    const points = new Array(dataset.length);
    for (var i = 0; i < points.length; ++i) {
      points[i] = dataset[i].slice();
    }

    for (i = 0; i < labels.length; ++i) {
      points[i].push(labels[i]);
    }

    this.kdTree = new _KDTree__WEBPACK_IMPORTED_MODULE_1__.default(points, distance);
    this.k = k;
    this.classes = classes;
    this.isEuclidean = distance === ml_distance_euclidean__WEBPACK_IMPORTED_MODULE_0__.euclidean;
  }

  /**
   * Create a new KNN instance with the given model.
   * @param {object} model
   * @param {function} distance=euclideanDistance - distance function must be provided if the model wasn't trained with euclidean distance.
   * @return {KNN}
   */
  static load(model, distance = ml_distance_euclidean__WEBPACK_IMPORTED_MODULE_0__.euclidean) {
    if (model.name !== 'KNN') {
      throw new Error(`invalid model: ${model.name}`);
    }
    if (!model.isEuclidean && distance === ml_distance_euclidean__WEBPACK_IMPORTED_MODULE_0__.euclidean) {
      throw new Error(
        'a custom distance function was used to create the model. Please provide it again'
      );
    }
    if (model.isEuclidean && distance !== ml_distance_euclidean__WEBPACK_IMPORTED_MODULE_0__.euclidean) {
      throw new Error(
        'the model was created with the default distance function. Do not load it with another one'
      );
    }
    return new KNN(true, model, distance);
  }

  /**
   * Return a JSON containing the kd-tree model.
   * @return {object} JSON KNN model.
   */
  toJSON() {
    return {
      name: 'KNN',
      kdTree: this.kdTree,
      k: this.k,
      classes: Array.from(this.classes),
      isEuclidean: this.isEuclidean
    };
  }

  /**
   * Predicts the output given the matrix to predict.
   * @param {Array} dataset
   * @return {Array} predictions
   */
  predict(dataset) {
    if (Array.isArray(dataset)) {
      if (typeof dataset[0] === 'number') {
        return getSinglePrediction(this, dataset);
      } else if (
        Array.isArray(dataset[0]) &&
        typeof dataset[0][0] === 'number'
      ) {
        const predictions = new Array(dataset.length);
        for (var i = 0; i < dataset.length; i++) {
          predictions[i] = getSinglePrediction(this, dataset[i]);
        }
        return predictions;
      }
    }
    throw new TypeError('dataset to predict must be an array or a matrix');
  }
}

function getSinglePrediction(knn, currentCase) {
  var nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
  var pointsPerClass = {};
  var predictedClass = -1;
  var maxPoints = -1;
  var lastElement = nearestPoints[0][0].length - 1;

  for (var element of knn.classes) {
    pointsPerClass[element] = 0;
  }

  for (var i = 0; i < nearestPoints.length; ++i) {
    var currentClass = nearestPoints[i][0][lastElement];
    var currentPoints = ++pointsPerClass[currentClass];
    if (currentPoints > maxPoints) {
      predictedClass = currentClass;
      maxPoints = currentPoints;
    }
  }

  return predictedClass;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var ml_knn__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ml-knn */ "./node_modules/ml-knn/src/index.js");

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const UIWidth = 350;
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
const resize = (size) => {
    return figma.ui.resize(UIWidth, size + 2);
};
let stringToObj = function (o) {
    let properties = o.replace(', ', ',').split(',');
    let obj = {};
    properties.forEach(function (property) {
        var tup = property.split(':');
        obj[tup[0].trim()] = tup[1].trim().replace('\"', '').replace('"', '');
    });
    return obj;
};
figma.ui.onmessage = msg => {
    if (msg.type == "init") {
        if (msg.size)
            resize(msg.size);
        figma.clientStorage.getAsync("layerNames").then((savedNames) => {
            let layerNames = savedNames || {
                rowIdentifier: "Instance",
                columnIdentifier: "Column",
                headerTextLayer: "Text",
                valueTextLayer: "Text"
            };
            figma.ui.postMessage({
                "type": "init",
                "layerNames": layerNames
            });
        });
        return;
    }
    else if (msg.type == "resize" && msg.size) {
        return resize(msg.size);
    }
    else if (msg.type == "saveLayerNames") {
        let layerNames = msg.layerNames;
        figma.clientStorage.setAsync("layerNames", layerNames);
        return;
    }
    else if (msg.type == 'download') {
        let layerNames = msg.layerNames;
        figma.clientStorage.setAsync("layerNames", layerNames);
        let rowIdentifier = layerNames.rowIdentifier;
        let columnIdentifier = layerNames.columnIdentifier;
        let headerTextLayer = layerNames.headerTextLayer;
        let valueTextLayer = layerNames.valueTextLayer;
        let strVarRegex = /(?<=\{)(.*?)(?=\})/g;
        let rows = [];
        // try to find rows from selection for performance purposes
        if (figma.currentPage.selection.length) {
            for (const sel of figma.currentPage.selection) {
                // if the name of the selected item is the same as the rowidentifier,
                // add it to the rows list
                if (sel.name === rowIdentifier)
                    rows.push(sel);
                // if the selection has children (findAll is not undefined), gather layers identifiable as rows
                if (sel.findAll != undefined)
                    rows = rows.concat(sel.findAll(node => node.name === rowIdentifier));
            }
            // if theres no selection, fall back to fetching rows from the page (slower)
        }
        else {
            rows = rows.concat(figma.currentPage.findAll(node => node.name === rowIdentifier));
        }
        let getColumnFromNode = (fromNode, index) => {
            let columnItem = {};
            columnItem.columnHeader = fromNode.findOne(node => node.name == headerTextLayer);
            // get the layer with the same same as headerTextLayer and use its value as the header
            if (columnItem.columnHeader)
                columnItem.columnHeader = columnItem.columnHeader.characters;
            // otherwise defaults to the columnHeader or a default one
            // its important that each column have a different header, so that the list is correctly rendered
            else
                columnItem.columnHeader = headerTextLayer ? `${headerTextLayer} ${index + 1}` : `Column ${index + 1}`;
            columnItem.columnValue = fromNode.findOne(node => node.name == valueTextLayer);
            if (columnItem.columnValue)
                columnItem.columnValue = columnItem.columnValue.characters;
            else
                columnItem.columnValue = null;
            return (columnItem.columnValue) ? columnItem : null;
        };
        // KNN (K-Nearest Neighbours classification algorithm)
        let knnModels = {};
        // create a KNN model for each variable matching predict:
        if (layerNames.customColumns && layerNames.customColumns.length) {
            let knnError = null;
            layerNames.customColumns.forEach((customColumn, i) => {
                // since we are in a loop, we will generate a new model for each new ${predict:} field,
                // value has ${} syntax
                (customColumn.value.match(strVarRegex) || []).forEach((v) => {
                    // check to see if theres any custom column with the predict naming structure
                    // if so, we have to train the model before the node loop starts, for better performance
                    // if ${} has predict: syntax, train models
                    if (v.match(/predict\:/gi)) {
                        // gets and object from the predict command
                        // 'predict: "component name", category: "layer name"' => { predict: "component name", category: "layer name" }
                        let predictObj = stringToObj(v);
                        // gets the prediction properties
                        let predictElement = predictObj.predict || "", predictElementCategory = predictObj.category || null;
                        // if theres a correct prediction object, train the model using mljs' knn module:
                        // https://github.com/mljs/knn
                        // so that the user could use multiple prediction fields
                        if (predictElement) {
                            let train_dataset = [];
                            let train_labels = [];
                            let trainElements = figma.currentPage.findAll(node => node.name == predictElement);
                            trainElements.forEach(trainElement => {
                                let elementCategory;
                                if (!predictElementCategory)
                                    elementCategory = trainElement;
                                else
                                    elementCategory = trainElement.findOne(node => node.name == predictElementCategory);
                                // creates a grid of 9 points around the elements box models
                                // feed these grid points to knn model
                                for (const corner of Array.from({ length: 9 }, (v, k) => k + 1)) {
                                    let entryXY = [];
                                    switch (corner) {
                                        case 1: // top left
                                            entryXY = [trainElement.x, trainElement.y];
                                            break;
                                        case 2: // top center
                                            entryXY = [trainElement.x + (trainElement.width / 2), trainElement.y];
                                            break;
                                        case 3: // top right
                                            entryXY = [trainElement.x + trainElement.width, trainElement.y];
                                            break;
                                        case 4: // middle left
                                            entryXY = [trainElement.x, trainElement.y + (trainElement.height / 2)];
                                            break;
                                        case 5: // middle center
                                            entryXY = [trainElement.x + (trainElement.width / 2), trainElement.y + (trainElement.height / 2)];
                                            break;
                                        case 6: // middle right
                                            entryXY = [trainElement.x + trainElement.width, trainElement.y + (trainElement.height / 2)];
                                            break;
                                        case 7: // bottom left
                                            entryXY = [trainElement.x, trainElement.y + trainElement.height];
                                            break;
                                        case 8: // bottom middle
                                            entryXY = [trainElement.x + (trainElement.width / 2), trainElement.y + trainElement.height];
                                            break;
                                        case 9: // bottom right
                                            entryXY = [trainElement.x + trainElement.width, trainElement.y + trainElement.height];
                                    }
                                    train_dataset.push(entryXY);
                                    train_labels.push(elementCategory ? elementCategory.characters : "");
                                }
                            });
                            // creates a model for each predictionElement
                            knnModels[predictElement] = new ml_knn__WEBPACK_IMPORTED_MODULE_0__.default(train_dataset, train_labels, { k: 1 }); // consider only the closest neighbour (1)
                            train_dataset = [];
                            train_labels = [];
                            // console.log(train_dataset);
                            // console.log(train_labels);
                            // console.log(model);
                            // console.log(test);
                        }
                        else
                            knnError = "Your predict field is missing a name. Check if you've formatted it correctly.";
                    }
                });
            });
            if (knnError)
                figma.notify(knnError);
        }
        let items = [];
        let keys = [];
        // generate list of exportable items from selected rows
        for (const [nodeIndex, node] of rows.entries()) {
            let headers = [];
            let values = [];
            let item = {};
            // get layers that would represent the row columns
            let columns = node.findAll((node) => node.name === columnIdentifier);
            if (columns.length) {
                columns.forEach((column, columnIndex) => {
                    // inside these column layers, finds a layer to be the header of the column and another to be its value
                    // each item must have a header property for the export with papa parse to work
                    let columnItem = getColumnFromNode(column, columnIndex);
                    if (columnItem) {
                        item[columnItem.columnHeader] = columnItem.columnValue;
                        if (!keys.includes(columnItem.columnHeader))
                            keys.push(columnItem.columnHeader);
                    }
                });
            }
            // otherwise, assume there is only one column and search the value directly from the row node
            else {
                let columnItem = getColumnFromNode(node, 0);
                if (columnItem) {
                    item[columnItem.columnHeader] = columnItem.columnValue;
                    if (!keys.includes(columnItem.columnHeader))
                        keys.push(columnItem.columnHeader);
                }
            }
            let nodeThis = undefined;
            // if there are custom columns, render them and append to item object
            if (layerNames.customColumns && layerNames.customColumns.length) {
                layerNames.customColumns.forEach((customColumn, i) => {
                    let customColumnValue = customColumn.value, customColumnName = customColumn.header || `customColumn${i + 1}`;
                    // value has ${} syntax
                    if (customColumnValue.match(strVarRegex)) {
                        // loop through each ${}
                        let vars = customColumnValue.match(strVarRegex).map((v) => {
                            // if ${} has node-*** syntax, use the suffix to use a property from node object, like id, name, x, y
                            if (v.match(/(?<=node\-)(.*)/gi))
                                return node[v.match(/(?<=node\-)(.*)/gi)[0]];
                            // if ${index}, inject node index + 1 (row line counter)
                            else if (v == "index")
                                return nodeIndex + 1;
                            else if (v.match(/url/i))
                                return encodeURI(`https://www.figma.com/file/${figma.fileKey}/${figma.root.name}?node-id=${node.id}`);
                            else if (v.match(/(?<=predict\:)(.*)/gi)) {
                                // gets and object from the predict command
                                // 'predict: "component name", category: "layer name"' => { predict: "component name", category: "layer name" }
                                let predictObj = stringToObj(v);
                                // gets the prediction name to acess the trained model
                                let predictElement = predictObj.predict || "";
                                if (predictElement) {
                                    // use the trained model to predict this node category
                                    let predictEntry = [node.x + (node.width / 2), node.y + (node.height / 2)]; // center of node
                                    return knnModels[predictElement].predict(predictEntry) || "";
                                }
                                else
                                    return "";
                            }
                            // TODO: enable math operations or something like that
                            else {
                                // try to get layer name from the variable
                                let layer = node.findOne((n) => n.name === v);
                                // if theres one layer found, check if it has characters. if so, use it. if not, just return the variable
                                if (layer && layer.characters)
                                    return layer.characters;
                                else
                                    return v;
                            }
                        });
                        // if the value field has multiple ${}, replace each one with the corresponding vars[index]
                        let replaceValue = customColumnValue;
                        customColumnValue.match(/\$({)(.*?)(\})/g).forEach((strVar, index) => {
                            replaceValue = replaceValue.replace(strVar, vars[index]);
                        });
                        customColumnValue = replaceValue;
                    }
                    item[customColumnName] = customColumnValue;
                });
            }
            // add to list only if its not empty
            if (Object.keys(item).length)
                items.push(item);
        }
        // make sure all items have all keys (even if empty)
        // so that papa parse can export all columns
        items.forEach(item => {
            keys.forEach(key => {
                if (!item[key])
                    item[key] = "";
            });
        });
        if (items.length == 0) {
            figma.notify("No rows found. Try double checking your identifiers and layer names.");
            return;
        }
        // passes the object array back to the UI to be parsed with papa parse and downloaded
        figma.ui.postMessage({
            "type": "download",
            "items": items
        });
        return;
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9UYWJsZWZ5Ly4vbm9kZV9tb2R1bGVzL21sLWRpc3RhbmNlLWV1Y2xpZGVhbi9saWItZXM2L2V1Y2xpZGVhbi5qcyIsIndlYnBhY2s6Ly9UYWJsZWZ5Ly4vbm9kZV9tb2R1bGVzL21sLWtubi9zcmMvS0RUcmVlLmpzIiwid2VicGFjazovL1RhYmxlZnkvLi9ub2RlX21vZHVsZXMvbWwta25uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9UYWJsZWZ5L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1RhYmxlZnkvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL1RhYmxlZnkvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9UYWJsZWZ5L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vVGFibGVmeS8uL3NyYy9jb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFPO0FBQ1A7QUFDQSxtQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EscUJBQXFCLDRCQUE0QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsdUJBQXVCO0FBQ3hDO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUIsY0FBYztBQUMvQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZUFBZSxrREFBa0Q7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RSdUU7O0FBRXpDOztBQUVmO0FBQ2Y7QUFDQSxhQUFhLE1BQU07QUFDbkIsYUFBYSxNQUFNO0FBQ25CLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQSx3QkFBd0IsNENBQU07QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxXQUFXLFlBQVksNERBQWlCLHdCQUF3Qjs7QUFFaEU7QUFDQSxtQkFBbUIsbUJBQW1CO0FBQ3RDO0FBQ0E7O0FBRUEsZUFBZSxtQkFBbUI7QUFDbEM7QUFDQTs7QUFFQSxzQkFBc0IsNENBQU07QUFDNUI7QUFDQTtBQUNBLG9DQUFvQyw0REFBaUI7QUFDckQ7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLFNBQVM7QUFDdEIsY0FBYztBQUNkO0FBQ0EsZ0NBQWdDLDREQUFpQjtBQUNqRDtBQUNBLHdDQUF3QyxXQUFXO0FBQ25EO0FBQ0EsMkNBQTJDLDREQUFpQjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyw0REFBaUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLE9BQU87QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsTUFBTTtBQUNuQixjQUFjLE1BQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixvQkFBb0I7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlCQUFpQiwwQkFBMEI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztVQzNIQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7Ozs7Ozs7OztBQ055QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsV0FBVztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStELGdCQUFnQixHQUFHLFVBQVUsY0FBYyxVQUFVO0FBQ3BIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUZBQXVGLFNBQVM7QUFDaEcsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0EsbUZBQW1GO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSxZQUFZO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQSw0REFBNEQsMkNBQUcsK0JBQStCLE9BQU8sRUFBRTtBQUN2RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsU0FBSTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSx5SEFBeUgsTUFBTTtBQUMvSCxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQSxvQ0FBb0MsTUFBTTtBQUMxQztBQUNBO0FBQ0E7QUFDQSwrRUFBK0UsY0FBYyxHQUFHLGdCQUFnQixXQUFXLFFBQVE7QUFDbkk7QUFDQTtBQUNBLDJGQUEyRjtBQUMzRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0dBQStHO0FBQy9HO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6Qiw4REFBOEQ7QUFDOUQ7QUFDQSxxREFBcUQsU0FBUztBQUM5RDtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRXVjbGlkZWFuKHAsIHEpIHtcclxuICAgIGxldCBkID0gMDtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGQgKz0gKHBbaV0gLSBxW2ldKSAqIChwW2ldIC0gcVtpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXVjbGlkZWFuKHAsIHEpIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoc3F1YXJlZEV1Y2xpZGVhbihwLCBxKSk7XHJcbn1cclxuIiwiLypcbiAqIE9yaWdpbmFsIGNvZGUgZnJvbTpcbiAqXG4gKiBrLWQgVHJlZSBKYXZhU2NyaXB0IC0gViAxLjAxXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL3ViaWxhYnMva2QtdHJlZS1qYXZhc2NyaXB0XG4gKlxuICogQGF1dGhvciBNaXJjZWEgUHJpY29wIDxwcmljb3BAdWJpbGFicy5uZXQ+LCAyMDEyXG4gKiBAYXV0aG9yIE1hcnRpbiBLbGVwcGUgPGtsZXBwZUB1YmlsYWJzLm5ldD4sIDIwMTJcbiAqIEBhdXRob3IgVWJpbGFicyBodHRwOi8vdWJpbGFicy5uZXQsIDIwMTJcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIDxodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocD5cbiAqL1xuXG5mdW5jdGlvbiBOb2RlKG9iaiwgZGltZW5zaW9uLCBwYXJlbnQpIHtcbiAgdGhpcy5vYmogPSBvYmo7XG4gIHRoaXMubGVmdCA9IG51bGw7XG4gIHRoaXMucmlnaHQgPSBudWxsO1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtEVHJlZSB7XG4gIGNvbnN0cnVjdG9yKHBvaW50cywgbWV0cmljKSB7XG4gICAgLy8gSWYgcG9pbnRzIGlzIG5vdCBhbiBhcnJheSwgYXNzdW1lIHdlJ3JlIGxvYWRpbmcgYSBwcmUtYnVpbHQgdHJlZVxuICAgIGlmICghQXJyYXkuaXNBcnJheShwb2ludHMpKSB7XG4gICAgICB0aGlzLmRpbWVuc2lvbnMgPSBwb2ludHMuZGltZW5zaW9ucztcbiAgICAgIHRoaXMucm9vdCA9IHBvaW50cztcbiAgICAgIHJlc3RvcmVQYXJlbnQodGhpcy5yb290KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaW1lbnNpb25zID0gbmV3IEFycmF5KHBvaW50c1swXS5sZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5kaW1lbnNpb25zW2ldID0gaTtcbiAgICAgIH1cbiAgICAgIHRoaXMucm9vdCA9IGJ1aWxkVHJlZShwb2ludHMsIDAsIG51bGwsIHRoaXMuZGltZW5zaW9ucyk7XG4gICAgfVxuICAgIHRoaXMubWV0cmljID0gbWV0cmljO1xuICB9XG5cbiAgLy8gQ29udmVydCB0byBhIEpTT04gc2VyaWFsaXphYmxlIHN0cnVjdHVyZTsgdGhpcyBqdXN0IHJlcXVpcmVzIHJlbW92aW5nXG4gIC8vIHRoZSBgcGFyZW50YCBwcm9wZXJ0eVxuICB0b0pTT04oKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdG9KU09OSW1wbCh0aGlzLnJvb3QsIHRydWUpO1xuICAgIHJlc3VsdC5kaW1lbnNpb25zID0gdGhpcy5kaW1lbnNpb25zO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBuZWFyZXN0KHBvaW50LCBtYXhOb2RlcywgbWF4RGlzdGFuY2UpIHtcbiAgICBjb25zdCBtZXRyaWMgPSB0aGlzLm1ldHJpYztcbiAgICBjb25zdCBkaW1lbnNpb25zID0gdGhpcy5kaW1lbnNpb25zO1xuICAgIHZhciBpO1xuXG4gICAgY29uc3QgYmVzdE5vZGVzID0gbmV3IEJpbmFyeUhlYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiAtZVsxXTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIG5lYXJlc3RTZWFyY2gobm9kZSkge1xuICAgICAgY29uc3QgZGltZW5zaW9uID0gZGltZW5zaW9uc1tub2RlLmRpbWVuc2lvbl07XG4gICAgICBjb25zdCBvd25EaXN0YW5jZSA9IG1ldHJpYyhwb2ludCwgbm9kZS5vYmopO1xuICAgICAgY29uc3QgbGluZWFyUG9pbnQgPSB7fTtcbiAgICAgIHZhciBiZXN0Q2hpbGQsIGxpbmVhckRpc3RhbmNlLCBvdGhlckNoaWxkLCBpO1xuXG4gICAgICBmdW5jdGlvbiBzYXZlTm9kZShub2RlLCBkaXN0YW5jZSkge1xuICAgICAgICBiZXN0Tm9kZXMucHVzaChbbm9kZSwgZGlzdGFuY2VdKTtcbiAgICAgICAgaWYgKGJlc3ROb2Rlcy5zaXplKCkgPiBtYXhOb2Rlcykge1xuICAgICAgICAgIGJlc3ROb2Rlcy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGltZW5zaW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoaSA9PT0gbm9kZS5kaW1lbnNpb24pIHtcbiAgICAgICAgICBsaW5lYXJQb2ludFtkaW1lbnNpb25zW2ldXSA9IHBvaW50W2RpbWVuc2lvbnNbaV1dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpbmVhclBvaW50W2RpbWVuc2lvbnNbaV1dID0gbm9kZS5vYmpbZGltZW5zaW9uc1tpXV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGluZWFyRGlzdGFuY2UgPSBtZXRyaWMobGluZWFyUG9pbnQsIG5vZGUub2JqKTtcblxuICAgICAgaWYgKG5vZGUucmlnaHQgPT09IG51bGwgJiYgbm9kZS5sZWZ0ID09PSBudWxsKSB7XG4gICAgICAgIGlmIChiZXN0Tm9kZXMuc2l6ZSgpIDwgbWF4Tm9kZXMgfHwgb3duRGlzdGFuY2UgPCBiZXN0Tm9kZXMucGVlaygpWzFdKSB7XG4gICAgICAgICAgc2F2ZU5vZGUobm9kZSwgb3duRGlzdGFuY2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG5vZGUucmlnaHQgPT09IG51bGwpIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5sZWZ0O1xuICAgICAgfSBlbHNlIGlmIChub2RlLmxlZnQgPT09IG51bGwpIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwb2ludFtkaW1lbnNpb25dIDwgbm9kZS5vYmpbZGltZW5zaW9uXSkge1xuICAgICAgICAgIGJlc3RDaGlsZCA9IG5vZGUubGVmdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLnJpZ2h0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5lYXJlc3RTZWFyY2goYmVzdENoaWxkKTtcblxuICAgICAgaWYgKGJlc3ROb2Rlcy5zaXplKCkgPCBtYXhOb2RlcyB8fCBvd25EaXN0YW5jZSA8IGJlc3ROb2Rlcy5wZWVrKClbMV0pIHtcbiAgICAgICAgc2F2ZU5vZGUobm9kZSwgb3duRGlzdGFuY2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGJlc3ROb2Rlcy5zaXplKCkgPCBtYXhOb2RlcyB8fFxuICAgICAgICBNYXRoLmFicyhsaW5lYXJEaXN0YW5jZSkgPCBiZXN0Tm9kZXMucGVlaygpWzFdXG4gICAgICApIHtcbiAgICAgICAgaWYgKGJlc3RDaGlsZCA9PT0gbm9kZS5sZWZ0KSB7XG4gICAgICAgICAgb3RoZXJDaGlsZCA9IG5vZGUucmlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3RoZXJDaGlsZCA9IG5vZGUubGVmdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3RoZXJDaGlsZCAhPT0gbnVsbCkge1xuICAgICAgICAgIG5lYXJlc3RTZWFyY2gob3RoZXJDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF4RGlzdGFuY2UpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtYXhOb2RlczsgaSArPSAxKSB7XG4gICAgICAgIGJlc3ROb2Rlcy5wdXNoKFtudWxsLCBtYXhEaXN0YW5jZV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJvb3QpIHtcbiAgICAgIG5lYXJlc3RTZWFyY2godGhpcy5yb290KTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgTWF0aC5taW4obWF4Tm9kZXMsIGJlc3ROb2Rlcy5jb250ZW50Lmxlbmd0aCk7IGkgKz0gMSkge1xuICAgICAgaWYgKGJlc3ROb2Rlcy5jb250ZW50W2ldWzBdKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKFtiZXN0Tm9kZXMuY29udGVudFtpXVswXS5vYmosIGJlc3ROb2Rlcy5jb250ZW50W2ldWzFdXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9KU09OSW1wbChzcmMpIHtcbiAgY29uc3QgZGVzdCA9IG5ldyBOb2RlKHNyYy5vYmosIHNyYy5kaW1lbnNpb24sIG51bGwpO1xuICBpZiAoc3JjLmxlZnQpIGRlc3QubGVmdCA9IHRvSlNPTkltcGwoc3JjLmxlZnQpO1xuICBpZiAoc3JjLnJpZ2h0KSBkZXN0LnJpZ2h0ID0gdG9KU09OSW1wbChzcmMucmlnaHQpO1xuICByZXR1cm4gZGVzdDtcbn1cblxuZnVuY3Rpb24gYnVpbGRUcmVlKHBvaW50cywgZGVwdGgsIHBhcmVudCwgZGltZW5zaW9ucykge1xuICBjb25zdCBkaW0gPSBkZXB0aCAlIGRpbWVuc2lvbnMubGVuZ3RoO1xuXG4gIGlmIChwb2ludHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHBvaW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbmV3IE5vZGUocG9pbnRzWzBdLCBkaW0sIHBhcmVudCk7XG4gIH1cblxuICBwb2ludHMuc29ydCgoYSwgYikgPT4gYVtkaW1lbnNpb25zW2RpbV1dIC0gYltkaW1lbnNpb25zW2RpbV1dKTtcblxuICBjb25zdCBtZWRpYW4gPSBNYXRoLmZsb29yKHBvaW50cy5sZW5ndGggLyAyKTtcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKHBvaW50c1ttZWRpYW5dLCBkaW0sIHBhcmVudCk7XG4gIG5vZGUubGVmdCA9IGJ1aWxkVHJlZShwb2ludHMuc2xpY2UoMCwgbWVkaWFuKSwgZGVwdGggKyAxLCBub2RlLCBkaW1lbnNpb25zKTtcbiAgbm9kZS5yaWdodCA9IGJ1aWxkVHJlZShwb2ludHMuc2xpY2UobWVkaWFuICsgMSksIGRlcHRoICsgMSwgbm9kZSwgZGltZW5zaW9ucyk7XG5cbiAgcmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVQYXJlbnQocm9vdCkge1xuICBpZiAocm9vdC5sZWZ0KSB7XG4gICAgcm9vdC5sZWZ0LnBhcmVudCA9IHJvb3Q7XG4gICAgcmVzdG9yZVBhcmVudChyb290LmxlZnQpO1xuICB9XG5cbiAgaWYgKHJvb3QucmlnaHQpIHtcbiAgICByb290LnJpZ2h0LnBhcmVudCA9IHJvb3Q7XG4gICAgcmVzdG9yZVBhcmVudChyb290LnJpZ2h0KTtcbiAgfVxufVxuXG4vLyBCaW5hcnkgaGVhcCBpbXBsZW1lbnRhdGlvbiBmcm9tOlxuLy8gaHR0cDovL2Vsb3F1ZW50amF2YXNjcmlwdC5uZXQvYXBwZW5kaXgyLmh0bWxcbmNsYXNzIEJpbmFyeUhlYXAge1xuICBjb25zdHJ1Y3RvcihzY29yZUZ1bmN0aW9uKSB7XG4gICAgdGhpcy5jb250ZW50ID0gW107XG4gICAgdGhpcy5zY29yZUZ1bmN0aW9uID0gc2NvcmVGdW5jdGlvbjtcbiAgfVxuXG4gIHB1c2goZWxlbWVudCkge1xuICAgIC8vIEFkZCB0aGUgbmV3IGVsZW1lbnQgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgdGhpcy5jb250ZW50LnB1c2goZWxlbWVudCk7XG4gICAgLy8gQWxsb3cgaXQgdG8gYnViYmxlIHVwLlxuICAgIHRoaXMuYnViYmxlVXAodGhpcy5jb250ZW50Lmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcG9wKCkge1xuICAgIC8vIFN0b3JlIHRoZSBmaXJzdCBlbGVtZW50IHNvIHdlIGNhbiByZXR1cm4gaXQgbGF0ZXIuXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuY29udGVudFswXTtcbiAgICAvLyBHZXQgdGhlIGVsZW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgdmFyIGVuZCA9IHRoaXMuY29udGVudC5wb3AoKTtcbiAgICAvLyBJZiB0aGVyZSBhcmUgYW55IGVsZW1lbnRzIGxlZnQsIHB1dCB0aGUgZW5kIGVsZW1lbnQgYXQgdGhlXG4gICAgLy8gc3RhcnQsIGFuZCBsZXQgaXQgc2luayBkb3duLlxuICAgIGlmICh0aGlzLmNvbnRlbnQubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5jb250ZW50WzBdID0gZW5kO1xuICAgICAgdGhpcy5zaW5rRG93bigwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHBlZWsoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGVudFswXTtcbiAgfVxuXG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGVudC5sZW5ndGg7XG4gIH1cblxuICBidWJibGVVcChuKSB7XG4gICAgLy8gRmV0Y2ggdGhlIGVsZW1lbnQgdGhhdCBoYXMgdG8gYmUgbW92ZWQuXG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmNvbnRlbnRbbl07XG4gICAgLy8gV2hlbiBhdCAwLCBhbiBlbGVtZW50IGNhbiBub3QgZ28gdXAgYW55IGZ1cnRoZXIuXG4gICAgd2hpbGUgKG4gPiAwKSB7XG4gICAgICAvLyBDb21wdXRlIHRoZSBwYXJlbnQgZWxlbWVudCdzIGluZGV4LCBhbmQgZmV0Y2ggaXQuXG4gICAgICBjb25zdCBwYXJlbnROID0gTWF0aC5mbG9vcigobiArIDEpIC8gMikgLSAxO1xuICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5jb250ZW50W3BhcmVudE5dO1xuICAgICAgLy8gU3dhcCB0aGUgZWxlbWVudHMgaWYgdGhlIHBhcmVudCBpcyBncmVhdGVyLlxuICAgICAgaWYgKHRoaXMuc2NvcmVGdW5jdGlvbihlbGVtZW50KSA8IHRoaXMuc2NvcmVGdW5jdGlvbihwYXJlbnQpKSB7XG4gICAgICAgIHRoaXMuY29udGVudFtwYXJlbnROXSA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuY29udGVudFtuXSA9IHBhcmVudDtcbiAgICAgICAgLy8gVXBkYXRlICduJyB0byBjb250aW51ZSBhdCB0aGUgbmV3IHBvc2l0aW9uLlxuICAgICAgICBuID0gcGFyZW50TjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvdW5kIGEgcGFyZW50IHRoYXQgaXMgbGVzcywgbm8gbmVlZCB0byBtb3ZlIGl0IGZ1cnRoZXIuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNpbmtEb3duKG4pIHtcbiAgICAvLyBMb29rIHVwIHRoZSB0YXJnZXQgZWxlbWVudCBhbmQgaXRzIHNjb3JlLlxuICAgIHZhciBsZW5ndGggPSB0aGlzLmNvbnRlbnQubGVuZ3RoO1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5jb250ZW50W25dO1xuICAgIHZhciBlbGVtU2NvcmUgPSB0aGlzLnNjb3JlRnVuY3Rpb24oZWxlbWVudCk7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgLy8gQ29tcHV0ZSB0aGUgaW5kaWNlcyBvZiB0aGUgY2hpbGQgZWxlbWVudHMuXG4gICAgICB2YXIgY2hpbGQyTiA9IChuICsgMSkgKiAyO1xuICAgICAgdmFyIGNoaWxkMU4gPSBjaGlsZDJOIC0gMTtcbiAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBzdG9yZSB0aGUgbmV3IHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LFxuICAgICAgLy8gaWYgYW55LlxuICAgICAgdmFyIHN3YXAgPSBudWxsO1xuICAgICAgLy8gSWYgdGhlIGZpcnN0IGNoaWxkIGV4aXN0cyAoaXMgaW5zaWRlIHRoZSBhcnJheSkuLi5cbiAgICAgIGlmIChjaGlsZDFOIDwgbGVuZ3RoKSB7XG4gICAgICAgIC8vIExvb2sgaXQgdXAgYW5kIGNvbXB1dGUgaXRzIHNjb3JlLlxuICAgICAgICB2YXIgY2hpbGQxID0gdGhpcy5jb250ZW50W2NoaWxkMU5dO1xuICAgICAgICB2YXIgY2hpbGQxU2NvcmUgPSB0aGlzLnNjb3JlRnVuY3Rpb24oY2hpbGQxKTtcbiAgICAgICAgLy8gSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXG4gICAgICAgIGlmIChjaGlsZDFTY29yZSA8IGVsZW1TY29yZSkge1xuICAgICAgICAgIHN3YXAgPSBjaGlsZDFOO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBEbyB0aGUgc2FtZSBjaGVja3MgZm9yIHRoZSBvdGhlciBjaGlsZC5cbiAgICAgIGlmIChjaGlsZDJOIDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBjaGlsZDIgPSB0aGlzLmNvbnRlbnRbY2hpbGQyTl07XG4gICAgICAgIHZhciBjaGlsZDJTY29yZSA9IHRoaXMuc2NvcmVGdW5jdGlvbihjaGlsZDIpO1xuICAgICAgICBpZiAoY2hpbGQyU2NvcmUgPCAoc3dhcCA9PT0gbnVsbCA/IGVsZW1TY29yZSA6IGNoaWxkMVNjb3JlKSkge1xuICAgICAgICAgIHN3YXAgPSBjaGlsZDJOO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBlbGVtZW50IG5lZWRzIHRvIGJlIG1vdmVkLCBzd2FwIGl0LCBhbmQgY29udGludWUuXG4gICAgICBpZiAoc3dhcCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRbbl0gPSB0aGlzLmNvbnRlbnRbc3dhcF07XG4gICAgICAgIHRoaXMuY29udGVudFtzd2FwXSA9IGVsZW1lbnQ7XG4gICAgICAgIG4gPSBzd2FwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBhcmUgZG9uZS5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBldWNsaWRlYW4gYXMgZXVjbGlkZWFuRGlzdGFuY2UgfSBmcm9tICdtbC1kaXN0YW5jZS1ldWNsaWRlYW4nO1xuXG5pbXBvcnQgS0RUcmVlIGZyb20gJy4vS0RUcmVlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS05OIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFzZXRcbiAgICogQHBhcmFtIHtBcnJheX0gbGFiZWxzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5rPW51bWJlck9mQ2xhc3NlcyArIDFdIC0gTnVtYmVyIG9mIG5laWdoYm9ycyB0byBjbGFzc2lmeS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gW29wdGlvbnMuZGlzdGFuY2U9ZXVjbGlkZWFuRGlzdGFuY2VdIC0gRGlzdGFuY2UgZnVuY3Rpb24gdGhhdCB0YWtlcyB0d28gcGFyYW1ldGVycy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRhdGFzZXQsIGxhYmVscywgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKGRhdGFzZXQgPT09IHRydWUpIHtcbiAgICAgIGNvbnN0IG1vZGVsID0gbGFiZWxzO1xuICAgICAgdGhpcy5rZFRyZWUgPSBuZXcgS0RUcmVlKG1vZGVsLmtkVHJlZSwgb3B0aW9ucyk7XG4gICAgICB0aGlzLmsgPSBtb2RlbC5rO1xuICAgICAgdGhpcy5jbGFzc2VzID0gbmV3IFNldChtb2RlbC5jbGFzc2VzKTtcbiAgICAgIHRoaXMuaXNFdWNsaWRlYW4gPSBtb2RlbC5pc0V1Y2xpZGVhbjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc2VzID0gbmV3IFNldChsYWJlbHMpO1xuXG4gICAgY29uc3QgeyBkaXN0YW5jZSA9IGV1Y2xpZGVhbkRpc3RhbmNlLCBrID0gY2xhc3Nlcy5zaXplICsgMSB9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0IHBvaW50cyA9IG5ldyBBcnJheShkYXRhc2V0Lmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHBvaW50c1tpXSA9IGRhdGFzZXRbaV0uc2xpY2UoKTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgICBwb2ludHNbaV0ucHVzaChsYWJlbHNbaV0pO1xuICAgIH1cblxuICAgIHRoaXMua2RUcmVlID0gbmV3IEtEVHJlZShwb2ludHMsIGRpc3RhbmNlKTtcbiAgICB0aGlzLmsgPSBrO1xuICAgIHRoaXMuY2xhc3NlcyA9IGNsYXNzZXM7XG4gICAgdGhpcy5pc0V1Y2xpZGVhbiA9IGRpc3RhbmNlID09PSBldWNsaWRlYW5EaXN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgS05OIGluc3RhbmNlIHdpdGggdGhlIGdpdmVuIG1vZGVsLlxuICAgKiBAcGFyYW0ge29iamVjdH0gbW9kZWxcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZGlzdGFuY2U9ZXVjbGlkZWFuRGlzdGFuY2UgLSBkaXN0YW5jZSBmdW5jdGlvbiBtdXN0IGJlIHByb3ZpZGVkIGlmIHRoZSBtb2RlbCB3YXNuJ3QgdHJhaW5lZCB3aXRoIGV1Y2xpZGVhbiBkaXN0YW5jZS5cbiAgICogQHJldHVybiB7S05OfVxuICAgKi9cbiAgc3RhdGljIGxvYWQobW9kZWwsIGRpc3RhbmNlID0gZXVjbGlkZWFuRGlzdGFuY2UpIHtcbiAgICBpZiAobW9kZWwubmFtZSAhPT0gJ0tOTicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBtb2RlbDogJHttb2RlbC5uYW1lfWApO1xuICAgIH1cbiAgICBpZiAoIW1vZGVsLmlzRXVjbGlkZWFuICYmIGRpc3RhbmNlID09PSBldWNsaWRlYW5EaXN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnYSBjdXN0b20gZGlzdGFuY2UgZnVuY3Rpb24gd2FzIHVzZWQgdG8gY3JlYXRlIHRoZSBtb2RlbC4gUGxlYXNlIHByb3ZpZGUgaXQgYWdhaW4nXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAobW9kZWwuaXNFdWNsaWRlYW4gJiYgZGlzdGFuY2UgIT09IGV1Y2xpZGVhbkRpc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICd0aGUgbW9kZWwgd2FzIGNyZWF0ZWQgd2l0aCB0aGUgZGVmYXVsdCBkaXN0YW5jZSBmdW5jdGlvbi4gRG8gbm90IGxvYWQgaXQgd2l0aCBhbm90aGVyIG9uZSdcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgS05OKHRydWUsIG1vZGVsLCBkaXN0YW5jZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiBjb250YWluaW5nIHRoZSBrZC10cmVlIG1vZGVsLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEpTT04gS05OIG1vZGVsLlxuICAgKi9cbiAgdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnS05OJyxcbiAgICAgIGtkVHJlZTogdGhpcy5rZFRyZWUsXG4gICAgICBrOiB0aGlzLmssXG4gICAgICBjbGFzc2VzOiBBcnJheS5mcm9tKHRoaXMuY2xhc3NlcyksXG4gICAgICBpc0V1Y2xpZGVhbjogdGhpcy5pc0V1Y2xpZGVhblxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUHJlZGljdHMgdGhlIG91dHB1dCBnaXZlbiB0aGUgbWF0cml4IHRvIHByZWRpY3QuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFzZXRcbiAgICogQHJldHVybiB7QXJyYXl9IHByZWRpY3Rpb25zXG4gICAqL1xuICBwcmVkaWN0KGRhdGFzZXQpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhc2V0KSkge1xuICAgICAgaWYgKHR5cGVvZiBkYXRhc2V0WzBdID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gZ2V0U2luZ2xlUHJlZGljdGlvbih0aGlzLCBkYXRhc2V0KTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIEFycmF5LmlzQXJyYXkoZGF0YXNldFswXSkgJiZcbiAgICAgICAgdHlwZW9mIGRhdGFzZXRbMF1bMF0gPT09ICdudW1iZXInXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgcHJlZGljdGlvbnMgPSBuZXcgQXJyYXkoZGF0YXNldC5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFzZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBwcmVkaWN0aW9uc1tpXSA9IGdldFNpbmdsZVByZWRpY3Rpb24odGhpcywgZGF0YXNldFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByZWRpY3Rpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdkYXRhc2V0IHRvIHByZWRpY3QgbXVzdCBiZSBhbiBhcnJheSBvciBhIG1hdHJpeCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNpbmdsZVByZWRpY3Rpb24oa25uLCBjdXJyZW50Q2FzZSkge1xuICB2YXIgbmVhcmVzdFBvaW50cyA9IGtubi5rZFRyZWUubmVhcmVzdChjdXJyZW50Q2FzZSwga25uLmspO1xuICB2YXIgcG9pbnRzUGVyQ2xhc3MgPSB7fTtcbiAgdmFyIHByZWRpY3RlZENsYXNzID0gLTE7XG4gIHZhciBtYXhQb2ludHMgPSAtMTtcbiAgdmFyIGxhc3RFbGVtZW50ID0gbmVhcmVzdFBvaW50c1swXVswXS5sZW5ndGggLSAxO1xuXG4gIGZvciAodmFyIGVsZW1lbnQgb2Yga25uLmNsYXNzZXMpIHtcbiAgICBwb2ludHNQZXJDbGFzc1tlbGVtZW50XSA9IDA7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5lYXJlc3RQb2ludHMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY3VycmVudENsYXNzID0gbmVhcmVzdFBvaW50c1tpXVswXVtsYXN0RWxlbWVudF07XG4gICAgdmFyIGN1cnJlbnRQb2ludHMgPSArK3BvaW50c1BlckNsYXNzW2N1cnJlbnRDbGFzc107XG4gICAgaWYgKGN1cnJlbnRQb2ludHMgPiBtYXhQb2ludHMpIHtcbiAgICAgIHByZWRpY3RlZENsYXNzID0gY3VycmVudENsYXNzO1xuICAgICAgbWF4UG9pbnRzID0gY3VycmVudFBvaW50cztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJlZGljdGVkQ2xhc3M7XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBrbm4gZnJvbSBcIm1sLWtublwiO1xuLy8gVGhpcyBzaG93cyB0aGUgSFRNTCBwYWdlIGluIFwidWkuaHRtbFwiLlxuZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmNvbnN0IFVJV2lkdGggPSAzNTA7XG4vLyBDYWxscyB0byBcInBhcmVudC5wb3N0TWVzc2FnZVwiIGZyb20gd2l0aGluIHRoZSBIVE1MIHBhZ2Ugd2lsbCB0cmlnZ2VyIHRoaXNcbi8vIGNhbGxiYWNrLiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBwYXNzZWQgdGhlIFwicGx1Z2luTWVzc2FnZVwiIHByb3BlcnR5IG9mIHRoZVxuLy8gcG9zdGVkIG1lc3NhZ2UuXG5jb25zdCByZXNpemUgPSAoc2l6ZSkgPT4ge1xuICAgIHJldHVybiBmaWdtYS51aS5yZXNpemUoVUlXaWR0aCwgc2l6ZSArIDIpO1xufTtcbmxldCBzdHJpbmdUb09iaiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgbGV0IHByb3BlcnRpZXMgPSBvLnJlcGxhY2UoJywgJywgJywnKS5zcGxpdCgnLCcpO1xuICAgIGxldCBvYmogPSB7fTtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgIHZhciB0dXAgPSBwcm9wZXJ0eS5zcGxpdCgnOicpO1xuICAgICAgICBvYmpbdHVwWzBdLnRyaW0oKV0gPSB0dXBbMV0udHJpbSgpLnJlcGxhY2UoJ1xcXCInLCAnJykucmVwbGFjZSgnXCInLCAnJyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbn07XG5maWdtYS51aS5vbm1lc3NhZ2UgPSBtc2cgPT4ge1xuICAgIGlmIChtc2cudHlwZSA9PSBcImluaXRcIikge1xuICAgICAgICBpZiAobXNnLnNpemUpXG4gICAgICAgICAgICByZXNpemUobXNnLnNpemUpO1xuICAgICAgICBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKFwibGF5ZXJOYW1lc1wiKS50aGVuKChzYXZlZE5hbWVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGF5ZXJOYW1lcyA9IHNhdmVkTmFtZXMgfHwge1xuICAgICAgICAgICAgICAgIHJvd0lkZW50aWZpZXI6IFwiSW5zdGFuY2VcIixcbiAgICAgICAgICAgICAgICBjb2x1bW5JZGVudGlmaWVyOiBcIkNvbHVtblwiLFxuICAgICAgICAgICAgICAgIGhlYWRlclRleHRMYXllcjogXCJUZXh0XCIsXG4gICAgICAgICAgICAgICAgdmFsdWVUZXh0TGF5ZXI6IFwiVGV4dFwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImluaXRcIixcbiAgICAgICAgICAgICAgICBcImxheWVyTmFtZXNcIjogbGF5ZXJOYW1lc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09IFwicmVzaXplXCIgJiYgbXNnLnNpemUpIHtcbiAgICAgICAgcmV0dXJuIHJlc2l6ZShtc2cuc2l6ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09IFwic2F2ZUxheWVyTmFtZXNcIikge1xuICAgICAgICBsZXQgbGF5ZXJOYW1lcyA9IG1zZy5sYXllck5hbWVzO1xuICAgICAgICBmaWdtYS5jbGllbnRTdG9yYWdlLnNldEFzeW5jKFwibGF5ZXJOYW1lc1wiLCBsYXllck5hbWVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChtc2cudHlwZSA9PSAnZG93bmxvYWQnKSB7XG4gICAgICAgIGxldCBsYXllck5hbWVzID0gbXNnLmxheWVyTmFtZXM7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoXCJsYXllck5hbWVzXCIsIGxheWVyTmFtZXMpO1xuICAgICAgICBsZXQgcm93SWRlbnRpZmllciA9IGxheWVyTmFtZXMucm93SWRlbnRpZmllcjtcbiAgICAgICAgbGV0IGNvbHVtbklkZW50aWZpZXIgPSBsYXllck5hbWVzLmNvbHVtbklkZW50aWZpZXI7XG4gICAgICAgIGxldCBoZWFkZXJUZXh0TGF5ZXIgPSBsYXllck5hbWVzLmhlYWRlclRleHRMYXllcjtcbiAgICAgICAgbGV0IHZhbHVlVGV4dExheWVyID0gbGF5ZXJOYW1lcy52YWx1ZVRleHRMYXllcjtcbiAgICAgICAgbGV0IHN0clZhclJlZ2V4ID0gLyg/PD1cXHspKC4qPykoPz1cXH0pL2c7XG4gICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgIC8vIHRyeSB0byBmaW5kIHJvd3MgZnJvbSBzZWxlY3Rpb24gZm9yIHBlcmZvcm1hbmNlIHB1cnBvc2VzXG4gICAgICAgIGlmIChmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24ubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNlbCBvZiBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbmFtZSBvZiB0aGUgc2VsZWN0ZWQgaXRlbSBpcyB0aGUgc2FtZSBhcyB0aGUgcm93aWRlbnRpZmllcixcbiAgICAgICAgICAgICAgICAvLyBhZGQgaXQgdG8gdGhlIHJvd3MgbGlzdFxuICAgICAgICAgICAgICAgIGlmIChzZWwubmFtZSA9PT0gcm93SWRlbnRpZmllcilcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHNlbCk7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHNlbGVjdGlvbiBoYXMgY2hpbGRyZW4gKGZpbmRBbGwgaXMgbm90IHVuZGVmaW5lZCksIGdhdGhlciBsYXllcnMgaWRlbnRpZmlhYmxlIGFzIHJvd3NcbiAgICAgICAgICAgICAgICBpZiAoc2VsLmZpbmRBbGwgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICByb3dzID0gcm93cy5jb25jYXQoc2VsLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IHJvd0lkZW50aWZpZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlcyBubyBzZWxlY3Rpb24sIGZhbGwgYmFjayB0byBmZXRjaGluZyByb3dzIGZyb20gdGhlIHBhZ2UgKHNsb3dlcilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvd3MgPSByb3dzLmNvbmNhdChmaWdtYS5jdXJyZW50UGFnZS5maW5kQWxsKG5vZGUgPT4gbm9kZS5uYW1lID09PSByb3dJZGVudGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdldENvbHVtbkZyb21Ob2RlID0gKGZyb21Ob2RlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNvbHVtbkl0ZW0gPSB7fTtcbiAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyID0gZnJvbU5vZGUuZmluZE9uZShub2RlID0+IG5vZGUubmFtZSA9PSBoZWFkZXJUZXh0TGF5ZXIpO1xuICAgICAgICAgICAgLy8gZ2V0IHRoZSBsYXllciB3aXRoIHRoZSBzYW1lIHNhbWUgYXMgaGVhZGVyVGV4dExheWVyIGFuZCB1c2UgaXRzIHZhbHVlIGFzIHRoZSBoZWFkZXJcbiAgICAgICAgICAgIGlmIChjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcilcbiAgICAgICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtbkhlYWRlciA9IGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgZGVmYXVsdHMgdG8gdGhlIGNvbHVtbkhlYWRlciBvciBhIGRlZmF1bHQgb25lXG4gICAgICAgICAgICAvLyBpdHMgaW1wb3J0YW50IHRoYXQgZWFjaCBjb2x1bW4gaGF2ZSBhIGRpZmZlcmVudCBoZWFkZXIsIHNvIHRoYXQgdGhlIGxpc3QgaXMgY29ycmVjdGx5IHJlbmRlcmVkXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIgPSBoZWFkZXJUZXh0TGF5ZXIgPyBgJHtoZWFkZXJUZXh0TGF5ZXJ9ICR7aW5kZXggKyAxfWAgOiBgQ29sdW1uICR7aW5kZXggKyAxfWA7XG4gICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtblZhbHVlID0gZnJvbU5vZGUuZmluZE9uZShub2RlID0+IG5vZGUubmFtZSA9PSB2YWx1ZVRleHRMYXllcik7XG4gICAgICAgICAgICBpZiAoY29sdW1uSXRlbS5jb2x1bW5WYWx1ZSlcbiAgICAgICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtblZhbHVlID0gY29sdW1uSXRlbS5jb2x1bW5WYWx1ZS5jaGFyYWN0ZXJzO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIChjb2x1bW5JdGVtLmNvbHVtblZhbHVlKSA/IGNvbHVtbkl0ZW0gOiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICAvLyBLTk4gKEstTmVhcmVzdCBOZWlnaGJvdXJzIGNsYXNzaWZpY2F0aW9uIGFsZ29yaXRobSlcbiAgICAgICAgbGV0IGtubk1vZGVscyA9IHt9O1xuICAgICAgICAvLyBjcmVhdGUgYSBLTk4gbW9kZWwgZm9yIGVhY2ggdmFyaWFibGUgbWF0Y2hpbmcgcHJlZGljdDpcbiAgICAgICAgaWYgKGxheWVyTmFtZXMuY3VzdG9tQ29sdW1ucyAmJiBsYXllck5hbWVzLmN1c3RvbUNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQga25uRXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgbGF5ZXJOYW1lcy5jdXN0b21Db2x1bW5zLmZvckVhY2goKGN1c3RvbUNvbHVtbiwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIGFyZSBpbiBhIGxvb3AsIHdlIHdpbGwgZ2VuZXJhdGUgYSBuZXcgbW9kZWwgZm9yIGVhY2ggbmV3ICR7cHJlZGljdDp9IGZpZWxkLFxuICAgICAgICAgICAgICAgIC8vIHZhbHVlIGhhcyAke30gc3ludGF4XG4gICAgICAgICAgICAgICAgKGN1c3RvbUNvbHVtbi52YWx1ZS5tYXRjaChzdHJWYXJSZWdleCkgfHwgW10pLmZvckVhY2goKHYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlcyBhbnkgY3VzdG9tIGNvbHVtbiB3aXRoIHRoZSBwcmVkaWN0IG5hbWluZyBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgc28sIHdlIGhhdmUgdG8gdHJhaW4gdGhlIG1vZGVsIGJlZm9yZSB0aGUgbm9kZSBsb29wIHN0YXJ0cywgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAke30gaGFzIHByZWRpY3Q6IHN5bnRheCwgdHJhaW4gbW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIGlmICh2Lm1hdGNoKC9wcmVkaWN0XFw6L2dpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0cyBhbmQgb2JqZWN0IGZyb20gdGhlIHByZWRpY3QgY29tbWFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ3ByZWRpY3Q6IFwiY29tcG9uZW50IG5hbWVcIiwgY2F0ZWdvcnk6IFwibGF5ZXIgbmFtZVwiJyA9PiB7IHByZWRpY3Q6IFwiY29tcG9uZW50IG5hbWVcIiwgY2F0ZWdvcnk6IFwibGF5ZXIgbmFtZVwiIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVkaWN0T2JqID0gc3RyaW5nVG9PYmoodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXRzIHRoZSBwcmVkaWN0aW9uIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVkaWN0RWxlbWVudCA9IHByZWRpY3RPYmoucHJlZGljdCB8fCBcIlwiLCBwcmVkaWN0RWxlbWVudENhdGVnb3J5ID0gcHJlZGljdE9iai5jYXRlZ29yeSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmVzIGEgY29ycmVjdCBwcmVkaWN0aW9uIG9iamVjdCwgdHJhaW4gdGhlIG1vZGVsIHVzaW5nIG1sanMnIGtubiBtb2R1bGU6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWxqcy9rbm5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgdGhlIHVzZXIgY291bGQgdXNlIG11bHRpcGxlIHByZWRpY3Rpb24gZmllbGRzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJlZGljdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJhaW5fZGF0YXNldCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0cmFpbl9sYWJlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJhaW5FbGVtZW50cyA9IGZpZ21hLmN1cnJlbnRQYWdlLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT0gcHJlZGljdEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWluRWxlbWVudHMuZm9yRWFjaCh0cmFpbkVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudENhdGVnb3J5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXByZWRpY3RFbGVtZW50Q2F0ZWdvcnkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Q2F0ZWdvcnkgPSB0cmFpbkVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRDYXRlZ29yeSA9IHRyYWluRWxlbWVudC5maW5kT25lKG5vZGUgPT4gbm9kZS5uYW1lID09IHByZWRpY3RFbGVtZW50Q2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGVzIGEgZ3JpZCBvZiA5IHBvaW50cyBhcm91bmQgdGhlIGVsZW1lbnRzIGJveCBtb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmVlZCB0aGVzZSBncmlkIHBvaW50cyB0byBrbm4gbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjb3JuZXIgb2YgQXJyYXkuZnJvbSh7IGxlbmd0aDogOSB9LCAodiwgaykgPT4gayArIDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW50cnlYWSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjb3JuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6IC8vIHRvcCBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WFkgPSBbdHJhaW5FbGVtZW50LngsIHRyYWluRWxlbWVudC55XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOiAvLyB0b3AgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WFkgPSBbdHJhaW5FbGVtZW50LnggKyAodHJhaW5FbGVtZW50LndpZHRoIC8gMiksIHRyYWluRWxlbWVudC55XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiAvLyB0b3AgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlYWSA9IFt0cmFpbkVsZW1lbnQueCArIHRyYWluRWxlbWVudC53aWR0aCwgdHJhaW5FbGVtZW50LnldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6IC8vIG1pZGRsZSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WFkgPSBbdHJhaW5FbGVtZW50LngsIHRyYWluRWxlbWVudC55ICsgKHRyYWluRWxlbWVudC5oZWlnaHQgLyAyKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNTogLy8gbWlkZGxlIGNlbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVhZID0gW3RyYWluRWxlbWVudC54ICsgKHRyYWluRWxlbWVudC53aWR0aCAvIDIpLCB0cmFpbkVsZW1lbnQueSArICh0cmFpbkVsZW1lbnQuaGVpZ2h0IC8gMildO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6IC8vIG1pZGRsZSByaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVhZID0gW3RyYWluRWxlbWVudC54ICsgdHJhaW5FbGVtZW50LndpZHRoLCB0cmFpbkVsZW1lbnQueSArICh0cmFpbkVsZW1lbnQuaGVpZ2h0IC8gMildO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc6IC8vIGJvdHRvbSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WFkgPSBbdHJhaW5FbGVtZW50LngsIHRyYWluRWxlbWVudC55ICsgdHJhaW5FbGVtZW50LmhlaWdodF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODogLy8gYm90dG9tIG1pZGRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVhZID0gW3RyYWluRWxlbWVudC54ICsgKHRyYWluRWxlbWVudC53aWR0aCAvIDIpLCB0cmFpbkVsZW1lbnQueSArIHRyYWluRWxlbWVudC5oZWlnaHRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk6IC8vIGJvdHRvbSByaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVhZID0gW3RyYWluRWxlbWVudC54ICsgdHJhaW5FbGVtZW50LndpZHRoLCB0cmFpbkVsZW1lbnQueSArIHRyYWluRWxlbWVudC5oZWlnaHRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhaW5fZGF0YXNldC5wdXNoKGVudHJ5WFkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhaW5fbGFiZWxzLnB1c2goZWxlbWVudENhdGVnb3J5ID8gZWxlbWVudENhdGVnb3J5LmNoYXJhY3RlcnMgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZXMgYSBtb2RlbCBmb3IgZWFjaCBwcmVkaWN0aW9uRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtubk1vZGVsc1twcmVkaWN0RWxlbWVudF0gPSBuZXcga25uKHRyYWluX2RhdGFzZXQsIHRyYWluX2xhYmVscywgeyBrOiAxIH0pOyAvLyBjb25zaWRlciBvbmx5IHRoZSBjbG9zZXN0IG5laWdoYm91ciAoMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFpbl9kYXRhc2V0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhaW5fbGFiZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codHJhaW5fZGF0YXNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codHJhaW5fbGFiZWxzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhtb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga25uRXJyb3IgPSBcIllvdXIgcHJlZGljdCBmaWVsZCBpcyBtaXNzaW5nIGEgbmFtZS4gQ2hlY2sgaWYgeW91J3ZlIGZvcm1hdHRlZCBpdCBjb3JyZWN0bHkuXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGtubkVycm9yKVxuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShrbm5FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGl0ZW1zID0gW107XG4gICAgICAgIGxldCBrZXlzID0gW107XG4gICAgICAgIC8vIGdlbmVyYXRlIGxpc3Qgb2YgZXhwb3J0YWJsZSBpdGVtcyBmcm9tIHNlbGVjdGVkIHJvd3NcbiAgICAgICAgZm9yIChjb25zdCBbbm9kZUluZGV4LCBub2RlXSBvZiByb3dzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgbGV0IGhlYWRlcnMgPSBbXTtcbiAgICAgICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtID0ge307XG4gICAgICAgICAgICAvLyBnZXQgbGF5ZXJzIHRoYXQgd291bGQgcmVwcmVzZW50IHRoZSByb3cgY29sdW1uc1xuICAgICAgICAgICAgbGV0IGNvbHVtbnMgPSBub2RlLmZpbmRBbGwoKG5vZGUpID0+IG5vZGUubmFtZSA9PT0gY29sdW1uSWRlbnRpZmllcik7XG4gICAgICAgICAgICBpZiAoY29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zLmZvckVhY2goKGNvbHVtbiwgY29sdW1uSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5zaWRlIHRoZXNlIGNvbHVtbiBsYXllcnMsIGZpbmRzIGEgbGF5ZXIgdG8gYmUgdGhlIGhlYWRlciBvZiB0aGUgY29sdW1uIGFuZCBhbm90aGVyIHRvIGJlIGl0cyB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAvLyBlYWNoIGl0ZW0gbXVzdCBoYXZlIGEgaGVhZGVyIHByb3BlcnR5IGZvciB0aGUgZXhwb3J0IHdpdGggcGFwYSBwYXJzZSB0byB3b3JrXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW5JdGVtID0gZ2V0Q29sdW1uRnJvbU5vZGUoY29sdW1uLCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2x1bW5JdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtW2NvbHVtbkl0ZW0uY29sdW1uSGVhZGVyXSA9IGNvbHVtbkl0ZW0uY29sdW1uVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWtleXMuaW5jbHVkZXMoY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgYXNzdW1lIHRoZXJlIGlzIG9ubHkgb25lIGNvbHVtbiBhbmQgc2VhcmNoIHRoZSB2YWx1ZSBkaXJlY3RseSBmcm9tIHRoZSByb3cgbm9kZVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbkl0ZW0gPSBnZXRDb2x1bW5Gcm9tTm9kZShub2RlLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoY29sdW1uSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtW2NvbHVtbkl0ZW0uY29sdW1uSGVhZGVyXSA9IGNvbHVtbkl0ZW0uY29sdW1uVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICgha2V5cy5pbmNsdWRlcyhjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcikpXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBub2RlVGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgY3VzdG9tIGNvbHVtbnMsIHJlbmRlciB0aGVtIGFuZCBhcHBlbmQgdG8gaXRlbSBvYmplY3RcbiAgICAgICAgICAgIGlmIChsYXllck5hbWVzLmN1c3RvbUNvbHVtbnMgJiYgbGF5ZXJOYW1lcy5jdXN0b21Db2x1bW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxheWVyTmFtZXMuY3VzdG9tQ29sdW1ucy5mb3JFYWNoKChjdXN0b21Db2x1bW4sIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1c3RvbUNvbHVtblZhbHVlID0gY3VzdG9tQ29sdW1uLnZhbHVlLCBjdXN0b21Db2x1bW5OYW1lID0gY3VzdG9tQ29sdW1uLmhlYWRlciB8fCBgY3VzdG9tQ29sdW1uJHtpICsgMX1gO1xuICAgICAgICAgICAgICAgICAgICAvLyB2YWx1ZSBoYXMgJHt9IHN5bnRheFxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tQ29sdW1uVmFsdWUubWF0Y2goc3RyVmFyUmVnZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggZWFjaCAke31cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YXJzID0gY3VzdG9tQ29sdW1uVmFsdWUubWF0Y2goc3RyVmFyUmVnZXgpLm1hcCgodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICR7fSBoYXMgbm9kZS0qKiogc3ludGF4LCB1c2UgdGhlIHN1ZmZpeCB0byB1c2UgYSBwcm9wZXJ0eSBmcm9tIG5vZGUgb2JqZWN0LCBsaWtlIGlkLCBuYW1lLCB4LCB5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYubWF0Y2goLyg/PD1ub2RlXFwtKSguKikvZ2kpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVt2Lm1hdGNoKC8oPzw9bm9kZVxcLSkoLiopL2dpKVswXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgJHtpbmRleH0sIGluamVjdCBub2RlIGluZGV4ICsgMSAocm93IGxpbmUgY291bnRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh2ID09IFwiaW5kZXhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodi5tYXRjaCgvdXJsL2kpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlVVJJKGBodHRwczovL3d3dy5maWdtYS5jb20vZmlsZS8ke2ZpZ21hLmZpbGVLZXl9LyR7ZmlnbWEucm9vdC5uYW1lfT9ub2RlLWlkPSR7bm9kZS5pZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh2Lm1hdGNoKC8oPzw9cHJlZGljdFxcOikoLiopL2dpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXRzIGFuZCBvYmplY3QgZnJvbSB0aGUgcHJlZGljdCBjb21tYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICdwcmVkaWN0OiBcImNvbXBvbmVudCBuYW1lXCIsIGNhdGVnb3J5OiBcImxheWVyIG5hbWVcIicgPT4geyBwcmVkaWN0OiBcImNvbXBvbmVudCBuYW1lXCIsIGNhdGVnb3J5OiBcImxheWVyIG5hbWVcIiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVkaWN0T2JqID0gc3RyaW5nVG9PYmoodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdldHMgdGhlIHByZWRpY3Rpb24gbmFtZSB0byBhY2VzcyB0aGUgdHJhaW5lZCBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJlZGljdEVsZW1lbnQgPSBwcmVkaWN0T2JqLnByZWRpY3QgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZWRpY3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIHRyYWluZWQgbW9kZWwgdG8gcHJlZGljdCB0aGlzIG5vZGUgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmVkaWN0RW50cnkgPSBbbm9kZS54ICsgKG5vZGUud2lkdGggLyAyKSwgbm9kZS55ICsgKG5vZGUuaGVpZ2h0IC8gMildOyAvLyBjZW50ZXIgb2Ygbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtubk1vZGVsc1twcmVkaWN0RWxlbWVudF0ucHJlZGljdChwcmVkaWN0RW50cnkpIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGVuYWJsZSBtYXRoIG9wZXJhdGlvbnMgb3Igc29tZXRoaW5nIGxpa2UgdGhhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnkgdG8gZ2V0IGxheWVyIG5hbWUgZnJvbSB0aGUgdmFyaWFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxheWVyID0gbm9kZS5maW5kT25lKChuKSA9PiBuLm5hbWUgPT09IHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZXMgb25lIGxheWVyIGZvdW5kLCBjaGVjayBpZiBpdCBoYXMgY2hhcmFjdGVycy4gaWYgc28sIHVzZSBpdC4gaWYgbm90LCBqdXN0IHJldHVybiB0aGUgdmFyaWFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxheWVyICYmIGxheWVyLmNoYXJhY3RlcnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXIuY2hhcmFjdGVycztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdmFsdWUgZmllbGQgaGFzIG11bHRpcGxlICR7fSwgcmVwbGFjZSBlYWNoIG9uZSB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHZhcnNbaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVwbGFjZVZhbHVlID0gY3VzdG9tQ29sdW1uVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21Db2x1bW5WYWx1ZS5tYXRjaCgvXFwkKHspKC4qPykoXFx9KS9nKS5mb3JFYWNoKChzdHJWYXIsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVZhbHVlID0gcmVwbGFjZVZhbHVlLnJlcGxhY2Uoc3RyVmFyLCB2YXJzW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNvbHVtblZhbHVlID0gcmVwbGFjZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1bY3VzdG9tQ29sdW1uTmFtZV0gPSBjdXN0b21Db2x1bW5WYWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkZCB0byBsaXN0IG9ubHkgaWYgaXRzIG5vdCBlbXB0eVxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGl0ZW0pLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgaXRlbXMgaGF2ZSBhbGwga2V5cyAoZXZlbiBpZiBlbXB0eSlcbiAgICAgICAgLy8gc28gdGhhdCBwYXBhIHBhcnNlIGNhbiBleHBvcnQgYWxsIGNvbHVtbnNcbiAgICAgICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXRlbVtrZXldKVxuICAgICAgICAgICAgICAgICAgICBpdGVtW2tleV0gPSBcIlwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIk5vIHJvd3MgZm91bmQuIFRyeSBkb3VibGUgY2hlY2tpbmcgeW91ciBpZGVudGlmaWVycyBhbmQgbGF5ZXIgbmFtZXMuXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBhc3NlcyB0aGUgb2JqZWN0IGFycmF5IGJhY2sgdG8gdGhlIFVJIHRvIGJlIHBhcnNlZCB3aXRoIHBhcGEgcGFyc2UgYW5kIGRvd25sb2FkZWRcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZG93bmxvYWRcIixcbiAgICAgICAgICAgIFwiaXRlbXNcIjogaXRlbXNcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gTWFrZSBzdXJlIHRvIGNsb3NlIHRoZSBwbHVnaW4gd2hlbiB5b3UncmUgZG9uZS4gT3RoZXJ3aXNlIHRoZSBwbHVnaW4gd2lsbFxuICAgIC8vIGtlZXAgcnVubmluZywgd2hpY2ggc2hvd3MgdGhlIGNhbmNlbCBidXR0b24gYXQgdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuLlxuICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG59O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==