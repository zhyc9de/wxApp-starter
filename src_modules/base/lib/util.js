export default {
    /**
     * 至少等待min后，才能完成promise，同时保证不超时
     *
     * @param {Promise} req promise
     * @param {number} [min=600] 最少等待时间
     * @param {number} [max=10000] 最多等待时间
     * @param {string} [timeoutError='request timeout'] 超时错误信息
     * @returns {Promise}
     */
    async waitMin(req, min = 600, max = 10000, timeoutError = 'request timeout') {
        const s1 = new Promise(resolve => setTimeout(resolve, min));
        const s2 = new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error(timeoutError)), max);
        });
        try {
            await Promise.race([Promise.all([req, s1]), s2]);
        } catch (err) {
            console.log(err);
            throw err; // 继续抛给外面
        }
        return req;
    },

    removeByIndex(l, index) {
        return l.slice(0, index)
            .concat(l.slice(index + 1));
    },
};
