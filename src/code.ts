
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const UIWidth = 350;

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

const resize = (size) => {
  return figma.ui.resize(UIWidth, size + 2);
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

    let rows = [];
    // try to find rows from selection for performance purposes
    if(figma.currentPage.selection.length){
      for (const sel of figma.currentPage.selection){
        // if the name of the selected item is the same as the rowidentifier,
        // add it to the rows list
        if(sel.name === rowIdentifier) rows.push(sel);
        rows = rows.concat(sel.findAll(node => node.name === rowIdentifier));
      }
    // if theres no selection, fall back to fetching rows from the page (slower)
    } else {
      rows = rows.concat(figma.currentPage.findAll(node => node.name === rowIdentifier));
    }

    let getColumnFromNode = (fromNode) => {
      let columnItem = {};
      columnItem.columnHeader = fromNode.findOne(node => node.name == headerTextLayer);
      // get the layer with the same same as headerTextLayer and use its value as the header
      if(columnItem.columnHeader) columnItem.columnHeader = columnItem.columnHeader.characters;
      // otherwise defaults to the columnIdentifier or rowIdentifier (when there is only one column)
      else columnItem.columnHeader = columnIdentifier || rowIdentifier || "Column";

      columnItem.columnValue = fromNode.findOne(node => node.name == valueTextLayer);
      if(columnItem.columnValue) columnItem.columnValue = columnItem.columnValue.characters;
      else columnItem.columnValue = null;

      return (columnItem.columnValue) ? columnItem : null;
    }

    let items = [];
    let keys = [];
    // generate list of exportable items from selected rows
    for (const [nodeIndex, node] of rows.entries()) {

      let headers = [];
      let values = [];
      let item = {};

      // get layers that would represent the row columns
      let columns = node.findAll(node => node.name === columnIdentifier);
      if(columns.length){
        columns.forEach((column) => {
          // inside these column layers, finds a layer to be the header of the column and another to be its value
          // each item must have a header property for the export with papa parse to work
          // linha exibirá o nome da coluna
          let columnItem = getColumnFromNode(column);
          if(columnItem){
            item[columnItem.columnHeader] = columnItem.columnValue;
            if(!keys.includes(columnItem.columnHeader)) keys.push(columnItem.columnHeader);
          }
        });
      }
      // otherwise, assume there is only one column and search the value directly from the row node
      else {
        let columnItem = getColumnFromNode(node);
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
          if(customColumnValue.match(/(?<=\$\{)(.*?)(?=\})/g)){
            // loop through each ${}
            let vars = customColumnValue.match(/(?<={)(.*?)(?=\})/g).map((v) => {
              // if ${} has node-*** syntax, use the suffix to use a property from node object, like id, name, x, y
              if(v.match(/(?<=node\-)(.*)/gi)) return node[v.match(/(?<=node\-)(.*)/gi)[0]];
              // if ${index}, inject node index + 1 (row line counter)
              else if(v == "index") return nodeIndex + 1;
              else if(v.match(/url/i)) return encodeURI(`https://www.figma.com/file/${figma.fileKey}/${figma.root.name}?node-id=${node.id}`);
              // TODO: enable math operations or something like that
              else return v;
            });
            customColumnValue = customColumnValue.replace(/\$({)(.*?)(\})/g, vars);
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
