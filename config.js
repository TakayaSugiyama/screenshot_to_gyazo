import { execFileSync } from "child_process";
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

// "op://vault/item/field" 形式の値は 1Password CLI で解決する
const resolveSecret = (name, value) => {
  if (typeof value !== "string" || !value.startsWith("op://")) {
    return value;
  }
  try {
    return execFileSync("op", ["read", "--no-newline", value], {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    });
  } catch (error) {
    console.error(
      `Failed to resolve ${name} from 1Password:`,
      error.stderr?.trim() || error.message,
    );
    process.exit(1);
  }
};

const raw = Object.fromEntries(
  Object.entries(loadConfigFile()).map(([name, value]) => [
    name,
    resolveSecret(name, value),
  ]),
);

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
