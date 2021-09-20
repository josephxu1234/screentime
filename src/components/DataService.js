/*global chrome*/
class DataService {
    getData() {
        const currentDate = new Date().toISOString().substr(0, 10);
        
        return new Promise((resolve) => {
            chrome.storage.local.get(currentDate, result => {
                return result[currentDate] ? resolve(result[currentDate]) : resolve({});
            });
        });
    }

    async getKeys() {
        let data = await this.getData();
        return Object.keys(data);
    }

    async getValues() {
        let data = await this.getData();
        return Object.values(data).map(each => (each / 60).toFixed(2));
    }
}

export default new DataService();