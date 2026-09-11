import "./styles.css";
import { render } from "preact";

import { App } from "./app";

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
};

const vscode = acquireVsCodeApi();

const root = document.getElementById("root");
const logoUri = root?.dataset.logoUri ?? "";

if (root) {
  render(<App vscode={vscode} logoUri={logoUri} />, root);
}
