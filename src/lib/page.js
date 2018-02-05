import wx from './wx';
import event from './event';

const bo = {
    // 获取当前页面
    getCurrentPage() {
        const pages = getCurrentPages();
        if (pages.length > 0) {
            return pages[pages.length - 1];
        }
        return undefined;
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
};

const nullFoo = () => {};
export function WxPage(o) {
    const options = Object.assign({}, o);
    // 加入分享
    if (!options.onShareAppMessage && !options.disableShare) {
        options.onShareAppMessage = function () {
            return wx.getShare();
        };
    }

    const events = Object.getOwnPropertyNames(options)
        .filter(func => func.startsWith('onEvent'));
    // onLoad的时候，注册监听事件
    options.oldLoad = options.onLoad || nullFoo;
    options.onLoad = async function () {
        for (let i = 0; i < events.length; i += 1) {
            event.putNotice(events[i], this.route, this[events[i]]);
        }
        this.oldLoad();
    };
    // onUnload，移除事件
    options.OldUnload = options.onUnload || nullFoo;
    options.onUnload = async function () {
        for (let i = 0; i < events.length; i += 1) {
            event.removeNotice(events[i], this.route);
        }
        this.OldUnload();
    };
    Page(options);
}

export default bo;
