const axios = require("axios");
const common = require('./common');
const cookie = process.env.SMZDM_COOKIE;

const header = {
    headers: {
        Referer: "https://www.smzdm.com/",
        Host: "zhiyou.smzdm.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36",
        cookie: `'${cookie}'`
    },
};

function sign() {
    return new Promise(async (resolve) => {
        let data;
        try {
            let url = `https://zhiyou.smzdm.com/user/checkin/jsonp_checkin?callback=jQuery112403621672099300297_${new Date().getTime()}&_=${new Date().getTime()}`;
            let res = await axios.get(url, header);
            console.log(res)
            if (res.data.error_code === 0) {
                data = `签到成功!\n签到天数: ${res.data.data.checkin_num} | Lv:${res.data.data.rank} | 经验值:${res.data.data.exp}`
            } else {
                data = res.data.error_msg
            }
            console.log(data);
            await common.sendMessage("什么值得买", data);
        } catch (e) {
            console.log(e);
        }
        resolve();
    });
}

sign();