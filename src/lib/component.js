import PageBO from './page';

const removeByIndex = (l, index) => {
    l.slice(0, index).concat(l.slice(index + 1));
};

const bo = {
    components: new Map(),

    add(c) {
        const currPage = PageBO.getCurrentPage();
        const cPath = `${currPage.route}/${c.is}`;
        if (!this.components.get(cPath)) {
            this.components.set(cPath, []);
        }
        this.components.get(cPath).push(c);
        console.log('component manager add ', cPath, c.__wxWebviewId__);
    },

    remove(c) {
        const currPage = PageBO.getCurrentPage();
        const cPath = `${currPage.route}/${c.is}`;
        const components = this.components.get(cPath) || [];
        for (let i = 0; i < components.length; i += 1) {
            const item = components[i];
            if (item.__wxWebviewId__ === c.__wxWebviewId__) {
                this.components.set(cPath, removeByIndex(components, i));
                break;
            }
        }
        console.log('component manager remove ', cPath, c.__wxWebviewId__);
    },

    get(cName) {
        const currPage = PageBO.getCurrentPage();
        const cPath = `${currPage.route}/components/${cName}`;
        return this.components.get(cPath) || [];
    },

    async emit(cName, trigger, options) {
        const components = this.get(cName);
        const awaitList = [];
        for (let i = 0; i < components.length; i += 1) {
            const fn = components[i][trigger];
            if (typeof fn.then === 'function') {
                awaitList.push(fn.call(components[i], options));
            } else {
                fn.call(components[i], options);
            }
        }
        if (awaitList.length > 0) {
            await Promise.all(awaitList);
        }
    },
};

export function WxComponent(params) {
    const newOptions = Object.assign({}, params);
    const nullFoo = () => {};

    newOptions.oldReady = params.ready || nullFoo;
    newOptions.oldDetached = params.detached || nullFoo;
    newOptions.ready = function () {
        newOptions.oldReady();
        bo.add(this);
    };
    newOptions.detached = function () {
        newOptions.oldDetached();
        bo.remove(this);
    };
    return Component(newOptions);
}

export default bo;
