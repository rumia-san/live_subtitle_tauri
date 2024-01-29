import { appConfigDir, resolve } from '@tauri-apps/api/path'
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { createDir } from '@tauri-apps/api/fs';

let cachedConfig = {};

function clearCacheVariables() {
  cachedConfig = {};
}

clearCacheVariables();

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
    console.log('create dir ' + configDir);
    await createDir(configDir);
  }
  const configJSON = JSON.stringify(configObj, null, 2);
  const configPath = await getConfigPath();
  await writeTextFile({ path: configPath, contents: configJSON });
}

export async function getRoomid() {
  if (cachedConfig.roomid)
    return cachedConfig.roomid;
  const config = await loadConfig();
  return config.roomid;
}
