import { wxp } from 'lib';
import api, { API_HOST } from './api';

const KEY_USER_ID = 'userId';

const WX_APP_ID = 'wxa4f32c99910d946e';

export default {
    uid: undefined,
    userInfo: undefined,

    async login() {
        try {
            await wx.checkSession();
            this.uid = wxp.getStorageSync(KEY_USER_ID) || await this.getAuth();
        } catch (err) { // 重新登录
            console.log(err);
            this.uid = await this.getAuth();
        }
    },

    async getAuth() {
        try {
            // 1. 调用微信的登录接口 (有异常会直接跑出)
            const { code } = await wxp.login();
            // 2. 通知后台先(有一场自己会跑出exception)
            const data = await api.request('POST', `${API_HOST}/login`, {
                app: WX_APP_ID,
                code,
            });
            this.uid = data.uid;
            // 3. 登录成功后，塞到store里
            wxp.setStorageSync(KEY_USER_ID, this.uid);
        } catch (err) {
            console.log('login failed :', err);
        }
    },
};
