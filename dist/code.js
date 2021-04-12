/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/***/ (function() {

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const UIWidth = 350;
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
const resize = (size) => {
    return figma.ui.resize(UIWidth, size + 2);
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
        let rows = [];
        // try to find rows from selection for performance purposes
        if (figma.currentPage.selection.length) {
            for (const sel of figma.currentPage.selection) {
                // if the name of the selected item is the same as the rowidentifier,
                // add it to the rows list
                if (sel.name === rowIdentifier)
                    rows.push(sel);
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
            let nodeThis = this;
            // if there are custom columns, render them and append to item object
            if (layerNames.customColumns && layerNames.customColumns.length) {
                layerNames.customColumns.forEach((customColumn, i) => {
                    let customColumnValue = customColumn.value, customColumnName = customColumn.header || `customColumn${i + 1}`;
                    // value has ${} syntax
                    if (customColumnValue.match(/(?<=\$\{)(.*?)(?=\})/g)) {
                        // loop through each ${}
                        let vars = customColumnValue.match(/(?<={)(.*?)(?=\})/g).map((v) => {
                            // if ${} has node-*** syntax, use the suffix to use a property from node object, like id, name, x, y
                            if (v.match(/(?<=node\-)(.*)/gi))
                                return node[v.match(/(?<=node\-)(.*)/gi)[0]];
                            // if ${index}, inject node index + 1 (row line counter)
                            else if (v == "index")
                                return nodeIndex + 1;
                            else if (v.match(/url/i))
                                return encodeURI(`https://www.figma.com/file/${figma.fileKey}/${figma.root.name}?node-id=${node.id}`);
                            // TODO: enable math operations or something like that
                            else
                                return v;
                        });
                        customColumnValue = customColumnValue.replace(/\$({)(.*?)(\})/g, vars);
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/code.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9UYWJsZWZ5Ly4vc3JjL2NvZGUudHMiLCJ3ZWJwYWNrOi8vVGFibGVmeS93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCxnQkFBZ0IsR0FBRyxVQUFVLGNBQWMsVUFBVTtBQUNwSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5SEFBeUgsTUFBTTtBQUMvSCxvQ0FBb0M7QUFDcEMseURBQXlELFdBQVc7QUFDcEU7QUFDQSxpRUFBaUUsV0FBVztBQUM1RSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBLG9DQUFvQyxNQUFNO0FBQzFDO0FBQ0E7QUFDQTtBQUNBLCtFQUErRSxjQUFjLEdBQUcsZ0JBQWdCLFdBQVcsUUFBUTtBQUNuSTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIsMkVBQTJFLFNBQVM7QUFDcEY7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7VUM1SkE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBzaG93cyB0aGUgSFRNTCBwYWdlIGluIFwidWkuaHRtbFwiLlxuZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmNvbnN0IFVJV2lkdGggPSAzNTA7XG4vLyBDYWxscyB0byBcInBhcmVudC5wb3N0TWVzc2FnZVwiIGZyb20gd2l0aGluIHRoZSBIVE1MIHBhZ2Ugd2lsbCB0cmlnZ2VyIHRoaXNcbi8vIGNhbGxiYWNrLiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBwYXNzZWQgdGhlIFwicGx1Z2luTWVzc2FnZVwiIHByb3BlcnR5IG9mIHRoZVxuLy8gcG9zdGVkIG1lc3NhZ2UuXG5jb25zdCByZXNpemUgPSAoc2l6ZSkgPT4ge1xuICAgIHJldHVybiBmaWdtYS51aS5yZXNpemUoVUlXaWR0aCwgc2l6ZSArIDIpO1xufTtcbmZpZ21hLnVpLm9ubWVzc2FnZSA9IG1zZyA9PiB7XG4gICAgaWYgKG1zZy50eXBlID09IFwiaW5pdFwiKSB7XG4gICAgICAgIGlmIChtc2cuc2l6ZSlcbiAgICAgICAgICAgIHJlc2l6ZShtc2cuc2l6ZSk7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2UuZ2V0QXN5bmMoXCJsYXllck5hbWVzXCIpLnRoZW4oKHNhdmVkTmFtZXMpID0+IHtcbiAgICAgICAgICAgIGxldCBsYXllck5hbWVzID0gc2F2ZWROYW1lcyB8fCB7XG4gICAgICAgICAgICAgICAgcm93SWRlbnRpZmllcjogXCJJbnN0YW5jZVwiLFxuICAgICAgICAgICAgICAgIGNvbHVtbklkZW50aWZpZXI6IFwiQ29sdW1uXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyVGV4dExheWVyOiBcIlRleHRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZVRleHRMYXllcjogXCJUZXh0XCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5pdFwiLFxuICAgICAgICAgICAgICAgIFwibGF5ZXJOYW1lc1wiOiBsYXllck5hbWVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAobXNnLnR5cGUgPT0gXCJyZXNpemVcIiAmJiBtc2cuc2l6ZSkge1xuICAgICAgICByZXR1cm4gcmVzaXplKG1zZy5zaXplKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobXNnLnR5cGUgPT0gXCJzYXZlTGF5ZXJOYW1lc1wiKSB7XG4gICAgICAgIGxldCBsYXllck5hbWVzID0gbXNnLmxheWVyTmFtZXM7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoXCJsYXllck5hbWVzXCIsIGxheWVyTmFtZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09ICdkb3dubG9hZCcpIHtcbiAgICAgICAgbGV0IGxheWVyTmFtZXMgPSBtc2cubGF5ZXJOYW1lcztcbiAgICAgICAgZmlnbWEuY2xpZW50U3RvcmFnZS5zZXRBc3luYyhcImxheWVyTmFtZXNcIiwgbGF5ZXJOYW1lcyk7XG4gICAgICAgIGxldCByb3dJZGVudGlmaWVyID0gbGF5ZXJOYW1lcy5yb3dJZGVudGlmaWVyO1xuICAgICAgICBsZXQgY29sdW1uSWRlbnRpZmllciA9IGxheWVyTmFtZXMuY29sdW1uSWRlbnRpZmllcjtcbiAgICAgICAgbGV0IGhlYWRlclRleHRMYXllciA9IGxheWVyTmFtZXMuaGVhZGVyVGV4dExheWVyO1xuICAgICAgICBsZXQgdmFsdWVUZXh0TGF5ZXIgPSBsYXllck5hbWVzLnZhbHVlVGV4dExheWVyO1xuICAgICAgICBsZXQgcm93cyA9IFtdO1xuICAgICAgICAvLyB0cnkgdG8gZmluZCByb3dzIGZyb20gc2VsZWN0aW9uIGZvciBwZXJmb3JtYW5jZSBwdXJwb3Nlc1xuICAgICAgICBpZiAoZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzZWwgb2YgZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG5hbWUgb2YgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgdGhlIHNhbWUgYXMgdGhlIHJvd2lkZW50aWZpZXIsXG4gICAgICAgICAgICAgICAgLy8gYWRkIGl0IHRvIHRoZSByb3dzIGxpc3RcbiAgICAgICAgICAgICAgICBpZiAoc2VsLm5hbWUgPT09IHJvd0lkZW50aWZpZXIpXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChzZWwpO1xuICAgICAgICAgICAgICAgIHJvd3MgPSByb3dzLmNvbmNhdChzZWwuZmluZEFsbChub2RlID0+IG5vZGUubmFtZSA9PT0gcm93SWRlbnRpZmllcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhlcmVzIG5vIHNlbGVjdGlvbiwgZmFsbCBiYWNrIHRvIGZldGNoaW5nIHJvd3MgZnJvbSB0aGUgcGFnZSAoc2xvd2VyKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcm93cyA9IHJvd3MuY29uY2F0KGZpZ21hLmN1cnJlbnRQYWdlLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IHJvd0lkZW50aWZpZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZ2V0Q29sdW1uRnJvbU5vZGUgPSAoZnJvbU5vZGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBsZXQgY29sdW1uSXRlbSA9IHt9O1xuICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIgPSBmcm9tTm9kZS5maW5kT25lKG5vZGUgPT4gbm9kZS5uYW1lID09IGhlYWRlclRleHRMYXllcik7XG4gICAgICAgICAgICAvLyBnZXQgdGhlIGxheWVyIHdpdGggdGhlIHNhbWUgc2FtZSBhcyBoZWFkZXJUZXh0TGF5ZXIgYW5kIHVzZSBpdHMgdmFsdWUgYXMgdGhlIGhlYWRlclxuICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKVxuICAgICAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyID0gY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIuY2hhcmFjdGVycztcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBkZWZhdWx0cyB0byB0aGUgY29sdW1uSGVhZGVyIG9yIGEgZGVmYXVsdCBvbmVcbiAgICAgICAgICAgIC8vIGl0cyBpbXBvcnRhbnQgdGhhdCBlYWNoIGNvbHVtbiBoYXZlIGEgZGlmZmVyZW50IGhlYWRlciwgc28gdGhhdCB0aGUgbGlzdCBpcyBjb3JyZWN0bHkgcmVuZGVyZWRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtbkhlYWRlciA9IGhlYWRlclRleHRMYXllciA/IGAke2hlYWRlclRleHRMYXllcn0gJHtpbmRleCArIDF9YCA6IGBDb2x1bW4gJHtpbmRleCArIDF9YDtcbiAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUgPSBmcm9tTm9kZS5maW5kT25lKG5vZGUgPT4gbm9kZS5uYW1lID09IHZhbHVlVGV4dExheWVyKTtcbiAgICAgICAgICAgIGlmIChjb2x1bW5JdGVtLmNvbHVtblZhbHVlKVxuICAgICAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUgPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5WYWx1ZSA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gKGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUpID8gY29sdW1uSXRlbSA6IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBpdGVtcyA9IFtdO1xuICAgICAgICBsZXQga2V5cyA9IFtdO1xuICAgICAgICAvLyBnZW5lcmF0ZSBsaXN0IG9mIGV4cG9ydGFibGUgaXRlbXMgZnJvbSBzZWxlY3RlZCByb3dzXG4gICAgICAgIGZvciAoY29uc3QgW25vZGVJbmRleCwgbm9kZV0gb2Ygcm93cy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzID0gW107XG4gICAgICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHt9O1xuICAgICAgICAgICAgLy8gZ2V0IGxheWVycyB0aGF0IHdvdWxkIHJlcHJlc2VudCB0aGUgcm93IGNvbHVtbnNcbiAgICAgICAgICAgIGxldCBjb2x1bW5zID0gbm9kZS5maW5kQWxsKChub2RlKSA9PiBub2RlLm5hbWUgPT09IGNvbHVtbklkZW50aWZpZXIpO1xuICAgICAgICAgICAgaWYgKGNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2x1bW4sIGNvbHVtbkluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluc2lkZSB0aGVzZSBjb2x1bW4gbGF5ZXJzLCBmaW5kcyBhIGxheWVyIHRvIGJlIHRoZSBoZWFkZXIgb2YgdGhlIGNvbHVtbiBhbmQgYW5vdGhlciB0byBiZSBpdHMgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgLy8gZWFjaCBpdGVtIG11c3QgaGF2ZSBhIGhlYWRlciBwcm9wZXJ0eSBmb3IgdGhlIGV4cG9ydCB3aXRoIHBhcGEgcGFyc2UgdG8gd29ya1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uSXRlbSA9IGdldENvbHVtbkZyb21Ob2RlKGNvbHVtbiwgY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcl0gPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXlzLmluY2x1ZGVzKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSBjb2x1bW4gYW5kIHNlYXJjaCB0aGUgdmFsdWUgZGlyZWN0bHkgZnJvbSB0aGUgcm93IG5vZGVcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5JdGVtID0gZ2V0Q29sdW1uRnJvbU5vZGUobm9kZSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcl0gPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWtleXMuaW5jbHVkZXMoY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpKVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbm9kZVRoaXMgPSB0aGlzO1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGN1c3RvbSBjb2x1bW5zLCByZW5kZXIgdGhlbSBhbmQgYXBwZW5kIHRvIGl0ZW0gb2JqZWN0XG4gICAgICAgICAgICBpZiAobGF5ZXJOYW1lcy5jdXN0b21Db2x1bW5zICYmIGxheWVyTmFtZXMuY3VzdG9tQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsYXllck5hbWVzLmN1c3RvbUNvbHVtbnMuZm9yRWFjaCgoY3VzdG9tQ29sdW1uLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXN0b21Db2x1bW5WYWx1ZSA9IGN1c3RvbUNvbHVtbi52YWx1ZSwgY3VzdG9tQ29sdW1uTmFtZSA9IGN1c3RvbUNvbHVtbi5oZWFkZXIgfHwgYGN1c3RvbUNvbHVtbiR7aSArIDF9YDtcbiAgICAgICAgICAgICAgICAgICAgLy8gdmFsdWUgaGFzICR7fSBzeW50YXhcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbUNvbHVtblZhbHVlLm1hdGNoKC8oPzw9XFwkXFx7KSguKj8pKD89XFx9KS9nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGVhY2ggJHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdmFycyA9IGN1c3RvbUNvbHVtblZhbHVlLm1hdGNoKC8oPzw9eykoLio/KSg/PVxcfSkvZykubWFwKCh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgJHt9IGhhcyBub2RlLSoqKiBzeW50YXgsIHVzZSB0aGUgc3VmZml4IHRvIHVzZSBhIHByb3BlcnR5IGZyb20gbm9kZSBvYmplY3QsIGxpa2UgaWQsIG5hbWUsIHgsIHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi5tYXRjaCgvKD88PW5vZGVcXC0pKC4qKS9naSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlW3YubWF0Y2goLyg/PD1ub2RlXFwtKSguKikvZ2kpWzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAke2luZGV4fSwgaW5qZWN0IG5vZGUgaW5kZXggKyAxIChyb3cgbGluZSBjb3VudGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYgPT0gXCJpbmRleFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZUluZGV4ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh2Lm1hdGNoKC91cmwvaSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGVVUkkoYGh0dHBzOi8vd3d3LmZpZ21hLmNvbS9maWxlLyR7ZmlnbWEuZmlsZUtleX0vJHtmaWdtYS5yb290Lm5hbWV9P25vZGUtaWQ9JHtub2RlLmlkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGVuYWJsZSBtYXRoIG9wZXJhdGlvbnMgb3Igc29tZXRoaW5nIGxpa2UgdGhhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNvbHVtblZhbHVlID0gY3VzdG9tQ29sdW1uVmFsdWUucmVwbGFjZSgvXFwkKHspKC4qPykoXFx9KS9nLCB2YXJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdGVtW2N1c3RvbUNvbHVtbk5hbWVdID0gY3VzdG9tQ29sdW1uVmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhZGQgdG8gbGlzdCBvbmx5IGlmIGl0cyBub3QgZW1wdHlcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhpdGVtKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtYWtlIHN1cmUgYWxsIGl0ZW1zIGhhdmUgYWxsIGtleXMgKGV2ZW4gaWYgZW1wdHkpXG4gICAgICAgIC8vIHNvIHRoYXQgcGFwYSBwYXJzZSBjYW4gZXhwb3J0IGFsbCBjb2x1bW5zXG4gICAgICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW1ba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaXRlbVtrZXldID0gXCJcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJObyByb3dzIGZvdW5kLiBUcnkgZG91YmxlIGNoZWNraW5nIHlvdXIgaWRlbnRpZmllcnMgYW5kIGxheWVyIG5hbWVzLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBwYXNzZXMgdGhlIG9iamVjdCBhcnJheSBiYWNrIHRvIHRoZSBVSSB0byBiZSBwYXJzZWQgd2l0aCBwYXBhIHBhcnNlIGFuZCBkb3dubG9hZGVkXG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImRvd25sb2FkXCIsXG4gICAgICAgICAgICBcIml0ZW1zXCI6IGl0ZW1zXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB0byBjbG9zZSB0aGUgcGx1Z2luIHdoZW4geW91J3JlIGRvbmUuIE90aGVyd2lzZSB0aGUgcGx1Z2luIHdpbGxcbiAgICAvLyBrZWVwIHJ1bm5pbmcsIHdoaWNoIHNob3dzIHRoZSBjYW5jZWwgYnV0dG9uIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbi5cbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufTtcbiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0ge307XG5fX3dlYnBhY2tfbW9kdWxlc19fW1wiLi9zcmMvY29kZS50c1wiXSgpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==