const axios = require("axios");
const common = require('./common');
const cookie = process.env.CSDN_COOKIE;

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
                console.log(`[签到]${res.data.data.msg}`)
                signStatus = true;
                desc.push(`[签到]${res.data.data.msg}`)
            } else {
                console.log(`[签到]${res.data}`)
                desc.push(`[签到]${res.data}`)
            }
        } catch (err) {
            console.log(`[签到]${err.response.data.message}`)
            desc.push(`[签到]${err.response.data.message}`)
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
                console.log(`[抽奖]${res.data.data.msg}`)
                luckStatus = true;
                desc.push(`[抽奖]${res.data.data.msg}`)
            } else {
                console.log(`[抽奖]${res.data}`)
                desc.push(`[抽奖]${res.data}`)
            }
        } catch (err) {
            console.log(`[抽奖]${err.response.data.message}`)
            desc.push(`[抽奖]${err.response.data.message}`)
        }
        resolve()
    })
}

// 发送消息
function message() {
    return new Promise(async (resolve) => {
        desc = desc.join('\n\n');
        await common.sendMessage('CSDN签到抽奖', desc);
        resolve()
    })
}

!(async () => {
    await sign()
    await luck()
    await message()
})().catch((e) => console.log(e))