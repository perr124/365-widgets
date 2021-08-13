import { Selector } from "testcafe";

fixture`My fixture`.page`https://localhost:3000`;

test("Check uploaded files", async (t) => {
  await t
    .setFilesToUpload("#file-input", ["../../readings.txt"])
    .click("#start-eval");
});
