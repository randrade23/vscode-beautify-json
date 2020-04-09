import * as stripComments from "strip-json-comments";
import { commands, Position, Range, Selection, window, workspace } from "vscode";
// tslint:disable-next-line:no-var-requires
const jsonlint = require("jsonlint");

const LINE_SEPARATOR = /\n|\r\n/;
const DEFAULT_JSON_SPACE = 4;

function beautify() {
    const editor = window.activeTextEditor;

    if (!editor) {
        window.showErrorMessage("You need to open a file first... :-)");
        return;
    }

    const raw = editor.document.getText();
    let json = null;

    try {
        json = jsonlint.parse(stripComments(raw));
    } catch (jsonLintError) {
        window.showErrorMessage(`Failed to beautify JSON: ${jsonLintError}`);
        return;
    }

    const vscodeConfig = workspace.getConfiguration("editor");
    const tabSize = vscodeConfig.get("tabSize", DEFAULT_JSON_SPACE);
    const pretty = JSON.stringify(json, null, tabSize);

    editor.edit((builder) => {
        // Select and replace
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
}

export const beautifyJSON = commands.registerCommand("extension.beautifyJSON", beautify);
