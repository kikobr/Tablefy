import './ui.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';
import selectMenu from 'figma-plugin-ds/dist/modules/selectMenu';
const Papa = require("papaparse");

let rowIdentifier = document.getElementById("row-identifier"),
    columnIdentifier = document.getElementById("column-identifier"),
    columnHeader = document.getElementById("column-header"),
    columnValue = document.getElementById("column-value");

// clicou no download, passa mensagem pro code.ts pegar as
// layers selecionadas e gerar lista de itens pro csv
document.getElementById('download').onclick = () => {
  parent.postMessage({
    pluginMessage: {
      type: 'download',
      layerNames: getLayerNames()
    }
  }, '*');
}

// save layer names after updating input
let inputChanged = (evt) => {
  parent.postMessage({
    pluginMessage: {
      type: 'saveLayerNames',
      layerNames: getLayerNames()
    }
  }, '*');
  console.log("layerNames saved");
}
rowIdentifier.onchange = inputChanged;
columnIdentifier.onchange = inputChanged;
columnHeader.onchange = inputChanged;
columnValue.onchange = inputChanged;

// code.ts respondeu com um array de itens.
onmessage = (event) => {
  if(event.data.pluginMessage.type == "init"){
    let layerNames = event.data.pluginMessage.layerNames;
    // set input values
    rowIdentifier.value = layerNames["rowIdentifier"];
    columnIdentifier.value = layerNames["columnIdentifier"];
    columnHeader.value = layerNames["headerTextLayer"];
    columnValue.value = layerNames["valueTextLayer"];
  }
  // parseia com o papaparse e baixa o csv
  else if(event.data.pluginMessage.type == "download"){
    let items = event.data.pluginMessage.items;
    let csv = Papa.unparse(items);
    console.log(items);
    console.log(csv);
    downloadCsv(csv);
  }
}

let getLayerNames = () => {
  let layerNames = {};
  layerNames["rowIdentifier"] = rowIdentifier.value;
  layerNames["columnIdentifier"] = columnIdentifier.value;
  layerNames["headerTextLayer"] = columnHeader.value;
  layerNames["valueTextLayer"] = columnValue.value;
  return layerNames;
}

// baixa o csv
let downloadCsv = (csv) => {
    var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var csvURL =  null;
    if (navigator.msSaveBlob) csvURL = navigator.msSaveBlob(csvData, 'download.csv');
    else csvURL = window.URL.createObjectURL(csvData);

    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'tablefied.csv');
    tempLink.click();
}

// base figma components
// selectMenu.init();

// get saved layerNames on plugin side
parent.postMessage({
  pluginMessage: { type: 'init' }
}, '*');
