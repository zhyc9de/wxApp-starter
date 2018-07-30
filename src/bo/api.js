import qs from 'query-string';
import { wxp } from 'lib';
import auth from './auth';

export const API_HOST = 'http://127.0.0.1:8080/api/v1';

// const API_HOST='http://127.0.0.1:8080/api/v1';

function withUid(q) {
    return Object.assign({
        uid: auth.uid,
    }, q);
}

export default {
    async request(method, url, body = undefined) {
        const { data } = await wxp.request({
            method,
            url,
            data: body,
            dataType: 'json',
        });
        if (data.code !== 0) {
            const err = new Error(data.msg);
            err.type = 'api';
            err.response = data;
            throw err;
        }
        return data.result;
    },

    async get(path, query) {
        const url = `${API_HOST}${path}`;
        return this.request('GET', url, withUid(query));
    },

    async post(path, body, query = {}) {
        const url = `${API_HOST}${path}?${qs.stringify(withUid(query))}`;
        return this.request('POST', url, body);
    },

    uploadFile(path, name, filePath, formData = {}, query = {}, cb = () => {}) {
        const url = `${API_HOST}${path}?${qs.stringify(withUid(query))}`;
        return new Promise(((resolve, reject) => {
            const uploadTask = wxp.uploadFile({
                url,
                filePath,
                name,
                formData,
                success: resolve,
                fail: reject,
            });
            uploadTask.onProgressUpdate(cb);
        }));
    },
};
