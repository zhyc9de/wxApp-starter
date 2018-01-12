import wx from '../lib/wx';
import PageBO from './page';
import Event from './event';
import Store from './store';

export default {
    defaultTabDir: 'tab',
    /**
     * 切换切面
     * 如果是tab页，那么直接switchTab
     * 如果非tab页，先检测页面栈，
     */
    go(url) {
        let go = wx.navigateTo;

        // 去除开头的'/'
        const routerName = url.charAt(0) === '/' ? url.substr(1) : url;
        // tab页需要switchTab
        if (url.startsWith(`pages/${this.defaultTabDir}`)) {
            go = wx.switchTab;
        } else { // 遍历页面栈
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
        }

        // 跳转
        go({
            url,
        });
    },
};
