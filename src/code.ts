
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300,300);

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

    // roda apenas nas instâncias selecionadas (para aumentar performance)
    // cada uma das instâncias representaria uma linha da tabela
    let rows = [];
    for (const sel of figma.currentPage.selection){
      if(sel.name === rowIdentifier) rows.push(sel);
      rows = rows.concat(sel.findAll(node => node.name === rowIdentifier));
    }

    let items = [];
    for (const node of rows) {

      let headers = [];
      let values = [];
      let item = {};

      // dentro de instância (linha), roda por cada grupo que representaria uma coluna da linha
      let columns = node.findAll(node => node.name === columnIdentifier);
      columns.forEach((column) => {
        // dentro da coluna, encontra uma layer para ser o cabeçalho e outra para ser o valor da coluna
        // todo valor precisa ter o nome de uma coluna atrelado, por mais que no csv apenas a primeira
        // linha exibirá o nome da coluna
        let columnHeader = column.children[0].findOne(node => node.name == headerTextLayer).characters;
        let columnValue = column.children[1].findOne(node => node.name == valueTextLayer).characters;
        item[columnHeader] = columnValue;
      });

      items.push(item);
    }

    // passa o array de objetos de volta pra UI parsear com o papaparse e baixar o csv
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
