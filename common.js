const axios = require("axios");
const sckey = process.env.SCKEY;
const UTC8 = new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000;

// 发送消息通知
exports.sendMessage = function (title, content) {
    return new Promise(async (resolve) => {
        try {
            let url = `https://sc.ftqq.com/${sckey}.send`
            let res = await axios.post(url, `text=${title}&desp=${content}`)
            if (res.data.errmsg == 'success') {
                console.log('server酱:发送成功')
            } else {
                console.log('server酱:发送失败')
                console.log(res.data)
            }
        } catch (err) {
            console.log('server酱:发送失败')
        }
        resolve();
    });
}

// 时间格式化
exports.timeNow = function () {
    let date = new Date(UTC8);
    return date.getFullYear() + '年' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '月' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()) + '日';
}