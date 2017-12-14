import wx from './wx';

export default {
    state: new Map(),

    async init(keys = []) {
        const getKeys = [];
        for (let i = 0; i < keys.length; i += 1) {
            getKeys.push(this.getStorage(keys[i]));
        }
        if (getKeys.length > 0) {
            const vals = await Promise.all(getKeys);
            for (let i = 0; i < keys.length; i += 1) {
                this.state.set(keys[i], vals[i]);
            }
        }
    },

    // 这里吐带有时间的值，这个函数不暴露给外部的
    async getStorage(key, defaultValue = undefined) {
        try {
            const resStorage = await wx.getStorage({
                key,
            });
            const {
                expired,
            } = resStorage.data;
            if (expired !== -1 && expired > Date.now()) {
                throw new Error('data expired');
            }
            return resStorage.data;
        } catch (e) {
            return defaultValue;
        }
    },

    get(key, defaultValue = undefined) {
        const {
            data,
            expired,
        } = this.state.get(key);
        if (expired !== -1 && expired > Date.now()) {
            return defaultValue;
        }
        return data;
    },

    async set(key, setData, cacheTime = 0, toStorage = false) {
        try {
            const data = Object.assign(setData, {
                expired: cacheTime <= 0 ? -1 : Date.now() + (cacheTime * 1000),
            });
            this.state.set(key, data);
            // TODO: 如果更新了那么通知所有视图更新?
            if (toStorage) {
                await wx.setStorage({
                    key,
                    data,
                });
            }
        } catch (err) {
            console.log(err);
        }
    },

    clear() {
        wx.clearStorage();
    },
};
