import { Selector } from "testcafe";
// import * from './readings'

fixture`My fixture`.page`https://localhost:3000`;

test("Check uploaded files", async (t) => {
  await t
    .setFilesToUpload("#file-input", ["../../readings.js"])
    .click("#start-eval");
});
