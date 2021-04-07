/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300, 300);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    if (msg.type == "init") {
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
        // roda apenas nas instâncias selecionadas (para aumentar performance)
        // cada uma das instâncias representaria uma linha da tabela
        let rows = [];
        for (const sel of figma.currentPage.selection) {
            if (sel.name === rowIdentifier)
                rows.push(sel);
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9UYWJsZWZ5Ly4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIHNob3dzIHRoZSBIVE1MIHBhZ2UgaW4gXCJ1aS5odG1sXCIuXG5maWdtYS5zaG93VUkoX19odG1sX18pO1xuZmlnbWEudWkucmVzaXplKDMwMCwgMzAwKTtcbi8vIENhbGxzIHRvIFwicGFyZW50LnBvc3RNZXNzYWdlXCIgZnJvbSB3aXRoaW4gdGhlIEhUTUwgcGFnZSB3aWxsIHRyaWdnZXIgdGhpc1xuLy8gY2FsbGJhY2suIFRoZSBjYWxsYmFjayB3aWxsIGJlIHBhc3NlZCB0aGUgXCJwbHVnaW5NZXNzYWdlXCIgcHJvcGVydHkgb2YgdGhlXG4vLyBwb3N0ZWQgbWVzc2FnZS5cbmZpZ21hLnVpLm9ubWVzc2FnZSA9IG1zZyA9PiB7XG4gICAgaWYgKG1zZy50eXBlID09IFwiaW5pdFwiKSB7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2UuZ2V0QXN5bmMoXCJsYXllck5hbWVzXCIpLnRoZW4oKHNhdmVkTmFtZXMpID0+IHtcbiAgICAgICAgICAgIGxldCBsYXllck5hbWVzID0gc2F2ZWROYW1lcyB8fCB7XG4gICAgICAgICAgICAgICAgcm93SWRlbnRpZmllcjogXCJJbnN0YW5jZVwiLFxuICAgICAgICAgICAgICAgIGNvbHVtbklkZW50aWZpZXI6IFwiQ29sdW1uXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyVGV4dExheWVyOiBcIlRleHRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZVRleHRMYXllcjogXCJUZXh0XCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5pdFwiLFxuICAgICAgICAgICAgICAgIFwibGF5ZXJOYW1lc1wiOiBsYXllck5hbWVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAobXNnLnR5cGUgPT0gXCJzYXZlTGF5ZXJOYW1lc1wiKSB7XG4gICAgICAgIGxldCBsYXllck5hbWVzID0gbXNnLmxheWVyTmFtZXM7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoXCJsYXllck5hbWVzXCIsIGxheWVyTmFtZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09ICdkb3dubG9hZCcpIHtcbiAgICAgICAgbGV0IGxheWVyTmFtZXMgPSBtc2cubGF5ZXJOYW1lcztcbiAgICAgICAgZmlnbWEuY2xpZW50U3RvcmFnZS5zZXRBc3luYyhcImxheWVyTmFtZXNcIiwgbGF5ZXJOYW1lcyk7XG4gICAgICAgIGxldCByb3dJZGVudGlmaWVyID0gbGF5ZXJOYW1lcy5yb3dJZGVudGlmaWVyO1xuICAgICAgICBsZXQgY29sdW1uSWRlbnRpZmllciA9IGxheWVyTmFtZXMuY29sdW1uSWRlbnRpZmllcjtcbiAgICAgICAgbGV0IGhlYWRlclRleHRMYXllciA9IGxheWVyTmFtZXMuaGVhZGVyVGV4dExheWVyO1xuICAgICAgICBsZXQgdmFsdWVUZXh0TGF5ZXIgPSBsYXllck5hbWVzLnZhbHVlVGV4dExheWVyO1xuICAgICAgICAvLyByb2RhIGFwZW5hcyBuYXMgaW5zdMOibmNpYXMgc2VsZWNpb25hZGFzIChwYXJhIGF1bWVudGFyIHBlcmZvcm1hbmNlKVxuICAgICAgICAvLyBjYWRhIHVtYSBkYXMgaW5zdMOibmNpYXMgcmVwcmVzZW50YXJpYSB1bWEgbGluaGEgZGEgdGFiZWxhXG4gICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgc2VsIG9mIGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbikge1xuICAgICAgICAgICAgaWYgKHNlbC5uYW1lID09PSByb3dJZGVudGlmaWVyKVxuICAgICAgICAgICAgICAgIHJvd3MucHVzaChzZWwpO1xuICAgICAgICAgICAgcm93cyA9IHJvd3MuY29uY2F0KHNlbC5maW5kQWxsKG5vZGUgPT4gbm9kZS5uYW1lID09PSByb3dJZGVudGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGl0ZW1zID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiByb3dzKSB7XG4gICAgICAgICAgICBsZXQgaGVhZGVycyA9IFtdO1xuICAgICAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB7fTtcbiAgICAgICAgICAgIC8vIGRlbnRybyBkZSBpbnN0w6JuY2lhIChsaW5oYSksIHJvZGEgcG9yIGNhZGEgZ3J1cG8gcXVlIHJlcHJlc2VudGFyaWEgdW1hIGNvbHVuYSBkYSBsaW5oYVxuICAgICAgICAgICAgbGV0IGNvbHVtbnMgPSBub2RlLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IGNvbHVtbklkZW50aWZpZXIpO1xuICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICAvLyBkZW50cm8gZGEgY29sdW5hLCBlbmNvbnRyYSB1bWEgbGF5ZXIgcGFyYSBzZXIgbyBjYWJlw6dhbGhvIGUgb3V0cmEgcGFyYSBzZXIgbyB2YWxvciBkYSBjb2x1bmFcbiAgICAgICAgICAgICAgICAvLyB0b2RvIHZhbG9yIHByZWNpc2EgdGVyIG8gbm9tZSBkZSB1bWEgY29sdW5hIGF0cmVsYWRvLCBwb3IgbWFpcyBxdWUgbm8gY3N2IGFwZW5hcyBhIHByaW1laXJhXG4gICAgICAgICAgICAgICAgLy8gbGluaGEgZXhpYmlyw6EgbyBub21lIGRhIGNvbHVuYVxuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5IZWFkZXIgPSBjb2x1bW4uY2hpbGRyZW5bMF0uZmluZE9uZShub2RlID0+IG5vZGUubmFtZSA9PSBoZWFkZXJUZXh0TGF5ZXIpLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtblZhbHVlID0gY29sdW1uLmNoaWxkcmVuWzFdLmZpbmRPbmUobm9kZSA9PiBub2RlLm5hbWUgPT0gdmFsdWVUZXh0TGF5ZXIpLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5IZWFkZXJdID0gY29sdW1uVmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcGFzc2EgbyBhcnJheSBkZSBvYmpldG9zIGRlIHZvbHRhIHByYSBVSSBwYXJzZWFyIGNvbSBvIHBhcGFwYXJzZSBlIGJhaXhhciBvIGNzdlxuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICBcInR5cGVcIjogXCJkb3dubG9hZFwiLFxuICAgICAgICAgICAgXCJpdGVtc1wiOiBpdGVtc1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBNYWtlIHN1cmUgdG8gY2xvc2UgdGhlIHBsdWdpbiB3aGVuIHlvdSdyZSBkb25lLiBPdGhlcndpc2UgdGhlIHBsdWdpbiB3aWxsXG4gICAgLy8ga2VlcCBydW5uaW5nLCB3aGljaCBzaG93cyB0aGUgY2FuY2VsIGJ1dHRvbiBhdCB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW4uXG4gICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbn07XG4iXSwic291cmNlUm9vdCI6IiJ9