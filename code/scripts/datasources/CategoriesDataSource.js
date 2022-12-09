// noinspection DuplicatedCode

const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const { DataSource } = WebCardinal.dataSources;

const db = {

    async fetchData(start, length) {
        const enclaveAPI = opendsu.loadApi("enclave");
        this.enclave = enclaveAPI.initialiseWalletDBEnclave();
        const categories = await $$.promisify(this.enclave.getAllRecords)("", "test");

        return categories;
    }
};

export class CategoriesDataSource extends DataSource {

    enclaveAPI = opendsu.loadApi("enclave");
    scAPI = opendsu.loadApi("sc");

    constructor(...props) {
        super(...props);
        this.id = [];
        this.filter = ''; // no value = no filtering

        this.enclave = this.enclaveAPI.initialiseWalletDBEnclave();

        this.enclave.insertRecord("", "test", "pk1", { data: "encrypted" }, { "hello": "world" }, (result)=>console.log(result));

    }

    async getPageDataAsync(startOffset, dataLengthForCurrentPage) {
        const data = await db.fetchData(startOffset, dataLengthForCurrentPage);
        return data;
    }

}