import './ui.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';
import selectMenu from 'figma-plugin-ds/dist/modules/selectMenu';
const Papa = require("papaparse");

let main = document.querySelector("main"),
    rowIdentifier = document.getElementById("row-identifier"),
    columnIdentifier = document.getElementById("column-identifier"),
    columnHeader = document.getElementById("column-header"),
    columnValue = document.getElementById("column-value"),
    addCustomColumnButton = document.getElementById("addCustomColumnButton"),
    removeCustomColumnButton = document.getElementById("removeCustomColumnButton"),
    customColumnRows = document.getElementById("custom-column-rows"),
    customColumnRowsList = customColumnRows.querySelector(".list"),
    customColumns = [];

// save layer names after updating input
let inputChanged = (evt) => {
  let layerNames = getLayerNames();
  parent.postMessage({
    pluginMessage: {
      type: 'saveLayerNames',
      layerNames: layerNames
    }
  }, '*');
  console.log("layerNames saved", layerNames);
}

rowIdentifier.onchange = inputChanged;
columnIdentifier.onchange = inputChanged;
columnHeader.onchange = inputChanged;
columnValue.onchange = inputChanged;

// create columns dynamically
let addCustomColumn = (cols) => {
  let columns = cols.length ? cols : getLayerNames().customColumns;

  // if it doesnt come pre-filled from init, initialize with an empty column
  if(!cols.length) {
    columns.push({ value: "", header: "" });
  }

  let row = customColumnRowsList;
  row.innerHTML = "";

  columns.forEach((custom, index) => {
    row.innerHTML = row.innerHTML + `
      <div class="row">
        <div class="col">
          <div class="section-title">Custom column value</div>
          <div class="input input--with-icon">
            <div class="icon icon--group"></div>
            <input name="custom-column-value-${index}" type="input" class="input__field" value='${custom.value}'>
          </div>
        </div>
        <div class="col">
          <div class="section-title">Custom column header</div>
          <div class="input input--with-icon">
            <div class="icon icon--group"></div>
            <input name="custom-column-name-${index}" type="input" class="input__field" value='${custom.header}'>
          </div>
        </div>
      </div>
    `;
  });
  customColumnRowsList.querySelectorAll("[name^=custom-column]").forEach(node => {
    node.onchange = inputChanged;
  });

  customColumnRowsList.classList.remove("hidden");
  // addCustomColumnButton.classList.add("hidden");
  removeCustomColumnButton.classList.remove("hidden");

  parent.postMessage({
    pluginMessage: {
      type: 'saveLayerNames',
      layerNames: getLayerNames()
    }
  }, '*');
  parent.postMessage({
    pluginMessage: { type: 'resize', size: main.getBoundingClientRect().height }
  }, '*');
}
addCustomColumnButton.onclick = addCustomColumn;

// remove columns
let removeCustomColumn = () => {

  let columns = getLayerNames().customColumns;
  if(columns.length > 1){
    customColumnRowsList.removeChild(customColumnRowsList.querySelector(".row:last-child"));
  } else {
    customColumnRowsList.innerHTML = "";
    // addCustomColumnButton.classList.remove("hidden");
    customColumnRowsList.classList.add("hidden");
    removeCustomColumnButton.classList.add("hidden");
  }

  parent.postMessage({
    pluginMessage: {
      type: 'saveLayerNames',
      layerNames: getLayerNames()
    }
  }, '*');
  parent.postMessage({
    pluginMessage: { type: 'resize', size: main.getBoundingClientRect().height }
  }, '*');
}
removeCustomColumnButton.onclick = removeCustomColumn;

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

// code.ts respondeu com um array de itens.
onmessage = (event) => {
  if(event.data.pluginMessage.type == "init"){
    let layerNames = event.data.pluginMessage.layerNames;
    // set input values
    rowIdentifier.value = layerNames["rowIdentifier"];
    columnIdentifier.value = layerNames["columnIdentifier"];
    columnHeader.value = layerNames["headerTextLayer"];
    columnValue.value = layerNames["valueTextLayer"];

    // apply custom columns to their inputs
    if(layerNames["customColumns"] && layerNames["customColumns"].length) addCustomColumn(layerNames["customColumns"]);
    else removeCustomColumn();
  }
  // parseia com o papaparse e baixa o csv
  else if(event.data.pluginMessage.type == "download"){
    let items = event.data.pluginMessage.items;
    let csv = Papa.unparse(items);
    console.log("Items to download:", items);
    console.log("Csv to download:\n", csv);
    downloadCsv(csv);
  }
}

let getLayerNames = () => {
  let layerNames = {};
  layerNames["rowIdentifier"] = rowIdentifier.value;
  layerNames["columnIdentifier"] = columnIdentifier.value;
  layerNames["headerTextLayer"] = columnHeader.value;
  layerNames["valueTextLayer"] = columnValue.value;
  layerNames["customColumns"] = [];
  // get custom columns from dynamically generated
  customColumnRows.querySelectorAll("[name^=custom-column-value]").forEach(node => {
    let name = node.closest(".row").querySelector("[name^=custom-column-name]");
    name = name && name.value ? name.value : "";
    layerNames["customColumns"].push({ value: node.value, header: name });
  });
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
