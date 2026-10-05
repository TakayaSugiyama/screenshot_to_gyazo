import dotenv from "dotenv";
import { realpathSync } from "fs";

dotenv.config({
  path: "./.env",
});

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set in .env`);
    process.exit(1);
  }
  return value;
};

const config = Object.freeze({
  token: requireEnv("TOKEN"),
  watchDirectory: realpathSync(requireEnv("WATCH_DIRECTORY")),
  appName: process.env.APP_NAME ?? "screenshot_to_gyazo",
  uploadUrl: "https://upload.gyazo.com/api/upload",
  awaitWriteFinish: Object.freeze({
    stabilityThreshold: 2000,
    pollInterval: 100,
  }),
});

export default config;
