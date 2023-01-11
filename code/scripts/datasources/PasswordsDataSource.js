import {getCategoryManagerServiceInstance} from "../services/CategoryManagerService.js";

const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const {DataSource} = WebCardinal.dataSources;

const db = {
    async fetchData(filter) {
        let instance = await $$.promisify(getCategoryManagerServiceInstance)();
        let passwords;
        if (filter) {
            await $$.promisify(instance.indexPasswords, instance)();
            passwords = await $$.promisify(instance.listCategoryPasswords, instance)(filter);
        }
        else {
            passwords = await $$.promisify(instance.listAllPasswords, instance)();
        }

        if (!passwords) {
            passwords = [];
        }
        return passwords;
    }
};

export class PasswordsDataSource extends DataSource {
    enclaveAPI = opendsu.loadApi("enclave");
    enclave;

    constructor(...props) {
        super(...props);
        this.id = [];
        if (props[0]) {
            this.filter = props[0].category;
        }

        this.enclave = this.enclaveAPI.initialiseWalletDBEnclave();
        this.enclave.on("initialised", () => {
            console.log("Enclave has been initialised");
            this.initialised = true;
        });

        // this.enclave.deleteRecord("", "categories", "", { data: "encrypted" }, { "hello": "world" }, (result)=>console.log(result));
    }

    async getPageDataAsync(startOffset, dataLengthForCurrentPage) {
        const data = await db.fetchData(this.filter);
        console.log(data);
        return data;
    }
}
