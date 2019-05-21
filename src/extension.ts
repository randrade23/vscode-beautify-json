import * as stripComments from "strip-json-comments";

import {
  commands,
  ExtensionContext,
  Position,
  Range,
  Selection,
  window,
} from "vscode";

// tslint:disable-next-line:no-var-requires
const jsonlint = require("jsonlint");

const LINE_SEPARATOR = /\n|\r\n/;

// TODO: make this configurable.
const JSON_SPACE = 4;

export function activate(context: ExtensionContext) {

  const disposable = commands.registerCommand("extension.beautifyJSON", () => {

    const editor = window.activeTextEditor;

    if (!editor) {
      return;
    }

    const raw = editor.document.getText();
    let json = null;

    try {
      json = jsonlint.parse(stripComments(raw));
    } catch (jsonLintError) {

      return;
    }

    const pretty = JSON.stringify(json, null, JSON_SPACE);

    editor.edit((builder) => {
      const start = new Position(0, 0);
      const lines = raw.split(LINE_SEPARATOR);
      const end = new Position(lines.length, lines[lines.length - 1].length);
      const allRange = new Range(start, end);
      builder.replace(allRange, pretty);
    }).then((success) => {
      if (success) {
          // Deselect and move cursor to top
          const position = editor.selection.active;
          const newPosition = position.with(0, 0);
          const newSelection = new Selection(newPosition, newPosition);
          editor.selection = newSelection;
      }
    });

  });

  context.subscriptions.push(disposable);
}
