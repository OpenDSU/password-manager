import {MESSAGES, MODELS} from '../services/Constants.js'
import {CategoriesDataSource} from "../datasources/CategoriesDataSource.js";
import {getCategoryManagerServiceInstance} from "../services/CategoryManagerService.js";

const {WebcController} = WebCardinal.controllers;

function getModel() {
    return {
        categoriesToShow: new CategoriesDataSource(),
        name: {
            label: MODELS.name.label,
            name: MODELS.name.name,
            required: true,
            placeholder: MODELS.name.placeholder,
            value: ''
        },
        domain: {
            label: MODELS.domain.label,
            name: MODELS.domain.name,
            required: true,
            placeholder: MODELS.domain.placeholder,
            value: ''
        },
        email: {
            label: MODELS.email.label,
            name: MODELS.email.name,
            required: true,
            placeholder: MODELS.email.placeholder,
            value: ''
        },
        category: {
            label: MODELS.category.label,
            placeholder: MODELS.category.placeholder,
            required: true,
            options: []
        },
        password: {
            label: MODELS.password.label,
            hint: MODELS.password.hint,
            name: MODELS.password.name,
            required: true,
            placeholder: MODELS.password.placeholder,
            value: ''
        },
        confirmPassword: {
            label: MODELS.password.confirmLabel,
            hint: MODELS.password.hint,
            name: MODELS.password.name,
            required: true,
            placeholder: MODELS.password.placeholder,
            value: ''
        },
        error: {
            occurred: false,
            message: ''
        }
    };
}

export default class AddPasswordController extends WebcController {
    constructor(element, history) {
        super(element, history);

        this.model = getModel();
        this.initCategories();
        this.addNewPassword();

        // this.CategoryManagerService = getCategoryManagerServiceInstance();
        // this._populateCategoryList(history.location.state);
        // this.addPasswordOnClick();
    }

    initCategories() {
        getCategoryManagerServiceInstance((err, instance) => {
            if (err) {
                // display modal with error message for the user (e.g. try again)
            }
            instance.listCategories((err, data) => {
                if (err) {
                    console.log("ERROR WHILE GETTING CATEGORIES");
                    // display modal with error message for the user (e.g. try again)
                }
                this.model.categories = data;
            });
        });
        // this.model.categories = (await $$.promisify(this.model.categoriesToShow.enclave.getAllRecords)("", "categories")).map(obj => obj.category);
    }

    addNewPassword() {
        this.onTagClick("add-password-submit", () => {
            const newPassword = {
                name: document.getElementById("name").value,
                domain: document.getElementById("domain").value,
                email: document.getElementById("email-address").value,
                category: document.getElementById("category").value,
                password: document.getElementById("password").value,
                confirmPassword: document.getElementById("confirm-password").value
            };
            if (!newPassword.name || !newPassword.domain || !newPassword.email || !newPassword.category || !newPassword.password) {
                console.warn("Please fill out all the fields before saving a password!")
                // display modal with error message for the user
            } else {
                if (newPassword.password !== newPassword.confirmPassword) {
                    console.warn("Inserted passwords are different!");
                    // display modal with error message for the user
                } else {
                    getCategoryManagerServiceInstance((err, instance) => {
                        if (err) {
                            // display modal with error message for the user (e.g. try again)
                        }
                        instance.addPassword(newPassword, (err) => {
                            if (err) {
                                // display modal with error message for the user (e.g. try again)
                            }
                            this.navigateToPageTag('view-passwords');
                        });
                    });
                }
            }
            // this.model.dataSource = new CategoriesDataSource();
            // this.model.dataSource.addPasswordToCategory(newPassword);
        })
    }

    addPasswordOnClick() {
        this.on('add-password-submit', (event) => {
            let errorMessage = getErrorMessageFromFieldsValidation(this.model);

            if (this.model.password.value !== this.model.confirmPassword.value) {
                errorMessage = MESSAGES.ERROR.PASSWORDS_MUST_MATCH;
            }

            if (errorMessage) {
                this._setErrorMessage(errorMessage);
                return;
            }
            let toSendObject = {
                "name": this.model.name.value,
                "domain": this.model.domain.value,
                "email": this.model.email.value,
                "password": this.model.password.value
            }

            let navigateCategory = this.model.category.options.find(category => category.path === this.model.category.value);

            this.CategoryManagerService.addPassword(this.model.category.value, toSendObject, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.History.navigateToPageByTag('view-passwords', JSON.parse(JSON.stringify(navigateCategory)));
            });
        });
    }

    _setErrorMessage(message) {
        let error = {
            occurred: message || message === null || message.trim() === '',
            message: message
        }
        this.model.setChainValue('error', JSON.parse(JSON.stringify(error)));
    }

    _populateCategoryList(currentPath) {
        this.CategoryManagerService.listCategories((err, categories) => {
            if (err) {
                categories = [];
            }
            let model = getModel();
            if (currentPath) {
                categories = categories.filter(category => category.path === currentPath);
                model.category.value = currentPath;
                model.category.disabled = true;
            }
            model.category.options = categories.map(category => {
                return this._getDropdownValueFromCategory(category)
            });
            this.model = this.setModel(model);
        });
    }

    _getDropdownValueFromCategory(category) {
        return {
            ...category,
            label: category.data.name,
            value: category.path
        }
    };
}