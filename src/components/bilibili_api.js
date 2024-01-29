import { getClient, Body, ResponseType } from '@tauri-apps/api/http';
import { getCookie, getCsrf } from './cookie.js';

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
const ORIGIN = "https://live.bilibili.com";

export async function isLogin() {
  const cookie = await getCookie();
  const client = await getClient();
  const requestOptions = {
    headers: {
      "User-Agent": USER_AGENT,
      "Origin": ORIGIN,
      "Cookie": cookie,
    },
    // in this case the server returns a simple string
    responseType: ResponseType.JSON,
  };
  let response = await client.get('https://api.bilibili.com/x/web-interface/nav', requestOptions);
  return response.data.data.isLogin;
}


export async function postDanmu(damnu, roomId) {
  console.log('开始发送弹幕，内容为 ' + damnu);
  const cookie = await getCookie();
  const csrf = await getCsrf();
  const client = await getClient();
  const requestBody = Body.form({
    bubble: '0',
    msg: damnu,
    color: '16777215',
    mode: '1',
    room_type: '0',
    jumpfrom: '0',
    fontsize: '25',
    rnd: Date.now().toString(),
    roomid: roomId,
    csrf: csrf,
    csrf_token: csrf,
  });
  const requestOptions = {
    headers: {
      "User-Agent": USER_AGENT,
      "Origin": ORIGIN,
      "Cookie": cookie,
    },
    // in this case the server returns a simple string
    responseType: ResponseType.JSON,
  };
  const response = await client.post('https://api.live.bilibili.com/msg/send', requestBody, requestOptions);
  console.log(response.status);
  console.log(response.data);
}