// noinspection DuplicatedCode

const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const {DataSource} = WebCardinal.dataSources;

const db = {

    async fetchData(start, length) {
        const enclaveAPI = opendsu.loadApi("enclave");
        this.enclave = enclaveAPI.initialiseWalletDBEnclave();
        const categories = await $$.promisify(this.enclave.getAllRecords)("", "categories");

        return categories;
    }
};

export class CategoriesDataSource extends DataSource {

    enclaveAPI = opendsu.loadApi("enclave");
    scAPI = opendsu.loadApi("sc");
    enclave;

    constructor(...props) {
        super(...props);
        this.id = [];
        this.filter = ''; // no value = no filtering

        this.enclave = this.enclaveAPI.initialiseWalletDBEnclave();
        this.enclave.on("initialised", () => {
            console.log("Enclave has been initialised");
            this.initialised = true;
        });

        // this.enclave.deleteRecord("", "categories", "", { data: "encrypted" }, { "hello": "world" }, (result)=>console.log(result));

    }

    async getPageDataAsync(startOffset, dataLengthForCurrentPage) {
        const data = await db.fetchData(startOffset, dataLengthForCurrentPage);
        return data;
    }

    async addCategoryToEnclave(categoryName) {
        console.log("apel add category ", categoryName, " to enclave");

        if (this.initialised) {
            this.enclave.insertRecord("", "categories", categoryName, {data: "encrypted"}, {"category": categoryName}, (result) => console.log("record inserted successfully"));
            return;
        } else {
            setTimeout(() => {
                this.addCategoryToEnclave(categoryName)
            }, 100);
        }

        console.log("inserted into enclave");
        // const result = await $$.promisify(this.enclave.getAllRecords)("", "categories");
        // console.log(result);
    }
}
