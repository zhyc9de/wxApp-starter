import wx from './wx';
import event from './event';

const nullFoo = () => {
};
export default (o) => {
    const options = Object.assign({}, o);
    // 加入分享
    if (!options.onShareAppMessage && !options.disableShare) {
        options.onShareAppMessage = function () {
            return wx.getShare();
        };
    }

    const events = Object.getOwnPropertyNames(options)
        .filter(func => func.startsWith('onEvent'));
    console.log('发现事件', events);
    // onLoad的时候，注册监听事件
    options.oldLoad = options.onLoad || nullFoo;
    options.onLoad = async function (query) {
        for (let i = 0; i < events.length; i += 1) {
            event.put(events[i], this, this[events[i]]);
        }
        this.oldLoad(query);
    };
    // onUnload，移除事件
    options.OldUnload = options.onUnload || nullFoo;
    options.onUnload = async function () {
        for (let i = 0; i < events.length; i += 1) {
            event.remove(events[i], this);
        }
        this.OldUnload();
    };
    Page(options);
};
