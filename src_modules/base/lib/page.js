import event from './event';

const nullFoo = () => {
};

export default (o) => {
    const options = Object.assign({}, o);

    const events = Object.getOwnPropertyNames(options)
        .filter(func => func.startsWith('onEvent'));

    // onLoad的时候，注册监听事件
    options.oldLoad = options.onLoad || nullFoo;
    options.onLoad = async function(query) {
        for (let i = 0; i < events.length; i += 1) {
            event.put(events[i], this, this[events[i]]);
        }
        // decode value
        Object.keys(query)
            .map(key => Object.assign(query, {
                key: decodeURIComponent(query[key]),
            }));
        this.oldLoad(query);
    };

    // onUnload，移除事件
    options.oldUnload = options.onUnload || nullFoo;
    options.onUnload = async function() {
        for (let i = 0; i < events.length; i += 1) {
            event.remove(events[i], this);
        }
        this.oldUnload();
    };
    Page(options);
};
