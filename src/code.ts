import knn from "ml-knn";


// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const UIWidth = 350;

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

const resize = (size) => {
  return figma.ui.resize(UIWidth, size + 2);
}

let stringToObj = function(o){
  let properties = o.replace(', ', ',').split(',');
  let obj = {};
  properties.forEach(function(property) {
      var tup = property.split(':');
      obj[tup[0].trim()] = tup[1].trim().replace('\"', '').replace('"', '');
  });
  return obj;
}

figma.ui.onmessage = msg => {
  if(msg.type == "init"){
    if(msg.size) resize(msg.size);
    figma.clientStorage.getAsync("layerNames").then((savedNames)=>{
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
  else if(msg.type == "resize" && msg.size) {
    return resize(msg.size);
  }
  else if(msg.type == "saveLayerNames"){
    let layerNames = msg.layerNames;
    figma.clientStorage.setAsync("layerNames", layerNames);
    return;
  }

  else if(msg.type == 'download'){

    let layerNames = msg.layerNames;
    figma.clientStorage.setAsync("layerNames", layerNames);

    let rowIdentifier = layerNames.rowIdentifier;
    let columnIdentifier = layerNames.columnIdentifier;
    let headerTextLayer = layerNames.headerTextLayer;
    let valueTextLayer = layerNames.valueTextLayer;

    let strVarRegex = /(?<=\{)(.*?)(?=\})/g;

    let rows = [];
    // try to find rows from selection for performance purposes
    if(figma.currentPage.selection.length){
      for (const sel of figma.currentPage.selection){
        // if the name of the selected item is the same as the rowidentifier,
        // add it to the rows list
        if(sel.name === rowIdentifier) rows.push(sel);
        // if the selection has children (findAll is not undefined), gather layers identifiable as rows
        if(sel.findAll != undefined) rows = rows.concat(sel.findAll(node => node.name === rowIdentifier));
      }
    // if theres no selection, fall back to fetching rows from the page (slower)
    } else {
      rows = rows.concat(figma.currentPage.findAll(node => node.name === rowIdentifier));
    }

    let getColumnFromNode = (fromNode, index) => {
      let columnItem = {};
      columnItem.columnHeader = fromNode.findOne(node => node.name == headerTextLayer);
      // get the layer with the same same as headerTextLayer and use its value as the header
      if(columnItem.columnHeader) columnItem.columnHeader = columnItem.columnHeader.characters;
      // otherwise defaults to the columnHeader or a default one
      // its important that each column have a different header, so that the list is correctly rendered
      else columnItem.columnHeader = headerTextLayer ? `${headerTextLayer} ${index + 1}` : `Column ${index + 1}`;

      columnItem.columnValue = fromNode.findOne(node => node.name == valueTextLayer);
      if(columnItem.columnValue) columnItem.columnValue = columnItem.columnValue.characters;
      else columnItem.columnValue = null;

      return (columnItem.columnValue) ? columnItem : null;
    }

    // KNN (K-Nearest Neighbours classification algorithm)
    let knnModels = {};

    // create a KNN model for each variable matching predict:
    if(layerNames.customColumns && layerNames.customColumns.length){
      let knnError = null;
      layerNames.customColumns.forEach((customColumn, i) => {

        // since we are in a loop, we will generate a new model for each new ${predict:} field,
        // value has ${} syntax
        (customColumn.value.match(strVarRegex) || []).forEach((v) => {

          // check to see if theres any custom column with the predict naming structure
          // if so, we have to train the model before the node loop starts, for better performance
          // if ${} has predict: syntax, train models
          if(v.match(/predict\:/gi)) {

            // gets and object from the predict command
            // 'predict: "component name", category: "layer name"' => { predict: "component name", category: "layer name" }
            let predictObj = stringToObj(v)

            // gets the prediction properties
            let predictElement = predictObj.predict || "",
                predictElementCategory = predictObj.category || null;

            // if theres a correct prediction object, train the model using mljs' knn module:
            // https://github.com/mljs/knn
            // so that the user could use multiple prediction fields
            if(predictElement) {
              let train_dataset = [];
              let train_labels = [];

              let trainElements = figma.currentPage.findAll(node => node.name == predictElement);
              trainElements.forEach(trainElement => {

                let elementCategory;
                if(!predictElementCategory) elementCategory = trainElement;
                else elementCategory = trainElement.findOne(node => node.name == predictElementCategory);

                // creates a grid of 9 points around the elements box models
                // feed these grid points to knn model
                for(const corner of Array.from({ length: 9 }, (v, k) => k+1)){
                  let entryXY = [];
                  switch(corner){
                    case 1: // top left
                      entryXY = [trainElement.x, trainElement.y]; break;
                    case 2: // top center
                      entryXY = [trainElement.x + (trainElement.width / 2), trainElement.y]; break;
                    case 3: // top right
                      entryXY = [trainElement.x + trainElement.width, trainElement.y]; break;
                    case 4: // middle left
                      entryXY = [trainElement.x, trainElement.y + (trainElement.height / 2)]; break;
                    case 5: // middle center
                      entryXY = [trainElement.x + (trainElement.width / 2), trainElement.y + (trainElement.height / 2)]; break;
                    case 6: // middle right
                      entryXY = [trainElement.x + trainElement.width, trainElement.y + (trainElement.height / 2)]; break;
                    case 7: // bottom left
                      entryXY = [trainElement.x, trainElement.y + trainElement.height]; break;
                    case 8: // bottom middle
                      entryXY = [trainElement.x + (trainElement.width / 2), trainElement.y + trainElement.height]; break;
                    case 9: // bottom right
                      entryXY = [trainElement.x + trainElement.width, trainElement.y + trainElement.height];
                  }
                  train_dataset.push(entryXY);
                  train_labels.push(elementCategory ? elementCategory.characters : "");
                }
              });
              // creates a model for each predictionElement
              knnModels[predictElement] = new knn(train_dataset, train_labels, { k: 1 }); // consider only the closest neighbour (1)
              train_dataset = [];
              train_labels = [];

              // console.log(train_dataset);
              // console.log(train_labels);
              // console.log(model);
              // console.log(test);
            }
            else knnError = "Your predict field is missing a name. Check if you've formatted it correctly."

          }
        });
      });
      if(knnError) figma.notify(knnError);
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
      if(columns.length){
        columns.forEach((column, columnIndex) => {
          // inside these column layers, finds a layer to be the header of the column and another to be its value
          // each item must have a header property for the export with papa parse to work
          let columnItem = getColumnFromNode(column, columnIndex);
          if(columnItem){
            item[columnItem.columnHeader] = columnItem.columnValue;
            if(!keys.includes(columnItem.columnHeader)) keys.push(columnItem.columnHeader);
          }
        });
      }
      // otherwise, assume there is only one column and search the value directly from the row node
      else {
        let columnItem = getColumnFromNode(node, 0);
        if(columnItem){
          item[columnItem.columnHeader] = columnItem.columnValue;
          if(!keys.includes(columnItem.columnHeader)) keys.push(columnItem.columnHeader);
        }
      }

      let nodeThis = this;

      // if there are custom columns, render them and append to item object
      if(layerNames.customColumns && layerNames.customColumns.length){
        layerNames.customColumns.forEach((customColumn, i) => {
          let customColumnValue = customColumn.value,
              customColumnName = customColumn.header || `customColumn${i+1}`;
          // value has ${} syntax
          if(customColumnValue.match(strVarRegex)){
            // loop through each ${}
            let vars = customColumnValue.match(strVarRegex).map((v) => {
              // if ${} has node-*** syntax, use the suffix to use a property from node object, like id, name, x, y
              if(v.match(/(?<=node\-)(.*)/gi)) return node[v.match(/(?<=node\-)(.*)/gi)[0]];
              // if ${index}, inject node index + 1 (row line counter)
              else if(v == "index") return nodeIndex + 1;
              else if(v.match(/url/i)) return encodeURI(`https://www.figma.com/file/${figma.fileKey}/${figma.root.name}?node-id=${node.id}`);
              else if(v.match(/(?<=predict\:)(.*)/gi)){

                // gets and object from the predict command
                // 'predict: "component name", category: "layer name"' => { predict: "component name", category: "layer name" }
                let predictObj = stringToObj(v);
                // gets the prediction name to acess the trained model
                let predictElement = predictObj.predict || "";
                if(predictElement){
                  // use the trained model to predict this node category
                  let predictEntry = [node.x + (node.width / 2), node.y + (node.height / 2) ]; // center of node
                  return knnModels[predictElement].predict(predictEntry) || "";
                } else return "";

              }
              // TODO: enable math operations or something like that
              else {
                  // try to get layer name from the variable
                  let layer = node.findOne((n) => n.name === v);
                  // if theres one layer found, check if it has characters. if so, use it. if not, just return the variable
                  if(layer && layer.characters) return layer.characters;
                  else return v;
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
      if(Object.keys(item).length) items.push(item);

    }

    // make sure all items have all keys (even if empty)
    // so that papa parse can export all columns
    items.forEach(item => {
      keys.forEach(key => {
        if(!item[key]) item[key] = ""
      });
    });

    if(items.length == 0){
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
