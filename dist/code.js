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
        let getColumnFromNode = (fromNode) => {
            let columnItem = {};
            columnItem.columnHeader = fromNode.findOne(node => node.name == headerTextLayer);
            // get the layer with the same same as headerTextLayer and use its value as the header
            if (columnItem.columnHeader)
                columnItem.columnHeader = columnItem.columnHeader.characters;
            // otherwise defaults to the columnIdentifier or rowIdentifier (when there is only one column)
            else
                columnItem.columnHeader = columnIdentifier || rowIdentifier || "Column";
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
            let columns = node.findAll(node => node.name === columnIdentifier);
            if (columns.length) {
                columns.forEach((column) => {
                    // inside these column layers, finds a layer to be the header of the column and another to be its value
                    // each item must have a header property for the export with papa parse to work
                    // linha exibirá o nome da coluna
                    let columnItem = getColumnFromNode(column);
                    if (columnItem) {
                        item[columnItem.columnHeader] = columnItem.columnValue;
                        if (!keys.includes(columnItem.columnHeader))
                            keys.push(columnItem.columnHeader);
                    }
                });
            }
            // otherwise, assume there is only one column and search the value directly from the row node
            else {
                let columnItem = getColumnFromNode(node);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9UYWJsZWZ5Ly4vc3JjL2NvZGUudHMiLCJ3ZWJwYWNrOi8vVGFibGVmeS93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUhBQXlILE1BQU07QUFDL0gsb0NBQW9DO0FBQ3BDLHlEQUF5RCxXQUFXO0FBQ3BFO0FBQ0EsaUVBQWlFLFdBQVc7QUFDNUUscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQSxvQ0FBb0MsTUFBTTtBQUMxQztBQUNBO0FBQ0E7QUFDQSwrRUFBK0UsY0FBYyxHQUFHLGdCQUFnQixXQUFXLFFBQVE7QUFDbkk7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCLDJFQUEyRSxTQUFTO0FBQ3BGO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O1VDNUpBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgc2hvd3MgdGhlIEhUTUwgcGFnZSBpbiBcInVpLmh0bWxcIi5cbmZpZ21hLnNob3dVSShfX2h0bWxfXyk7XG5jb25zdCBVSVdpZHRoID0gMzUwO1xuLy8gQ2FsbHMgdG8gXCJwYXJlbnQucG9zdE1lc3NhZ2VcIiBmcm9tIHdpdGhpbiB0aGUgSFRNTCBwYWdlIHdpbGwgdHJpZ2dlciB0aGlzXG4vLyBjYWxsYmFjay4gVGhlIGNhbGxiYWNrIHdpbGwgYmUgcGFzc2VkIHRoZSBcInBsdWdpbk1lc3NhZ2VcIiBwcm9wZXJ0eSBvZiB0aGVcbi8vIHBvc3RlZCBtZXNzYWdlLlxuY29uc3QgcmVzaXplID0gKHNpemUpID0+IHtcbiAgICByZXR1cm4gZmlnbWEudWkucmVzaXplKFVJV2lkdGgsIHNpemUgKyAyKTtcbn07XG5maWdtYS51aS5vbm1lc3NhZ2UgPSBtc2cgPT4ge1xuICAgIGlmIChtc2cudHlwZSA9PSBcImluaXRcIikge1xuICAgICAgICBpZiAobXNnLnNpemUpXG4gICAgICAgICAgICByZXNpemUobXNnLnNpemUpO1xuICAgICAgICBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKFwibGF5ZXJOYW1lc1wiKS50aGVuKChzYXZlZE5hbWVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGF5ZXJOYW1lcyA9IHNhdmVkTmFtZXMgfHwge1xuICAgICAgICAgICAgICAgIHJvd0lkZW50aWZpZXI6IFwiSW5zdGFuY2VcIixcbiAgICAgICAgICAgICAgICBjb2x1bW5JZGVudGlmaWVyOiBcIkNvbHVtblwiLFxuICAgICAgICAgICAgICAgIGhlYWRlclRleHRMYXllcjogXCJUZXh0XCIsXG4gICAgICAgICAgICAgICAgdmFsdWVUZXh0TGF5ZXI6IFwiVGV4dFwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImluaXRcIixcbiAgICAgICAgICAgICAgICBcImxheWVyTmFtZXNcIjogbGF5ZXJOYW1lc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09IFwicmVzaXplXCIgJiYgbXNnLnNpemUpIHtcbiAgICAgICAgcmV0dXJuIHJlc2l6ZShtc2cuc2l6ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09IFwic2F2ZUxheWVyTmFtZXNcIikge1xuICAgICAgICBsZXQgbGF5ZXJOYW1lcyA9IG1zZy5sYXllck5hbWVzO1xuICAgICAgICBmaWdtYS5jbGllbnRTdG9yYWdlLnNldEFzeW5jKFwibGF5ZXJOYW1lc1wiLCBsYXllck5hbWVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChtc2cudHlwZSA9PSAnZG93bmxvYWQnKSB7XG4gICAgICAgIGxldCBsYXllck5hbWVzID0gbXNnLmxheWVyTmFtZXM7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoXCJsYXllck5hbWVzXCIsIGxheWVyTmFtZXMpO1xuICAgICAgICBsZXQgcm93SWRlbnRpZmllciA9IGxheWVyTmFtZXMucm93SWRlbnRpZmllcjtcbiAgICAgICAgbGV0IGNvbHVtbklkZW50aWZpZXIgPSBsYXllck5hbWVzLmNvbHVtbklkZW50aWZpZXI7XG4gICAgICAgIGxldCBoZWFkZXJUZXh0TGF5ZXIgPSBsYXllck5hbWVzLmhlYWRlclRleHRMYXllcjtcbiAgICAgICAgbGV0IHZhbHVlVGV4dExheWVyID0gbGF5ZXJOYW1lcy52YWx1ZVRleHRMYXllcjtcbiAgICAgICAgbGV0IHJvd3MgPSBbXTtcbiAgICAgICAgLy8gdHJ5IHRvIGZpbmQgcm93cyBmcm9tIHNlbGVjdGlvbiBmb3IgcGVyZm9ybWFuY2UgcHVycG9zZXNcbiAgICAgICAgaWYgKGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2VsIG9mIGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBuYW1lIG9mIHRoZSBzZWxlY3RlZCBpdGVtIGlzIHRoZSBzYW1lIGFzIHRoZSByb3dpZGVudGlmaWVyLFxuICAgICAgICAgICAgICAgIC8vIGFkZCBpdCB0byB0aGUgcm93cyBsaXN0XG4gICAgICAgICAgICAgICAgaWYgKHNlbC5uYW1lID09PSByb3dJZGVudGlmaWVyKVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2goc2VsKTtcbiAgICAgICAgICAgICAgICByb3dzID0gcm93cy5jb25jYXQoc2VsLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IHJvd0lkZW50aWZpZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlcyBubyBzZWxlY3Rpb24sIGZhbGwgYmFjayB0byBmZXRjaGluZyByb3dzIGZyb20gdGhlIHBhZ2UgKHNsb3dlcilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvd3MgPSByb3dzLmNvbmNhdChmaWdtYS5jdXJyZW50UGFnZS5maW5kQWxsKG5vZGUgPT4gbm9kZS5uYW1lID09PSByb3dJZGVudGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdldENvbHVtbkZyb21Ob2RlID0gKGZyb21Ob2RlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29sdW1uSXRlbSA9IHt9O1xuICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIgPSBmcm9tTm9kZS5maW5kT25lKG5vZGUgPT4gbm9kZS5uYW1lID09IGhlYWRlclRleHRMYXllcik7XG4gICAgICAgICAgICAvLyBnZXQgdGhlIGxheWVyIHdpdGggdGhlIHNhbWUgc2FtZSBhcyBoZWFkZXJUZXh0TGF5ZXIgYW5kIHVzZSBpdHMgdmFsdWUgYXMgdGhlIGhlYWRlclxuICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKVxuICAgICAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyID0gY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIuY2hhcmFjdGVycztcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBkZWZhdWx0cyB0byB0aGUgY29sdW1uSWRlbnRpZmllciBvciByb3dJZGVudGlmaWVyICh3aGVuIHRoZXJlIGlzIG9ubHkgb25lIGNvbHVtbilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtbkhlYWRlciA9IGNvbHVtbklkZW50aWZpZXIgfHwgcm93SWRlbnRpZmllciB8fCBcIkNvbHVtblwiO1xuICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5WYWx1ZSA9IGZyb21Ob2RlLmZpbmRPbmUobm9kZSA9PiBub2RlLm5hbWUgPT0gdmFsdWVUZXh0TGF5ZXIpO1xuICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUpXG4gICAgICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5WYWx1ZSA9IGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUuY2hhcmFjdGVycztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtblZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAoY29sdW1uSXRlbS5jb2x1bW5WYWx1ZSkgPyBjb2x1bW5JdGVtIDogbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGl0ZW1zID0gW107XG4gICAgICAgIGxldCBrZXlzID0gW107XG4gICAgICAgIC8vIGdlbmVyYXRlIGxpc3Qgb2YgZXhwb3J0YWJsZSBpdGVtcyBmcm9tIHNlbGVjdGVkIHJvd3NcbiAgICAgICAgZm9yIChjb25zdCBbbm9kZUluZGV4LCBub2RlXSBvZiByb3dzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgbGV0IGhlYWRlcnMgPSBbXTtcbiAgICAgICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtID0ge307XG4gICAgICAgICAgICAvLyBnZXQgbGF5ZXJzIHRoYXQgd291bGQgcmVwcmVzZW50IHRoZSByb3cgY29sdW1uc1xuICAgICAgICAgICAgbGV0IGNvbHVtbnMgPSBub2RlLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IGNvbHVtbklkZW50aWZpZXIpO1xuICAgICAgICAgICAgaWYgKGNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5zaWRlIHRoZXNlIGNvbHVtbiBsYXllcnMsIGZpbmRzIGEgbGF5ZXIgdG8gYmUgdGhlIGhlYWRlciBvZiB0aGUgY29sdW1uIGFuZCBhbm90aGVyIHRvIGJlIGl0cyB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAvLyBlYWNoIGl0ZW0gbXVzdCBoYXZlIGEgaGVhZGVyIHByb3BlcnR5IGZvciB0aGUgZXhwb3J0IHdpdGggcGFwYSBwYXJzZSB0byB3b3JrXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpbmhhIGV4aWJpcsOhIG8gbm9tZSBkYSBjb2x1bmFcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbkl0ZW0gPSBnZXRDb2x1bW5Gcm9tTm9kZShjb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcl0gPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXlzLmluY2x1ZGVzKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSBjb2x1bW4gYW5kIHNlYXJjaCB0aGUgdmFsdWUgZGlyZWN0bHkgZnJvbSB0aGUgcm93IG5vZGVcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5JdGVtID0gZ2V0Q29sdW1uRnJvbU5vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcl0gPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWtleXMuaW5jbHVkZXMoY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpKVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbm9kZVRoaXMgPSB0aGlzO1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGN1c3RvbSBjb2x1bW5zLCByZW5kZXIgdGhlbSBhbmQgYXBwZW5kIHRvIGl0ZW0gb2JqZWN0XG4gICAgICAgICAgICBpZiAobGF5ZXJOYW1lcy5jdXN0b21Db2x1bW5zICYmIGxheWVyTmFtZXMuY3VzdG9tQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsYXllck5hbWVzLmN1c3RvbUNvbHVtbnMuZm9yRWFjaCgoY3VzdG9tQ29sdW1uLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXN0b21Db2x1bW5WYWx1ZSA9IGN1c3RvbUNvbHVtbi52YWx1ZSwgY3VzdG9tQ29sdW1uTmFtZSA9IGN1c3RvbUNvbHVtbi5oZWFkZXIgfHwgYGN1c3RvbUNvbHVtbiR7aSArIDF9YDtcbiAgICAgICAgICAgICAgICAgICAgLy8gdmFsdWUgaGFzICR7fSBzeW50YXhcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1c3RvbUNvbHVtblZhbHVlLm1hdGNoKC8oPzw9XFwkXFx7KSguKj8pKD89XFx9KS9nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGVhY2ggJHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdmFycyA9IGN1c3RvbUNvbHVtblZhbHVlLm1hdGNoKC8oPzw9eykoLio/KSg/PVxcfSkvZykubWFwKCh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgJHt9IGhhcyBub2RlLSoqKiBzeW50YXgsIHVzZSB0aGUgc3VmZml4IHRvIHVzZSBhIHByb3BlcnR5IGZyb20gbm9kZSBvYmplY3QsIGxpa2UgaWQsIG5hbWUsIHgsIHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi5tYXRjaCgvKD88PW5vZGVcXC0pKC4qKS9naSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlW3YubWF0Y2goLyg/PD1ub2RlXFwtKSguKikvZ2kpWzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAke2luZGV4fSwgaW5qZWN0IG5vZGUgaW5kZXggKyAxIChyb3cgbGluZSBjb3VudGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYgPT0gXCJpbmRleFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZUluZGV4ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh2Lm1hdGNoKC91cmwvaSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGVVUkkoYGh0dHBzOi8vd3d3LmZpZ21hLmNvbS9maWxlLyR7ZmlnbWEuZmlsZUtleX0vJHtmaWdtYS5yb290Lm5hbWV9P25vZGUtaWQ9JHtub2RlLmlkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGVuYWJsZSBtYXRoIG9wZXJhdGlvbnMgb3Igc29tZXRoaW5nIGxpa2UgdGhhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNvbHVtblZhbHVlID0gY3VzdG9tQ29sdW1uVmFsdWUucmVwbGFjZSgvXFwkKHspKC4qPykoXFx9KS9nLCB2YXJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdGVtW2N1c3RvbUNvbHVtbk5hbWVdID0gY3VzdG9tQ29sdW1uVmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhZGQgdG8gbGlzdCBvbmx5IGlmIGl0cyBub3QgZW1wdHlcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhpdGVtKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtYWtlIHN1cmUgYWxsIGl0ZW1zIGhhdmUgYWxsIGtleXMgKGV2ZW4gaWYgZW1wdHkpXG4gICAgICAgIC8vIHNvIHRoYXQgcGFwYSBwYXJzZSBjYW4gZXhwb3J0IGFsbCBjb2x1bW5zXG4gICAgICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW1ba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaXRlbVtrZXldID0gXCJcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJObyByb3dzIGZvdW5kLiBUcnkgZG91YmxlIGNoZWNraW5nIHlvdXIgaWRlbnRpZmllcnMgYW5kIGxheWVyIG5hbWVzLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBwYXNzZXMgdGhlIG9iamVjdCBhcnJheSBiYWNrIHRvIHRoZSBVSSB0byBiZSBwYXJzZWQgd2l0aCBwYXBhIHBhcnNlIGFuZCBkb3dubG9hZGVkXG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImRvd25sb2FkXCIsXG4gICAgICAgICAgICBcIml0ZW1zXCI6IGl0ZW1zXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB0byBjbG9zZSB0aGUgcGx1Z2luIHdoZW4geW91J3JlIGRvbmUuIE90aGVyd2lzZSB0aGUgcGx1Z2luIHdpbGxcbiAgICAvLyBrZWVwIHJ1bm5pbmcsIHdoaWNoIHNob3dzIHRoZSBjYW5jZWwgYnV0dG9uIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbi5cbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufTtcbiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0ge307XG5fX3dlYnBhY2tfbW9kdWxlc19fW1wiLi9zcmMvY29kZS50c1wiXSgpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==