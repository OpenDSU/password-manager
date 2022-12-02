class CategoryManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
    }

    addCategory(categoryDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "createCategoryDossier", categoryDetails).onReturn(callback);
    }

    importCategory(categorySeed, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "importCategory", categorySeed).onReturn(callback);
    }

    listCategories(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "listCategories").onReturn((err, mountedCategories) => {
            if (err) {
                return callback(err);
            }

            let categories = [];

            let getCategoryDetails = (mountedCategory) => {
                this.listCategoryPasswords("/categories/" + mountedCategory.path, (err, passwords) => {
                    if (err) {
                        return callback(err);
                    }
                    categories.push({
                        ...mountedCategory,
                        passwords: passwords,
                        passwordsCount: passwords.length
                    });

                    if (mountedCategories.length > 0) {
                        return getCategoryDetails(mountedCategories.shift());
                    }
                    callback(undefined, categories);
                });
            }

            if (mountedCategories.length > 0) {
                return getCategoryDetails(mountedCategories.shift());
            }
            callback(undefined, categories);
        });
    }

    addPassword(categoryPath, passwordDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "createPassword", categoryPath, passwordDetails).onReturn(callback);
    }

    importPassword(categoryPath, passwordSeed, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "importPassword", categoryPath, passwordSeed).onReturn(callback);
    }

    listCategoryPasswords(mountedCategoryPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "listCategoryPasswords", mountedCategoryPath).onReturn(callback)
    }

    editPassword(categoryPath, passwordPath, passwordDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "editPassword", categoryPath, passwordPath, passwordDetails).onReturn(callback)
    }

    deletePassword(categoryPath, passwordPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "categoriesSwarm", "deletePassword", categoryPath, passwordPath).onReturn(callback)
    }
}

let categoryManagerService = new CategoryManagerService();
let getCategoryManagerServiceInstance = function () {
    return categoryManagerService;
}

export {
    getCategoryManagerServiceInstance
};