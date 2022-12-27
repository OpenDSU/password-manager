import {getCategoryManagerServiceInstance} from '../services/CategoryManagerService.js';

const {DataSource} = WebCardinal.dataSources;

const db = {

    async fetchData() {
        let instance = await $$.promisify(getCategoryManagerServiceInstance)();
        let categories = await $$.promisify(instance.listCategories, instance)();
        if (!categories) {
            categories = [];
        }
        return categories;
    }
};

export class CategoriesDataSource extends DataSource {
    constructor(...props) {
        super(...props);
        this.id = [];
        this.filter = ''; // no value = no filtering
    }

    async getPageDataAsync(startOffset, dataLengthForCurrentPage) {
        const data = await db.fetchData(startOffset, dataLengthForCurrentPage);
        console.log(data);
        return data;
    }
}
