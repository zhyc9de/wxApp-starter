import queryString from 'query-string';

// promisify copy from labrador
// 特别指定的wx对象中不进行Promise封装的方法
// 除了以下不封住的函数
const noPromiseMethods = [
    'canvasToTempFilePath',
    'canIUse',
    'downloadFile',
];
// 还有以 on* create* stop* pause* close* hide* 开头的方法
const noPromiseStartsWith = /^(on|create|stop|pause|close|hide)/;
// 以 Sync Manager 结尾的方法
const noPromiseEndsWith = /\w+(Sync|Manager)$/;

const wxp = {
    // 获取当前页面
    getCurrentPage() {
        const pages = getCurrentPages();
        if (pages.length > 0) {
            return pages[pages.length - 1];
        }
        return undefined;
    },

    getCurrentRoute() {
        return this.getCurrentPage().route;
    },

    // 给定绝对路径（不需要包含开头的斜杠）, 尝试从页面栈中拿到这个页面的对象
    getPageInStack(absPath) {
        const pages = getCurrentPages();
        for (let i = 0; i < pages.length; i += 1) {
            if (pages[i].route === absPath) {
                return pages[i];
            }
        }
        return null;
    },

    /**
     * 使用navigateTo/navigateBack切换页面
     *
     * @param {string} url 跳转页面
     * @param {object} [query={}] query string
     * @returns
     */
    goto(url, query = {}) {
        const routerName = url.charAt(0) === '/' ? url.substr(1) : url;
        const pages = getCurrentPages();
        for (let i = pages.length - 1; i >= 0; i -= 1) {
            if (pages[i].route === routerName) {
                console.log(`后退跳转: ${url}`);
                pages[i].options = query;
                if (i !== pages.length - 1) {
                    wx.navigateBack({
                        delta: (pages.length - i) - 1,
                    });
                    return;
                }
                return;
            }
        }

        const navUrl = `${url}?${queryString.stringify(query)}`;
        console.log(`向前跳转: ${navUrl}`);
        wx.navigateTo({
            url: navUrl,
        });
    },
};

Object.keys(wx)
    .forEach((key) => {
        if (noPromiseMethods.indexOf(key) >= 0 ||
            noPromiseStartsWith.test(key) ||
            noPromiseEndsWith.test(key)
        ) {
            // 不进行Promise封装
            wxp[key] = wx[key];
            return;
        }

        // 其余方法自动Promise化
        wxp[key] = (obj) => {
            const args = obj || {};
            if (key === 'showToast') { // 给showToast增加默认参数
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

export default wxp;
