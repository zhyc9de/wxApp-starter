import event from './event';
import page from './page';

const bo = {};

const nullFoo = () => {};
export function WxComponent(o) {
    const options = Object.assign({}, o);

    const events = Object.getOwnPropertyNames(options.methods)
        .filter(func => func.startsWith('onEvent'));
    // 挂载对象
    options.oldAttached = options.attached || nullFoo;
    options.attached = function () {
        this.route = page.getCurrentRoute();

        for (let i = 0; i < events.length; i += 1) {
            event.putNotice(events[i], this, this[events[i]]);
        }
        options.oldAttached.call(this);
    };

    // 卸载对象
    options.oldDetached = options.detached || nullFoo;
    options.detached = function () {
        this.route = page.getCurrentRoute();

        for (let i = 0; i < events.length; i += 1) {
            event.removeNotice(events[i], this);
        }
        options.oldDetached.call(this);
    };
    return Component(options);
}

export default bo;
