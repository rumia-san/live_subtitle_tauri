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
    // in this case the server returns a simple string
    responseType: ResponseType.JSON,
  };
  let response = await client.get('https://api.bilibili.com/x/web-interface/nav', requestOptions);
  return response.data.data.isLogin;
}


//发送弹幕
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
    // in this case the server returns a simple string
    responseType: ResponseType.JSON,
  };
  let response = await client.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate', requestOptions);
  if (response.data && response.data.code === 0) {
    const { url, qrcode_key } = response.data.data;
    return { url, qrcode_key };
  } else {
    return null;
  }
}