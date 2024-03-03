import { appConfigDir, resolve } from '@tauri-apps/api/path'
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { createDir } from '@tauri-apps/api/fs';

let cachedConfig = {};

async function getConfigPath() {
  const configDir = await appConfigDir();
  return await resolve(configDir, "config.json");
}

export async function loadConfig() {
  const configPath = await getConfigPath();
  const configExist = await exists(configPath);
  if (!configExist) {
    cachedConfig = {};
    return cachedConfig;
  }
  const configJSON = await readTextFile(configPath);
  cachedConfig = JSON.parse(configJSON);
  return cachedConfig;
}

export async function saveConfig(configObj) {
  const configDir = await appConfigDir();
  const configDirExist = await exists(configDir);
  if (!configDirExist) {
    await createDir(configDir);
  }
  cachedConfig = configObj;
  const configJSON = JSON.stringify(configObj, null, 2);
  const configPath = await getConfigPath();
  await writeTextFile({ path: configPath, contents: configJSON });
}

export async function getConfig(configName) {
  if (cachedConfig[configName])
    return cachedConfig[configName];
  const config = await loadConfig();
  return config[configName];
}

export async function getRoomid() {
  return getConfig('roomid');
}

export async function getFgColor() {
  return getConfig('container_fg_color');
}

export async function getBgColor() {
  return getConfig('container_bg_color');
}

export async function getWindowColor() {
  return getConfig('window_bg_color');
}

export async function getFontColor() {
  return getConfig('font_color');
}
