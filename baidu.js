const axios = require("axios");
const common = require('./common');
const cookie = process.env.BDCK

CFG_isOrderBars = 'false' // 1: 经验排序, 2: 连签排序
CFG_maxShowBars = 50 //每次通知数量
CFG_maxSignBars = 5 // 每次并发执行多少个任务
CFG_signWaitTime = 5000 // 每次并发间隔时间 (毫秒)

bars = []
tieba_obj = {}
desc = []

const header = {
    headers: {
        Host: "tieba.baidu.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36",
        cookie: `'${cookie}'`
    }
};

if (!cookie) {
    console.log("未填写百度Cookie取消运行");
    process.exit(0);
}

!(async () => {
    await tieba()
    await showmsg()
})()
    .catch((e) => console.log(e))

// 贴吧
function tieba() {
    return new Promise(async (resove) => {
        let url = 'https://tieba.baidu.com/mo/q/newmoindex';
        try {
            let data = await axios.get(url, header);
            let _data = data.data;
            tieba_obj = {tbs: _data.data.tbs}
            // 处理异常
            if (_data.no !== 0) {
                console.log(`获取清单失败! 原因: ${_data.error}`)
                common.sendMessage("百度签到", `登录失败 Cookie已过期  ${_data.error}`);
                process.exit(0);
            }
            // 组装数据
            _data.data.like_forum.forEach((bar) => bars.push(barWrapper(bar)))
            bars = bars.sort((a, b) => b.exp - a.exp)
            // 开始签到
            await signbars(bars)
            await getbars(bars)
        } catch (e) {
            console.log(e)
        } finally {
            resove()
        }
    })
}

async function signbars(bars) {
    let signbarActs = []
    // 处理`已签`数据
    bars.filter((bar) => bar.isSign).forEach((bar) => (bar.iscurSign = false))
    // 处理`未签`数据
    let _curbarIdx = 1
    let _signbarCnt = 0
    bars.filter((bar) => !bar.isSign).forEach((bar) => _signbarCnt++)
    for (let bar of bars.filter((bar) => !bar.isSign)) {
        const signbarAct = async (resove) => {
            let url = 'https://tieba.baidu.com/sign/add';
            let param = `ie=utf-8&kw=${encodeURIComponent(bar.name)}&tbs=${tieba_obj.tbs}`;
            try {
                console.log(url);
                let data = await axios.post(url, param, header);
                let _data = data.data;
                bar.iscurSign = true
                bar.issignSuc = _data.no === 0 || _data.no === 1101
                bar.signNo = _data.no
                bar.signMsg = _data.no === 1102 ? '签得太快!' : _data.error
                bar.signMsg = _data.no === 2150040 ? '需要验证码!' : _data.error
                bar.signMsg = _data.no === 1990055 ? 'user have no real name' : _data.error
            } catch (e) {
                bar.iscurSign = true
                bar.issignSuc = false
                bar.signNo = null
                bar.signMsg = err !== null ? error : e
                console.log(e)
            } finally {
                console.log(`❕ 百度贴吧:【${bar.name}】签到完成!`)
                resove()
            }
        }
        signbarActs.push(new Promise(signbarAct))
        if (signbarActs.length === CFG_maxSignBars || _signbarCnt === _curbarIdx) {
            console.log('', `⏳ 正在发起 ${signbarActs.length} 个签到任务!`)
            await Promise.all(signbarActs)
            await wait(CFG_signWaitTime)
            signbarActs = []
        }
        _curbarIdx++
    }
}

function getbars(bars) {
    const getBarActs = []
    for (let bar of bars) {
        const getBarAct = async (resove) => {
            let url = `http://tieba.baidu.com/sign/loadmonth?kw=${encodeURIComponent(bar.name)}&ie=utf-8`;
            try {
                let data = await axios.get(url, header);
                const _signinfo = data.data.data.sign_user_info
                bar.signRank = _signinfo.rank
                bar.contsignCnt = _signinfo.sign_keep
                bar.totalsignCnt = _signinfo.sign_total
            } catch (e) {
                bar.contsignCnt = '❓'
                console.log(e)
            } finally {
                resove()
            }
        }
        getBarActs.push(new Promise(getBarAct))
    }
    return Promise.all(getBarActs)
}

function barWrapper(bar) {
    return {id: bar.forum_id, name: bar.forum_name, exp: bar.user_exp, level: bar.user_level, isSign: bar.is_sign === 1}
}

function showmsg() {
    return new Promise(async (resolve) => {
        // 数据: 签到数量
        const allbarCnt = bars.length
        let allsignCnt = 0
        let cursignCnt = 0
        let curfailCnt = 0
        bars.filter((bar) => bar.isSign).forEach((bar) => (allsignCnt += 1))
        bars.filter((bar) => bar.iscurSign && bar.issignSuc).forEach((bar) => (cursignCnt += 1))
        bars.filter((bar) => bar.iscurSign && !bar.issignSuc).forEach((bar) => (curfailCnt += 1))
        bars = [true, 'true'].includes(CFG_isOrderBars) ? bars.sort((a, b) => b.contsignCnt - a.contsignCnt) : bars
        allsignCnt += cursignCnt
        // 通知: 副标题
        let tiebasubt = '百度贴吧: '
        if (allbarCnt == allsignCnt) tiebasubt += '成功'
        else if (allbarCnt == curfailCnt) tiebasubt += '失败'
        else tiebasubt += '部分签到成功'
        // 通知: 详情
        let _curPage = 1
        const _totalPage = Math.ceil(allbarCnt / CFG_maxShowBars)

        bars.forEach((bar, index) => {
            const barno = index + 1
            const signbar = `${bar.isSign || bar.issignSuc ? '🟢' : '🔴'} [${barno}]【${bar.name}】排名: ${bar.signRank}`
            const signlevel = `等级: ${bar.level}`
            const signexp = `经验: ${bar.exp}`
            const signcnt = `连签: ${bar.contsignCnt}/${bar.totalsignCnt}天`
            const signmsg = `${bar.isSign || bar.issignSuc ? '' : `失败原因: ${bar.signMsg}\n`}`
            desc.push(`${signbar}`)
            desc.push(`${signlevel}, ${signexp}, ${signcnt}`)
            desc.push(`${signmsg}`)
            if (barno % CFG_maxShowBars === 0 || barno === allbarCnt) {
                const _descinfo = []
                let name = '百度签到'
                _descinfo.push(`共签: ${allsignCnt}/${allbarCnt}, 本次成功: ${cursignCnt}, 本次失败: ${curfailCnt}`)
                _descinfo.push(`第 ${_curPage++}/${_totalPage} 页`)
                subt = `${tiebasubt}, `
                desc = [..._descinfo, '', ...desc].join('\n')
                console.log(name, subt, desc)
                common.sendMessage(name, subt + desc);
                desc = []
            }
        })
        resolve()
    })
}

function wait(t) {
    return new Promise(e => setTimeout(e, t))
}