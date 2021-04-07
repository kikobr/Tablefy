# Tablefy
This is a Figma plugin that lets you turn your frames into tabular data.

# How to use
In Figma, you have to create a frame that can represent a row in a table. To do so, it must have groups/frames representing its columns and text layers representing that column value and header. The plugin knows which layers to read based on their names.

One way to do so would be to name your frames as follows:
Instance named "Row" (representing the row)
  - Group named "Column" (representing the column)
    - Layer named "Header" (representing column header)
    - Layer named "Value" (representing column value)
  - Group named "Column"
  - Group named "Column"

So, you run this plugin in fill the inputs with:
Row identifier: "Row"
Column identifier: "Column"
Header text layer: "Header"
Value text layer: "Value"

Be sure to keep those layer names consistent for the plugin to work.

---

# Running it on development
1. Download this repository to your computer.
2. Open Figma, open a file, right-click:
    - Plugins -> Development -> New Plugin
3. Select "Link to existing plugin" and select the manifest.json file from this repository.
