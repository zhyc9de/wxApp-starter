import wx from '../lib/wx';

const bo = {
    navData: undefined,

    getNavDataAndClean() {
        const navData = Object.assign({}, this.navData);
        this.navData = undefined;
        return navData;
    },

    // 获取当前页面
    getCurrentPage() {
        const pages = getCurrentPages();
        if (pages.length > 0) {
            return pages[pages.length - 1];
        }
        return undefined;
    },

    /**
     * 切换切面
     * 如果是tab页，那么直接switchTab
     * 如果非tab页，先检测页面栈，
     *
     * @param {string} path 跳转url （必须是绝对路径）
     * @param {string} [action=''] 触发onNav后台，应该执行key名
     * @param {any} [options={}] 执行参数
     */
    go(url, action = '', options = {}) {
        this.navData = {
            action,
            options,
        };
        const routerName = url.charAt(0) === '/' ? url.substr(1) : url; // 去除开头的'/'
        if (url.startsWith('pages/tab')) { // 目前约定当且仅当为pages/tab中的页面时，需要switchTab
            wx.switchTab({
                url,
            });
            return;
        }
        // 遍历页面栈
        const pages = getCurrentPages();
        for (let i = pages.length - 1; i >= 0; i -= 1) {
            if (pages[i].route === routerName) {
                if (i === pages.length - 1) {
                    pages[i].onShow();
                } else {
                    wx.navigateBack({
                        delta: (pages.length - i) - 1,
                    });
                }
                return;
            }
        }
        // 实在没有就直接跳转
        wx.navigateTo({
            url,
        });
    },

    // 只戳发当前页面
    async emit(trigger, options, defaultPage = undefined) {
        const page = defaultPage || this.getCurrentPage();
        if (typeof page[trigger] === 'function') {
            const fn = page[trigger];
            if (typeof fn.then === 'function') {
                await fn.call(page, options);
            } else {
                fn.call(page, options);
            }
        } else if (trigger === undefined) {
            // pass
        } else {
            console.info(page, `不存在${trigger}函数`);
        }
    },
};

// 重构的page
export function WxPage(params) {
    const newOptions = Object.assign({}, params);
    const nullFoo = () => {};

    newOptions.navAction = async function () {
        if (!bo.navData) {
            return;
        }
        const {
            action,
            options,
        } = bo.getNavDataAndClean();

        await bo.emit(action, options, this);
    };

    newOptions.oldShow = params.onShow || nullFoo;
    newOptions.onShow = async function () {
        await this.navAction();
        if (this.oldShow) {
            this.oldShow();
        }
    };

    return Page(newOptions);
}

export default bo;
