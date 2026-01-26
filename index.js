import chokidar from "chokidar";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { exec } from "child_process";

import { realpathSync } from "fs";

const watchPath = realpathSync(process.env.WATCH_DIRECTORY);
const watcher = chokidar.watch(watchPath, {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  },
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
  formData.append("access_token", `${process.env.TOKEN}`);
  const file = readFileSync(path);
  formData.append("imagedata", new Blob([file], { type: "image/png" }), {
    filename: path,
  });
  return formData;
};

const uploadToGyazo = async (path) => {
  try {
    const response = await fetch(`https://upload.gyazo.com/api/upload`, {
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
  if (!process.env.WATCH_DIRECTORY) {
    console.error('WATCH_DIRECTORY is not set in .env');
    return;
  }
  
  console.log(`Watching: ${watchPath}`);
  
  watcher.on("add", async (event, _) => {
    const data = await uploadToGyazo(event);
    if (data?.url) {
      console.log(`Uploaded: ${data.url}`);
      exec(`wl-copy ${data.url}`);
    }
  });
};

run();
