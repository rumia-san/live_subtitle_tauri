import { appCacheDir, resolve } from '@tauri-apps/api/path'
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { createDir } from '@tauri-apps/api/fs';

let cachedCookie = '';
let cachedCsrf = '';

function clearCacheVariables() {
  cachedCookie = '';
  cachedCsrf = '';
}

clearCacheVariables();

async function getCookiePath() {
  const cacheDir = await appCacheDir();
  const cookiePath = await resolve(cacheDir, "cookie");
  return cookiePath;
}

async function ensureCookiePath() {
  const cacheDir = await appCacheDir();
  const cacheDirExist = await exists(cacheDir);
  if (!cacheDirExist) {
    await createDir(cacheDir);
  }
  const cookiePath = await getCookiePath();
  const cookieExist = await exists(cookiePath);
  if (!cookieExist) {
    await writeTextFile({ path: cookiePath, contents: '' });
  }
}

export async function getCookie() {
  if (cachedCookie) {
    return cachedCookie;
  }
  await ensureCookiePath();
  const cookiePath = await getCookiePath();
  cachedCookie = await readTextFile(cookiePath);
  return cachedCookie;
}

export async function getCsrf() {
  if (cachedCsrf) {
    return cachedCsrf;
  }
  const cookie = await getCookie();
  cachedCsrf = parseCsrf(cookie);
  return cachedCsrf;
}

function parseCsrf(cookie) {
  var regex = /bili_jct=([^\;]+)/;
  var match = cookie.match(regex);
  if (match) {
    return match[1];
  } else {
    console.log("Failed to get csrf from cookie");
    return '';
  }
}
