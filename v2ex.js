const axios = require("axios");
const common = require('./common');
const cookie = process.env.V2EXCK;
const header = {
    headers: {
        'Referer': 'https://www.v2ex.com/mission',
        'Host': 'www.v2ex.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
        'Cookie': `${cookie}`
    }
};

const title = 'V2EX'
let desc = [common.timeNow()]
let once = null;
let signStatus = 0;

// 获取once检查是否已签到
function check() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.v2ex.com/mission/daily";
            let res = await axios.get(url, header);
            let reg1 = /需要先登录/;
            if (reg1.test(res.data)) {
                log("cookie失效")
            } else {
                let reg = /每日登录奖励已领取/;
                if (reg.test(res.data)) {
                    log("今天已经签到过啦")
                    signStatus = 1;
                } else {
                    reg = /redeem\?once=(.*?)'/;
                    once = res.data.match(reg)[1];
                    log(`获取成功 once:${once}`)
                }
            }
        } catch (e) {
            log(e)
        }
        resolve();
    });
}

// 每日签到
function daily() {
    return new Promise(async (resolve) => {
        try {
            let url = `https://www.v2ex.com/mission/daily/redeem?once=${once}`;
            let res = await axios.get(url, header);
            let reg = /已成功领取每日登录奖励/;
            if (reg.test(res.data)) {
                log("签到成功");
                signStatus = 1;
            } else {
                log("签到失败");
            }
        } catch (e) {
            log(e);
        }
        resolve();
    });
}

// 查询余额
function balance() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.v2ex.com/balance";
            let res = await axios.get(url, header);
            let reg = /\d+?\s的每日登录奖励\s\d+\s铜币/;
            log(res.data.match(reg)[0]);
        } catch (e) {
            log(e)
        }
        resolve();
    });
}

function log(text) {
    console.log(text)
    desc.push(text)
}

function sign() {
    return new Promise(async (resolve) => {
        try {
            if (!cookie) {
                log("你的cookie呢！！！")
                return;
            }
            await check();
            if (once && signStatus === 0) {
                await daily();
                await balance();
                if (signStatus === 0) {
                    log("签到失败")
                }
            }
        } catch (e) {
            log(e)
        } finally {
            desc = desc.join('\n')
            await common.sendMessage(title, desc);
        }
        resolve();
    });
}

sign();