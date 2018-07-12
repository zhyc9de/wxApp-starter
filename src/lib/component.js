import wxp from './wxp';
import event from './event';

const nullFoo = () => {
};

export default (o) => {
    const options = Object.assign({}, o);

    const events = Object.getOwnPropertyNames(options.methods)
        .filter(func => func.startsWith('onEvent'));

    // 挂载对象
    options.oldAttached = options.attached || nullFoo;
    options.attached = function() {
        this.route = wxp.getCurrentRoute();

        for (let i = 0; i < events.length; i += 1) {
            event.put(events[i], this, this[events[i]]);
        }
        options.oldAttached.call(this);
    };

    // 卸载对象
    options.oldDetached = options.detached || nullFoo;
    options.detached = function() {
        this.route = wxp.getCurrentRoute();

        for (let i = 0; i < events.length; i += 1) {
            event.remove(events[i], this);
        }
        options.oldDetached.call(this);
    };
    return Component(options);
};
