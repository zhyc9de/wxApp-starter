import wx from './wx';

export default {
    state: new Map(),

    setStorage(key, data) {
        wx.setStorage({
            key,
            data,
        });
    },

    async getStorage(key) {
        try {
            const resStorage = await wx.getStorage({
                key,
            });
            return resStorage.data;
        } catch (err) {
            return undefined;
        }
    },

    getCahce(key) {
        if (!this.state.has(key)) {
            return undefined;
        }
        const res = this.state.get(key);
        if (res.expireTime < 0 || res.expireTime >= Date.now()) {
            return res.data;
        }
        this.state.delete(key);
        return undefined;
    },

    setCache(key, data, timeout = -1) {
        const expireTime = timeout < 0 ? -1 : Date.now() + timeout;
        this.state.set(key, {
            data,
            expireTime,
        });
    },
};
