import wx from './wx';

class Store {
    static async get(key, defaultValue = null) {
        try {
            const resStorage = await wx.getStorage({
                key,
            });
            return resStorage.data;
        } catch (e) {
            return defaultValue;
        }
    }

    static async set(key, data) {
        try {
            await wx.setStorage({
                key,
                data,
            });
        } catch (err) {
            console.log(err);
        }
    }
}


export default Store;
