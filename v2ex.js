const axios = require("axios");
const common = require('./common');
const cookie = process.env.V2EXCK;

once = null;
ckstatus = 1;
signstatus = 0;
notice = common.timeNow() + "\n";

const header = {
    headers: {
        'Referer': 'https://www.v2ex.com/mission',
        'Host': 'www.v2ex.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
        'Cookie': `${cookie}`
    }
};

//获取once检查是否已签到
function check() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.v2ex.com/mission/daily";
            let res = await axios.get(url, header);
            reg1 = /需要先登录/;
            if (reg1.test(res.data)) {
                console.log("cookie失效");
                ckstatus = 0;
                notice += "cookie失效";
            } else {
                reg = /每日登录奖励已领取/;
                if (reg.test(res.data)) {
                    notice += "今天已经签到过啦\n";
                    signstatus = 1;
                } else {
                    reg = /redeem\?once=(.*?)'/;
                    once = res.data.match(reg)[1];
                    console.log(`获取成功 once:${once}`);
                }
            }
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

//每日签到
function daily() {
    return new Promise(async (resolve) => {
        try {
            let url = `https://www.v2ex.com/mission/daily/redeem?once=${once}`;
            let res = await axios.get(url, header);
            reg = /已成功领取每日登录奖励/;
            if (reg.test(res.data)) {
                notice += "签到成功\n";
                signstatus = 1;
            } else {
                notice += "签到失败\n";
            }
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

//查询余额
function balance() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.v2ex.com/balance";
            let res = await axios.get(url, header);
            reg = /\d+?\s的每日登录奖励\s\d+\s铜币/;
            notice += res.data.match(reg)[0];
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

function sign() {
    return new Promise(async (resolve) => {
        try {
            if (!cookie) {
                console.log("你的cookie呢！！！");
                return;
            }
            await check();
            if (once && signstatus == 0) {
                await daily();
                await balance();
                if (signstatus == 0) {
                    console.log("签到失败")
                }
            }
            console.log(notice);
            common.sendMessage("v2ex签到", notice);
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

sign();