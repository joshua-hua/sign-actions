const axios = require("axios");
const common = require('./common');
const cookie = process.env.CSDN_COOKIE;

const title = 'CSDN';
let signStatus = false;
let luckStatus = false;
let desc = [];

const header = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
        'Cookie': `${cookie}`
    }
};

// 签到
function sign() {
    return new Promise(async resolve => {
        try {
            let url = 'https://me.csdn.net/api/LuckyDraw_v2/signIn'
            let res = await axios.get(url, header)
            if (res.data.code === 200 && res.data.data && res.data.data.msg) {
                signStatus = true;
                log(`[签到]${res.data.data.msg}`)
            } else {
                log(`[签到]${res.data}`)
            }
        } catch (err) {
            log(`[签到]${err.response.data.message}`)
        }
        resolve()
    })
}

// 抽奖
function luck() {
    return new Promise(async resolve => {
        try {
            let url = 'https://me.csdn.net/api/LuckyDraw_v2/goodluck'
            let res = await axios.get(url, header)
            if (res.data.code === 200 && res.data.data && res.data.data.msg) {
                luckStatus = true;
                log(`[抽奖]${res.data.data.msg}`)
            } else {
                log(`[抽奖]${res.data}`)
            }
        } catch (err) {
            log(`[抽奖]${err.response.data.message}`)
        }
        resolve()
    })
}

function log(text) {
    console.log(text)
    desc.push(text)
}

// 发送消息
function message() {
    return new Promise(async (resolve) => {
        desc = desc.join('\n');
        await common.sendMessage(title, desc);
        resolve()
    })
}

!(async () => {
    await sign()
    await luck()
    await message()
})().catch((e) => console.log(e))