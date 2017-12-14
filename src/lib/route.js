import wx from '../lib/wx';
import PageBO from './page';
import Event from './event';
import Store from './store';

export default {
    prelaod(action = '', options = {}) {
        Store.setFlush('prelaod', {
            action,
            options,
        });
    },

    afterload(action = '', options = {}) {
        Store.setFlush('afterload', {
            action,
            options,
        });
    },
    /**
     * 切换切面
     * 如果是tab页，那么直接switchTab
     * 如果非tab页，先检测页面栈，
     */
    go(url) {
        const routerName = url.charAt(0) === '/' ? url.substr(1) : url; // 去除开头的'/'

        try {
            const page = PageBO.pages.get(routerName);
            const navData = Store.getFlush('prelaod');
            if (page && navData) {
                if (typeof page[navData.action].then !== 'function') {
                    console.warn('preload最好是异步函数！');
                }
                Event.emitPage(navData.action, navData.options, page);
            }
        } catch (err) {
            console.log('preload发生错误:', err);
        }

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
};
