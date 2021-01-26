const axios = require("axios");
const common = require('./common');
const token = process.env.CG163_TOKEN;

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
            console.log("token未失效,即将开始签到...")
            desc.push("token未失效,即将开始签到...")
            ckStatus = 1
        } catch (err) {
            console.log("token已失效")
            desc.push("token已失效")
            ckStatus = 0
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
            console.log("签到成功")
            desc.push("签到成功")
        } catch (err) {
            console.log("签到失败,已签到过或其它未知原因")
            desc.push("签到失败,已签到过或其它未知原因")
        }
        resolve()
    })
}

async function start() {
    ckStatus = 0
    await check()
    if (ckStatus === 1) {
        await sign()
    }
    desc = desc.join('\n\n');
    await common.sendMessage('网易云游戏', desc);
}

start();