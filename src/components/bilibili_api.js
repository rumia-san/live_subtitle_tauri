import { getClient, Body, ResponseType } from '@tauri-apps/api/http';
import { getCookie, getCsrf } from './cookie.js';

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
const ORIGIN = "https://live.bilibili.com";

/* 下面的api文档来自 https://github.com/SocialSisterYi/bilibili-API-collect */
/* 判断是否登录，返回示例
{
    "code": -101,
    "message": "账号未登录",
    "ttl": 1,
    "data": {
        "isLogin": false,
        "wbi_img": {
            "img_url": "https://i0.hdslb.com/bfs/wbi/653657f524a547ac981ded72ea172057.png",
            "sub_url": "https://i0.hdslb.com/bfs/wbi/6e4909c702f846728e64f6007736a338.png"
        },
    }
}
*/
export async function isLogin() {
  const cookie = await getCookie();
  const client = await getClient();
  const requestOptions = {
    headers: {
      "User-Agent": USER_AGENT,
      "Origin": ORIGIN,
      "Cookie": cookie,
    },
    responseType: ResponseType.JSON,
  };
  let response = await client.get('https://api.bilibili.com/x/web-interface/nav', requestOptions);
  return response.data.data.isLogin;
}


//发送弹幕
export async function postDanmu(damnu, roomId) {
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
    responseType: ResponseType.JSON,
  };
  const response = await client.post('https://api.live.bilibili.com/msg/send', requestBody, requestOptions);
  const { code, message } = response.data;
  return { code, message };
}

/* 生成登录二维码，返回示例
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "url": "https://passport.bilibili.com/h5-app/passport/login/scan?navhide=1\u0026qrcode_key=8587cf8106a0b863c46d6bab913537f6\u0026from=",
        "qrcode_key": "8587cf8106a0b863c46d6bab913537f6"
    }
}
*/
export async function generateLoginQRCode() {
  const client = await getClient();
  const requestOptions = {
    headers: {
      "User-Agent": USER_AGENT,
      "Origin": ORIGIN,
    },
    responseType: ResponseType.JSON,
  };
  const response = await client.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate', requestOptions);
  const responseBody = response.data;
  const { code, data } = responseBody;
  const { url, qrcode_key } = data;
  return { code, url, qrcode_key };
}

function parseSetCookie(setCookieHeader) {
  if (!setCookieHeader) return '';
  const cookies = setCookieHeader.split(';');
  return cookies[0] + ';';
}

/* 轮询扫码结果
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "url": "",
        "refresh_token": "",
        "timestamp": 0,
        "code": 86090,
        "message": "二维码已扫码未确认"
    }
}
0：扫码登录成功
86038：二维码已失效
86090：二维码已扫码未确认
86101：未扫码
*/
export async function pollLoginQRCode(qrcode_key) {
  const client = await getClient();
  const requestOptions = {
    headers: {
      "User-Agent": USER_AGENT,
      "Origin": ORIGIN,
    },
    responseType: ResponseType.JSON,
    query: {
      "qrcode_key": qrcode_key,
    }
  };
  const response = await client.get('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', requestOptions);
  const { rawHeaders, data } = response;
  const { code, message } = data.data;
  const setCookieHeaders = rawHeaders['set-cookie'] || [];
  const cookie = setCookieHeaders.map(parseSetCookie).join(' ');
  return { code, message, cookie };
}

/* 登出
{
  "code": 0,
  "status": true,
  "ts": 1663034005,
  "data": {
    "redirectUrl": "https://passport.biligame.com/crossDomain?DedeUserID=&DedeUserID__ckMd5=&SESSDATA=&bili_jct=&gourl=javascript%3Ahistory.go%28-1%29"
  }
}
*/
export async function logout() {
  const client = await getClient();
  const cookie = await getCookie();
  const requestOptions = {
    headers: {
      "User-Agent": USER_AGENT,
      "Origin": ORIGIN,
      "Cookie": cookie,
    },
    // 只能说B站的接口真是逆天设计，未登录状态这个接口居然会返回http页面，这里我不管解析失败的异常了
    responseType: ResponseType.JSON,
  };
  const csrf = await getCsrf();
  const requestBody = Body.form({
    biliCSRF: csrf
  });
  const response = await client.post('https://passport.bilibili.com/login/exit/v2', requestBody, requestOptions);
  const { code, status, message } = response.data;
  return { code, status, message };
}
