import * as stripComments from "strip-json-comments";

import {
    commands,
    ExtensionContext,
    Position,
    Range,
    Selection,
    window,
    workspace,
} from "vscode";

// tslint:disable-next-line:no-var-requires
const jsonlint = require("jsonlint");

const LINE_SEPARATOR = /\n|\r\n/;
const DEFAULT_JSON_SPACE = 4;

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

        const vscodeConfig = workspace.getConfiguration("editor");
        const tabSize = vscodeConfig.get("tabSize", DEFAULT_JSON_SPACE);
        const pretty = JSON.stringify(json, null, tabSize);

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
