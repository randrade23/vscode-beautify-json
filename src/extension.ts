import { ExtensionContext } from "vscode";

import { beautifyJSON } from "./commands";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(beautifyJSON);
}
