import chokidar from "chokidar";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { exec } from "child_process";

const watcher = chokidar.watch(process.env.WATCH_DIRECTORY, {
  ignoreInitial: true,
  awaitWriteFinish: true,
});

const buildFormData = (path) => {
  const formData = new FormData();
  formData.append("access_token", `${process.env.TOKEN}`);
  const file = readFileSync(path);
  formData.append("imagedata", new Blob([file], { type: "image/png" }), {
    filename: path,
  });
  return formData;
};

const uploadToGyazo = async (path) => {
  const data = await fetch(`https://upload.gyazo.com/api/upload`, {
    method: "POST",
    body: buildFormData(path),
  });
  return data.json();
};

const run = () => {
  watcher.on("add", async (event, _) => {
    const data = await uploadToGyazo(event);
    if (!data?.url) return;

    exec(`wl-copy ${data.url}`);
  });
};

run();
