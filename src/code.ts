
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300,298);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  if(msg.type == "init"){
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
      columnItem.columnValue = fromNode.findOne(node => node.name == valueTextLayer).characters;

      return (columnItem.columnValue) ? columnItem : null;
    }

    let items = [];
    let keys = [];
    for (const node of rows) {

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
