import chokidar from "chokidar";
import { readFileSync } from "fs";
import { exec } from "child_process";
import config from "./config.js";

const watcher = chokidar.watch(config.watchDirectory, {
  ignoreInitial: true,
  awaitWriteFinish: config.awaitWriteFinish,
  persistent: true,
});

watcher.on('ready', () => {
  console.log('File watcher is ready');
});

watcher.on('error', (error) => {
  console.error('File watcher error:', error);
});

const buildFormData = (path) => {
  const formData = new FormData();
  formData.append("access_token", config.token);
  formData.append("app", config.appName);
  const file = readFileSync(path);
  formData.append("imagedata", new Blob([file], { type: "image/png" }), {
    filename: path,
  });
  return formData;
};

const uploadToGyazo = async (path) => {
  try {
    const response = await fetch(config.uploadUrl, {
      method: "POST",
      body: buildFormData(path),
    });
    
    if (!response.ok) {
      console.error(`Gyazo upload error: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Upload failed:`, error.message);
    return null;
  }
};

const run = () => {
  console.log(`Watching: ${config.watchDirectory}`);
  
  watcher.on("add", async (event, _) => {
    const data = await uploadToGyazo(event);
    if (data?.url) {
      console.log(`Uploaded: ${data.url}`);
      exec(`wl-copy ${data.url}`);
    }
  });
};

run();
