class CategoryManagerService {

    constructor(mainEnclave) {
        this.enclave = mainEnclave;
    }

    addCategory(name, callback) {
        this.enclave.insertRecord("categories", name, {data: "encrypted"}, {name: name}, callback);
    }

    listCategories(callback) {
        this.enclave.getAllRecords("categories", callback);
    }

    /**
     * Adds a new password to the "passwords" table in the main enclave.
     * @param {Object} password - a password object with the following fields: name, domain, email, category, password
     * @param {function} callback
     */
    addPassword(password, callback) {
        this.enclave.insertRecord("passwords", password.domain, {data: "encrypted"}, password, callback);
    }

    listCategoryPasswords(categoryName, callback) {
        this.enclave.filter("passwords", [`category == ${categoryName}`], callback);
    }

    listAllPasswords(callback) {
        this.enclave.getAllRecords("passwords", callback);
    }

    editPassword(domain, password, callback) {
        this.enclave.deleteRecord("passwords", domain, (err) => {
            if (err) {
                return callback(err);
            }
            this.addPassword(password, callback);
        });
    }

    deletePassword(domain, callback) {
        this.enclave.deleteRecord("passwords", domain, callback);
    }
}

let categoryManagerService;
let getCategoryManagerServiceInstance = function (callback) {
    if (!categoryManagerService) {
        const opendsu = require("opendsu");
        let securityContext = opendsu.loadAPI("sc");
        return securityContext.getMainEnclave((err, mainEnclave) => {
            if (err) {
                return callback(err);
            }
            categoryManagerService = new CategoryManagerService(mainEnclave);
            return callback(undefined, categoryManagerService);
        });
    }
    callback(undefined, categoryManagerService);
}

export {
    getCategoryManagerServiceInstance
};