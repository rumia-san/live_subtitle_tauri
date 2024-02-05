import { appCacheDir, resolve } from '@tauri-apps/api/path'
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { createDir } from '@tauri-apps/api/fs';

let cachedCookie = null;
let cachedCsrf = null;

async function getCookiePath() {
  const cacheDir = await appCacheDir();
  const cookiePath = await resolve(cacheDir, "cookie");
  return cookiePath;
}

export async function getCookie() {
  if (cachedCookie) {
    return cachedCookie;
  }
  const cookiePath = await getCookiePath();
  const cookieExist = await exists(cookiePath);
  if (!cookieExist) {
    return "";
  }
  cachedCookie = await readTextFile(cookiePath);
  return cachedCookie;
}

export async function saveCookie(cookie) {
  const cacheDir = await appCacheDir();
  const cacheDirExist = await exists(cacheDir);
  if (!cacheDirExist) {
    await createDir(cacheDir);
  }
  // 使用write through策略
  cachedCookie = cookie;
  cachedCsrf = parseCsrf(cookie);
  const cookiePath = await getCookiePath();
  await writeTextFile({path: cookiePath, contents: cookie});
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
