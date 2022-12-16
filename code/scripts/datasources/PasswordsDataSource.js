// noinspection DuplicatedCode

const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const {DataSource} = WebCardinal.dataSources;

const db = {
    async fetchData(start, length) {
        const enclaveAPI = opendsu.loadApi("enclave");
        this.enclave = enclaveAPI.initialiseWalletDBEnclave();
        const categories = await $$.promisify(this.enclave.getAllRecords)("", "categories");

        let passwords = [];
        for (let i = 0; i < categories.length; i++) {
            console.log("categories[i].category ", categories[i].category);
            passwords = passwords.concat((await $$.promisify(this.enclave.getAllRecords)("", categories[i].category))
                .map(password => {
                    const obj = password.password;
                    obj.inputModel = {
                        value: obj.password
                    }
                    return obj;
                }));
            console.log("parolele", passwords);
        }
        // passwords = await Promise.all(categories.map(async category => {
        //     return (await );
        // }));
        console.log(passwords.flat());
        return passwords.flat();
    }
}

export class PasswordsDataSource extends DataSource {

    enclaveAPI = opendsu.loadApi("enclave");
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
        console.log(data);
        return data;
    }

}
