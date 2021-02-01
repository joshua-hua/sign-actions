const axios = require("axios");
const common = require('./common');
const token = process.env.CG163_TOKEN;

const title = '网易云游戏'
let desc = []
let ckStatus;

const header = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
        'Authorization': `${token}`
    }
};

// 检查token
function check() {
    return new Promise(async resolve => {
        try {
            const url = `https://n.cg.163.com/api/v2/users/@me`
            let res = await axios.get(url, header)
            ckStatus = 1
            log("token未失效,即将开始签到...")
        } catch (err) {
            ckStatus = 0
            log("token已失效")
        }
        resolve()
    })
}

// 签到
function sign() {
    return new Promise(async resolve => {
        try {
            const url = `https://n.cg.163.com/api/v2/sign-today`
            let res = await axios.post(url, "", header)
            log("签到成功")
        } catch (err) {
            log("签到失败,已签到过或其它未知原因")
        }
        resolve()
    })
}

function log(text) {
    console.log(text)
    desc.push(text)
}

async function start() {
    ckStatus = 0
    await check()
    if (ckStatus === 1) {
        await sign()
    }
    desc = desc.join('\n');
    await common.sendMessage(title, desc);
}

start();