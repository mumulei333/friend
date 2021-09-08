import { Application } from "typedoc";

const app = new Application();

app.bootstrap({
    exclude: [],
    plugin: ["typedoc-plugin-markdown"]
})