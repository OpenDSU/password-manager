console.log("Loaded from domain.js");
const CATEGORIES_MOUNTING_PATH = "/categories";
const PASSWORDS_MOUNTING_PATH = "/passwords";
const keyssiresolver = require("opendsu").loadApi("resolver");

$$.swarms.describe('categoriesSwarm', {
    start: function(data) {
        if (rawDossier) {
            return this.createCategoryDossier(data);
        }
        this.return(new Error("Raw Dossier is not available."));
    },

    createCategoryDossier: function(data) {
        const keyssiSpace = require("opendsu").loadApi("keyssi");
        rawDossier.getKeySSI((err, ssi) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }
                    newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            console.error(err);
                            return this.return(err);
                        }
                        this.mountDossier(rawDossier, CATEGORIES_MOUNTING_PATH, keySSI)
                    });
                });
            });
        });
    },

    importCategory: function(seed) {
        rawDossier.getKeySSI((err, keySSI) => {
            if (err) {
                return this.return(err);
            }

            this.mountDossier(rawDossier, CATEGORIES_MOUNTING_PATH, seed);
        });
    },

    listCategories: function() {
        this.__listCategories((err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    __listCategories: function(callback) {
        rawDossier.readDir(CATEGORIES_MOUNTING_PATH, (err, categories) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getCategoryData = (category) => {
                rawDossier.readFile(CATEGORIES_MOUNTING_PATH + '/' + category.path + '/data', (err, fileContent) => {
                    toBeReturned.push({
                        path: category.path,
                        identifier: category.identifier,
                        data: JSON.parse(fileContent)
                    });
                    if (categories.length > 0) {
                        getCategoryData(categories.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (categories.length > 0) {
                return getCategoryData(categories.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    listCategoryPasswords: function(mountedCategoryPath) {
        this.__listCategoryPasswords(mountedCategoryPath, (err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    __listCategoryPasswords: function(mountedCategoryPath, callback) {
        rawDossier.readDir(CATEGORIES_MOUNTING_PATH + '/' + mountedCategoryPath + "/passwords", (err, passwords) => {
            if (err) {
                return this.return(err);
            }

            let toBeReturned = [];
            let getPasswordData = (password) => {
                let filePath = CATEGORIES_MOUNTING_PATH + '/' + mountedCategoryPath + '/passwords/' + password.path + '/data';
                rawDossier.readFile(filePath, (err, fileContent) => {
                    toBeReturned.push({
                        path: password.path,
                        identifier: password.identifier,
                        data: JSON.parse(fileContent)
                    });
                    if (passwords.length > 0) {
                        getPasswordData(passwords.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (passwords.length > 0) {
                return getPasswordData(passwords.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    createPassword: function(categoryPath, data) {
        this.__listCategories((err, categories) => {
            let currentCategory = categories.find(category => category.path === categoryPath);
            if (!currentCategory) {
                return this.return(new Error('Category not found.'))
            }

            keyssiresolver.loadDSU(currentCategory.identifier, (err, categoryDossier) => {
                if (err) {
                    return this.return(err);
                }
                const keyssiSpace = require("opendsu").loadApi("keyssi");
                rawDossier.getKeySSI((err, ssi) => {
                    if (err) {
                        console.error(err);
                        this.return(err);
                    }
                    const templateSSI = keyssiSpace.buildSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
                    keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                        if (err) {
                            console.error(err);
                            this.return(err);
                        }
                        newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
                            if (err) {
                                console.error(err);
                                return this.return(err);
                            }
                            newDossier.getKeySSI((err, keySSI) => {
                                if (err) {
                                    return this.return(err);
                                }
                                this.mountDossier(categoryDossier, PASSWORDS_MOUNTING_PATH, keySSI)
                            });
                        });

                    });
                });
            });
        });
    },

    editPassword(categoryPath, passwordPath, passwordObject) {
        this.__listCategoryPasswords(categoryPath, (err, passwords) => {
            if (err) {
                return this.return(err);
            }

            let wantedPassword = passwords.find(password => password.path === passwordPath);
            if (!wantedPassword) {
                return this.return(new Error('Password with path ' + passwordPath + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedPassword.identifier, (err, passwordDossier) => {
                if (err) {
                    return this.return(err);
                }
                passwordDossier.writeFile('/data', JSON.stringify(passwordObject), this.return);
            })
        });
    },

    deletePassword(categoryPath, passwordPath) {
        this.__listCategories((err, categories) => {
            if (err) {
                return this.return(err);
            }

            let wantedCategory = categories.find(category => category.path === categoryPath);
            if (!wantedCategory) {
                return this.return(new Error('Category with path ' + categoryPath + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedCategory.identifier, (err, categoryDossier) => {
                if (err) {
                    return this.return(err);
                }
                categoryDossier.unmount('/passwords/' + passwordPath, (err, data) => {
                    if (err) {
                        return this.return(err);
                    }
                    return this.return(err, data);
                });
            })
        });
    },

    importPassword(categoryPath, passwordSeed) {
        this.__listCategories((err, categories) => {
            if (err) {
                return this.return(err);
            }

            let wantedCategory = categories.find(category => category.path === categoryPath);
            if (!wantedCategory) {
                return this.return(new Error('Category with path ' + categoryPath + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedCategory.identifier, (err, categoryDossier) => {
                if (err) {
                    return this.return(err);
                }
                this.mountDossier(categoryDossier, PASSWORDS_MOUNTING_PATH, passwordSeed);
            })
        });
    },

    mountDossier: function(parentDossier, mountingPath, seed) {
        const PskCrypto = require("pskcrypto");
        const hexDigest = PskCrypto.pskHash(seed, "hex");
        let path = `${mountingPath}/${hexDigest}`;
        parentDossier.mount(path, seed, (err) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            this.return(undefined, { path: path, seed: seed });
        });
    }
});