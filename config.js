import { readFileSync, realpathSync } from "fs";
import { parse } from "yaml";

const CONFIG_PATH = "./config.yml";

const loadConfigFile = () => {
  try {
    return parse(readFileSync(CONFIG_PATH, "utf8")) ?? {};
  } catch (error) {
    console.error(`Failed to load ${CONFIG_PATH}:`, error.message);
    process.exit(1);
  }
};

const raw = loadConfigFile();

const requireKey = (name) => {
  const value = raw[name];
  if (!value) {
    console.error(`${name} is not set in ${CONFIG_PATH}`);
    process.exit(1);
  }
  return value;
};

const config = Object.freeze({
  token: requireKey("token"),
  watchDirectory: realpathSync(requireKey("watch_directory")),
  appName: raw.app_name ?? "screenshot_to_gyazo",
  uploadUrl: "https://upload.gyazo.com/api/upload",
  awaitWriteFinish: Object.freeze({
    stabilityThreshold: 2000,
    pollInterval: 100,
  }),
});

export default config;
