// promisify copy from labrador

// 特别指定的wx对象中不进行Promise封装的方法
// 除了以下不封住的函数
const noPromiseMethods = [
    'drawCanvas',
    'canvasToTempFilePath',
    'getBackgroundAudioManager',
    'getRecorderManager',
    'canIUse',
    'createCanvasContext',
];
// 还有以on* create* stop* pause* close* hide* 开头的方法
const noPromiseStartswith = /^(on|create|stop|pause|close|hide)/;
// 以Sync结尾的方法
const noPromiseEndswith = /\w+Sync$/;

const promiseWx = {
    /**
     * 至少等待min后，才能完成promise，同时保证不超时
     *
     * @param {Promise} req promise
     * @param {number} [min=600] 最少等待时间
     * @param {number} [max=10000] 最多等待时间
     * @param {string} [timeoutError='request timeout'] 超时错误信息
     * @returns {Promise}
     */
    async waitMin(req, min = 600, max = 10000, timeoutError = 'request timeout') {
        const s1 = new Promise(resolve => setTimeout(resolve, min));
        const s2 = new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error(timeoutError)), max);
        });
        try {
            await Promise.race([Promise.all([req, s1]), s2]);
        } catch (err) {
            console.log(err);
            throw err; // 继续抛给外面
        }
        return req;
    },

    removeByIndex(l, index) {
        return l.slice(0, index).concat(l.slice(index + 1));
    },

    // 封装页面跳转
    defaultTabDir: 'tab',

    /**
     * 切换切面
     * 如果是tab页，那么直接switchTab
     * 如果非tab页，先检测页面栈，
     *
     * @param {string} url 跳转页面
     * @param {boolean} [reLaunch=false] 是否使用reLaunch
     * @param {object} [query={}] querystring
     * @returns {Promise}
     */
    go(url, reLaunch = false, query = {}) {
        let goFunc = reLaunch ? this.reLaunch : this.navigateTo;

        // 去除开头的'/'
        const routerName = url.charAt(0) === '/' ? url.substr(1) : url;
        // tab页需要switchTab
        if (url.startsWith(`pages/${this.defaultTabDir}`)) {
            goFunc = this.switchTab;
        } else { // 遍历页面栈
            const pages = getCurrentPages();
            for (let i = pages.length - 1; i >= 0; i -= 1) {
                if (pages[i].route === routerName) {
                    if (i !== pages.length - 1) {
                        console.log('后退刷新');
                        return this.navigateBack({
                            delta: (pages.length - i) - 1,
                        });
                    }
                    console.log('刷新当前页面');
                    pages[i].onLoad(query);
                    pages[i].onShow();
                    return true;
                }
            }
        }

        // 真实跳转
        return goFunc({
            url,
        });
    },

    // 获取默认分享
    defaultShare() {
        return {};
    },
    curShare: undefined,
    // 设置临时分享内容
    setShare(share) {
        this.curShare = share;
    },
    // 获取分享
    getShare() {
        const info = this.curShare || Object.assign({}, this.defaultShare());
        this.curShare = undefined;
        return info;
    },

};

Object.keys(wx).forEach((key) => {
    if (noPromiseMethods.indexOf(key) >= 0 ||
        noPromiseStartswith.test(key) ||
        noPromiseEndswith.test(key)
    ) {
        // 不进行Promise封装
        promiseWx[key] = wx[key];
        return;
    }

    // 其余方法自动Promise化
    promiseWx[key] = (obj) => {
        const args = obj || {};
        if (key === 'showToast') { // 给showtoast增加默认参数
            if (!args.duration) {
                args.duration = 1100;
            }
            if (args.icon === 'error') {
                args.image = '/static/icon/error.png';
            } else if (args.icon === 'warning') {
                args.image = '/static/icon/warning.png';
            }
        }
        return new Promise((resolve, reject) => {
            args.success = resolve;
            args.fail = reject;
            wx[key](args);
        });
    };
});

export default promiseWx;
