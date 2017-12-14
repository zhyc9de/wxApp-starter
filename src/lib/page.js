import Event from './event';
import Store from './store';

const bo = {
    pages: new Map(),

    // 获取当前页面
    getCurrentPage() {
        const pages = getCurrentPages();
        if (pages.length > 0) {
            return pages[pages.length - 1];
        }
        return undefined;
    },
};

// 重构的page
export function WxPage(router, params) {
    const newOptions = Object.assign({}, params);
    const nullFoo = () => {};

    newOptions.oldShow = params.onShow || nullFoo;
    newOptions.onShow = async function () {
        const navData = Store.getFlush('afterload');
        if (navData) {
            Event.emitPage(navData.action, navData.options, this);
        }

        this.oldShow();
    };
    Page(newOptions);
    // 只是存个原型
    bo.pages.set(router, params);
}


export default bo;
