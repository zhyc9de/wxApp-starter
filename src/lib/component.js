import event from './event';

const bo = {};

const nullFoo = () => {};
export function WxComponent(o) {
    const options = Object.assign({}, o);

    const events = Object.getOwnPropertyNames(options)
        .filter(func => func.startsWith('onEvent'));
    // 挂载对象
    options.oldAttached = options.attached || nullFoo;
    options.attached = function () {
        for (let i = 0; i < events.length; i += 1) {
            event.putNotice(events[i], this.is, this[events[i]]);
        }
        this.oldAttached();
    };

    // 卸载对象
    options.oldDetached = options.detached || nullFoo;
    options.detached = function () {
        for (let i = 0; i < events.length; i += 1) {
            event.removeNotice(events[i], this.is);
        }
        this.oldDetached();
    };
    return Component(options);
}

export default bo;
