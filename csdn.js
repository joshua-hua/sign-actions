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
                console.log(res.data.data.msg)
                signStatus = true;
                desc.push(`${res.data.data.msg}`)
            } else {
                console.log(res.data)
                desc.push(`${res.data}`)
            }
        } catch (err) {
            console.log("操作失败" + err.response.data.message)
            desc.push(`${err}`)
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
                console.log(res.data.data.msg)
                luckStatus = true;
                desc.push(`${res.data.data.msg}`)
            } else {
                console.log(res.data)
                desc.push(`${res.data}`)
            }
        } catch (err) {
            console.log("操作失败" + err.response.data.message)
            desc.push(`${err}`)
        }
        resolve()
    })
}

// 发送消息
function message() {
    return new Promise(async (resolve) => {
        let signTitle = `${signStatus ? '🟢' : '🔴'}签到`;
        let luckTitle = `${luckStatus ? '🟢' : '🔴'}抽奖`;
        await common.sendMessage(signTitle + luckTitle, desc);
        resolve()
    })
}

!(async () => {
    await sign()
    await luck()
    await message()
})().catch((e) => console.log(e))