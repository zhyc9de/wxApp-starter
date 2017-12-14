import PageBO from './page';
import ComponentBO from './component';

export default {
    emitPage(trigger, options, defaultPage = undefined) {
        const page = defaultPage || PageBO.getCurrentPage();
        if (typeof page[trigger] === 'function') {
            const fn = page[trigger];
            fn.call(page, options);
        } else {
            console.info(page, `不存在${trigger}函数`);
        }
    },

    emitComponents(cName, trigger, options) {
        const components = ComponentBO.get(cName);
        for (let i = 0; i < components.length; i += 1) {
            const fn = components[i][trigger];
            fn.call(components[i], options);
        }
    },
};
