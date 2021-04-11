/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300, 298);
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
            columnItem.columnValue = fromNode.findOne(node => node.name == valueTextLayer).characters;
            return (columnItem.columnValue) ? columnItem : null;
        };
        let items = [];
        let keys = [];
        for (const node of rows) {
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9UYWJsZWZ5Ly4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBzaG93cyB0aGUgSFRNTCBwYWdlIGluIFwidWkuaHRtbFwiLlxuZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmZpZ21hLnVpLnJlc2l6ZSgzMDAsIDI5OCk7XG4vLyBDYWxscyB0byBcInBhcmVudC5wb3N0TWVzc2FnZVwiIGZyb20gd2l0aGluIHRoZSBIVE1MIHBhZ2Ugd2lsbCB0cmlnZ2VyIHRoaXNcbi8vIGNhbGxiYWNrLiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBwYXNzZWQgdGhlIFwicGx1Z2luTWVzc2FnZVwiIHByb3BlcnR5IG9mIHRoZVxuLy8gcG9zdGVkIG1lc3NhZ2UuXG5maWdtYS51aS5vbm1lc3NhZ2UgPSBtc2cgPT4ge1xuICAgIGlmIChtc2cudHlwZSA9PSBcImluaXRcIikge1xuICAgICAgICBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKFwibGF5ZXJOYW1lc1wiKS50aGVuKChzYXZlZE5hbWVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGF5ZXJOYW1lcyA9IHNhdmVkTmFtZXMgfHwge1xuICAgICAgICAgICAgICAgIHJvd0lkZW50aWZpZXI6IFwiSW5zdGFuY2VcIixcbiAgICAgICAgICAgICAgICBjb2x1bW5JZGVudGlmaWVyOiBcIkNvbHVtblwiLFxuICAgICAgICAgICAgICAgIGhlYWRlclRleHRMYXllcjogXCJUZXh0XCIsXG4gICAgICAgICAgICAgICAgdmFsdWVUZXh0TGF5ZXI6IFwiVGV4dFwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImluaXRcIixcbiAgICAgICAgICAgICAgICBcImxheWVyTmFtZXNcIjogbGF5ZXJOYW1lc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09IFwic2F2ZUxheWVyTmFtZXNcIikge1xuICAgICAgICBsZXQgbGF5ZXJOYW1lcyA9IG1zZy5sYXllck5hbWVzO1xuICAgICAgICBmaWdtYS5jbGllbnRTdG9yYWdlLnNldEFzeW5jKFwibGF5ZXJOYW1lc1wiLCBsYXllck5hbWVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChtc2cudHlwZSA9PSAnZG93bmxvYWQnKSB7XG4gICAgICAgIGxldCBsYXllck5hbWVzID0gbXNnLmxheWVyTmFtZXM7XG4gICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoXCJsYXllck5hbWVzXCIsIGxheWVyTmFtZXMpO1xuICAgICAgICBsZXQgcm93SWRlbnRpZmllciA9IGxheWVyTmFtZXMucm93SWRlbnRpZmllcjtcbiAgICAgICAgbGV0IGNvbHVtbklkZW50aWZpZXIgPSBsYXllck5hbWVzLmNvbHVtbklkZW50aWZpZXI7XG4gICAgICAgIGxldCBoZWFkZXJUZXh0TGF5ZXIgPSBsYXllck5hbWVzLmhlYWRlclRleHRMYXllcjtcbiAgICAgICAgbGV0IHZhbHVlVGV4dExheWVyID0gbGF5ZXJOYW1lcy52YWx1ZVRleHRMYXllcjtcbiAgICAgICAgbGV0IHJvd3MgPSBbXTtcbiAgICAgICAgLy8gdHJ5IHRvIGZpbmQgcm93cyBmcm9tIHNlbGVjdGlvbiBmb3IgcGVyZm9ybWFuY2UgcHVycG9zZXNcbiAgICAgICAgaWYgKGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2VsIG9mIGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBuYW1lIG9mIHRoZSBzZWxlY3RlZCBpdGVtIGlzIHRoZSBzYW1lIGFzIHRoZSByb3dpZGVudGlmaWVyLFxuICAgICAgICAgICAgICAgIC8vIGFkZCBpdCB0byB0aGUgcm93cyBsaXN0XG4gICAgICAgICAgICAgICAgaWYgKHNlbC5uYW1lID09PSByb3dJZGVudGlmaWVyKVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2goc2VsKTtcbiAgICAgICAgICAgICAgICByb3dzID0gcm93cy5jb25jYXQoc2VsLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IHJvd0lkZW50aWZpZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlcyBubyBzZWxlY3Rpb24sIGZhbGwgYmFjayB0byBmZXRjaGluZyByb3dzIGZyb20gdGhlIHBhZ2UgKHNsb3dlcilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvd3MgPSByb3dzLmNvbmNhdChmaWdtYS5jdXJyZW50UGFnZS5maW5kQWxsKG5vZGUgPT4gbm9kZS5uYW1lID09PSByb3dJZGVudGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdldENvbHVtbkZyb21Ob2RlID0gKGZyb21Ob2RlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29sdW1uSXRlbSA9IHt9O1xuICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIgPSBmcm9tTm9kZS5maW5kT25lKG5vZGUgPT4gbm9kZS5uYW1lID09IGhlYWRlclRleHRMYXllcik7XG4gICAgICAgICAgICAvLyBnZXQgdGhlIGxheWVyIHdpdGggdGhlIHNhbWUgc2FtZSBhcyBoZWFkZXJUZXh0TGF5ZXIgYW5kIHVzZSBpdHMgdmFsdWUgYXMgdGhlIGhlYWRlclxuICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKVxuICAgICAgICAgICAgICAgIGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyID0gY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIuY2hhcmFjdGVycztcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBkZWZhdWx0cyB0byB0aGUgY29sdW1uSWRlbnRpZmllciBvciByb3dJZGVudGlmaWVyICh3aGVuIHRoZXJlIGlzIG9ubHkgb25lIGNvbHVtbilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2x1bW5JdGVtLmNvbHVtbkhlYWRlciA9IGNvbHVtbklkZW50aWZpZXIgfHwgcm93SWRlbnRpZmllciB8fCBcIkNvbHVtblwiO1xuICAgICAgICAgICAgY29sdW1uSXRlbS5jb2x1bW5WYWx1ZSA9IGZyb21Ob2RlLmZpbmRPbmUobm9kZSA9PiBub2RlLm5hbWUgPT0gdmFsdWVUZXh0TGF5ZXIpLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICByZXR1cm4gKGNvbHVtbkl0ZW0uY29sdW1uVmFsdWUpID8gY29sdW1uSXRlbSA6IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBpdGVtcyA9IFtdO1xuICAgICAgICBsZXQga2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygcm93cykge1xuICAgICAgICAgICAgbGV0IGhlYWRlcnMgPSBbXTtcbiAgICAgICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtID0ge307XG4gICAgICAgICAgICAvLyBnZXQgbGF5ZXJzIHRoYXQgd291bGQgcmVwcmVzZW50IHRoZSByb3cgY29sdW1uc1xuICAgICAgICAgICAgbGV0IGNvbHVtbnMgPSBub2RlLmZpbmRBbGwobm9kZSA9PiBub2RlLm5hbWUgPT09IGNvbHVtbklkZW50aWZpZXIpO1xuICAgICAgICAgICAgaWYgKGNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5zaWRlIHRoZXNlIGNvbHVtbiBsYXllcnMsIGZpbmRzIGEgbGF5ZXIgdG8gYmUgdGhlIGhlYWRlciBvZiB0aGUgY29sdW1uIGFuZCBhbm90aGVyIHRvIGJlIGl0cyB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAvLyBlYWNoIGl0ZW0gbXVzdCBoYXZlIGEgaGVhZGVyIHByb3BlcnR5IGZvciB0aGUgZXhwb3J0IHdpdGggcGFwYSBwYXJzZSB0byB3b3JrXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpbmhhIGV4aWJpcsOhIG8gbm9tZSBkYSBjb2x1bmFcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbkl0ZW0gPSBnZXRDb2x1bW5Gcm9tTm9kZShjb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcl0gPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXlzLmluY2x1ZGVzKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSBjb2x1bW4gYW5kIHNlYXJjaCB0aGUgdmFsdWUgZGlyZWN0bHkgZnJvbSB0aGUgcm93IG5vZGVcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5JdGVtID0gZ2V0Q29sdW1uRnJvbU5vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVtjb2x1bW5JdGVtLmNvbHVtbkhlYWRlcl0gPSBjb2x1bW5JdGVtLmNvbHVtblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWtleXMuaW5jbHVkZXMoY29sdW1uSXRlbS5jb2x1bW5IZWFkZXIpKVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGNvbHVtbkl0ZW0uY29sdW1uSGVhZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhZGQgdG8gbGlzdCBvbmx5IGlmIGl0cyBub3QgZW1wdHlcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhpdGVtKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtYWtlIHN1cmUgYWxsIGl0ZW1zIGhhdmUgYWxsIGtleXMgKGV2ZW4gaWYgZW1wdHkpXG4gICAgICAgIC8vIHNvIHRoYXQgcGFwYSBwYXJzZSBjYW4gZXhwb3J0IGFsbCBjb2x1bW5zXG4gICAgICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW1ba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaXRlbVtrZXldID0gXCJcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJObyByb3dzIGZvdW5kLiBUcnkgZG91YmxlIGNoZWNraW5nIHlvdXIgaWRlbnRpZmllcnMgYW5kIGxheWVyIG5hbWVzLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBwYXNzZXMgdGhlIG9iamVjdCBhcnJheSBiYWNrIHRvIHRoZSBVSSB0byBiZSBwYXJzZWQgd2l0aCBwYXBhIHBhcnNlIGFuZCBkb3dubG9hZGVkXG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImRvd25sb2FkXCIsXG4gICAgICAgICAgICBcIml0ZW1zXCI6IGl0ZW1zXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB0byBjbG9zZSB0aGUgcGx1Z2luIHdoZW4geW91J3JlIGRvbmUuIE90aGVyd2lzZSB0aGUgcGx1Z2luIHdpbGxcbiAgICAvLyBrZWVwIHJ1bm5pbmcsIHdoaWNoIHNob3dzIHRoZSBjYW5jZWwgYnV0dG9uIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbi5cbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=