// import {getCategoryManagerServiceInstance} from "../services/CategoryManagerService.js";
import {MODELS, MESSAGES, TIME_LIMITS} from '../services/Constants.js';
import { PasswordsDataSource } from "../datasources/PasswordsDataSource.js";

const {WebcController} = WebCardinal.controllers;

function getModel(filter) {
    return {
        passwords: new PasswordsDataSource({"category": filter})

    }
}

export default class ViewPasswordsController extends WebcController {
    constructor(element, history) {
        super(element, history);

        // getCategoryManagerServiceInstance((err, instance) => {
        //     if (err) {
        //         console.log("Error creating an instance of the Category Manager Service");
        //     }
        //     if (this.getState() !== undefined) {
        //         // instance.listCategoryPasswords
        //     }
        //     else {
        //         // instance.listAllPasswords((err, passwords) => {
        //         //     if (err) {
        //         //         // display modal with error message for the user
        //         //         console.log("Failed to get all passwords from the enclave");
        //         //     }
        //         //     console.log(passwords);
        //         //     this.model = passwords;
        //         // })
        //         this.model = getModel();
        //     }
        // })

        if (this.getState() !== undefined) {
            this.filter = JSON.parse(this.getState());
            this.model = getModel(this.filter.category);
            console.log("the model created with filter ", this.model);
        }
        else {
            this.model = getModel();
        }

        // let state = this.History.getState();
        // let mountedCategoryPath = state.path;
        // let mountedCategoryIdentifier = state.identifier;
        // this.model = this.setModel({
        //     categoryName: state.data.name,
        //     mountedCategoryPath: mountedCategoryPath,
        //     mountedCategoryIdentifier: mountedCategoryIdentifier,
        //     pinNeedsToBeChecked: false,
        //     lastTimePinWasChecked: null,
        //     passwords: [],
        //     passwordsToShow: [],
        //     editModeEnabled: false,
        //     searchBar: {
        //         name: MODELS.searchBar.name,
        //         required: true,
        //         placeholder: MODELS.searchBar.placeholder,
        //         value: ''
        //     }
        // });
        //
        // this._getAllPasswords();
        // this._feedbackEmitterInit(element);
        //
        // this.addPasswordOnClick();
        // this.importPasswordOnClick();
        // this.showPasswordOnClick();
        // this.editPasswordOnClick();
        // this.sharePasswordOnClick();
        // this.shareCategoryOnClick();
        // this.deletePasswordOnClick();
        // this.searchBoxOnChange();
    }

    _feedbackEmitterInit(element) {
        this.feedbackEmitter = null;
        this.on('openFeedback', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.feedbackEmitter = e.detail;
        });
        element.addEventListener('validation-error', (e) => {
            const errorMessage = e.detail;
            this.feedbackEmitter(errorMessage, 'Validation Error', 'alert-danger');
        });
    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }

    _confirmPinModalHandler(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        this.showModal('confirmPinModal', this.model, (err, password) => {
            if (err) {
                console.log(err);
                return;
            }

            if (password !== null) {
                this.setModelObject('pinNeedsToBeChecked', false);
                this.setModelObject('lastTimePinWasChecked', +new Date);
            }
        });
    }

    _confirmActionModalHandler(event, callback) {
        event.preventDefault();
        event.stopImmediatePropagation();
        let deletedPassword = event.data;

        let actionModalModel = {
            title: MODELS.deletePassword.title,
            description: MODELS.deletePassword.description(deletedPassword.name.value, deletedPassword.email.value),
            acceptButtonText: MODELS.deletePassword.acceptButtonText,
            denyButtonText: MODELS.deletePassword.denyButtonText,
        }

        this.showModal('confirmActionModal', actionModalModel, (err, response) => {
            if (err) {
                console.log(err);
            }
            callback(err, response);
        });
    }

    _shareQRCodeModalHandler(event, model) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.showModal('shareQRCodeModal', model);
    }

    _importQRCodeModalHandler(event, callback) {
        event.preventDefault();
        event.stopImmediatePropagation();
        let qrCodeModalModel = {
            title: 'Scan a QR Code or insert the SEED of wanted password',
            importButtonName: 'Import password'
        }
        this.showModal('importQRCodeModal', qrCodeModalModel, callback);
    }

    searchBoxOnChange() {
        this.model.onChange('searchBar', (value) => {
            let searchBarValue = this.model.searchBar.value.toLowerCase();
            let filteredPasswords = this.model.passwords.filter(password => {
                return password.name.value.toLowerCase().includes(searchBarValue)
                    || password.domain.value.toLowerCase().includes(searchBarValue)
                    || password.email.value.toLowerCase().includes(searchBarValue)
            });
            this.setModelObject('passwordsToShow', filteredPasswords);
        });
    }

    pinNeedsToBeChecked(event) {
        // FOR THE MOMENT, WE PUT PIN CONFIRMATION ON HOLD
        // ===============================================
        // let lastCheckedDate = this.model.lastTimePinWasChecked;
        // if (lastCheckedDate === null || Math.abs((+new Date) - lastCheckedDate) >= TIME_LIMITS.PIN_CHECK_LIMIT) {
        //     this._confirmPinModalHandler(event)
        //     return true;
        // }
        // ===============================================
        return false;
    }

    showPasswordOnClick() {
        this.on('password-show-click', (event) => {
            if (!this.pinNeedsToBeChecked(event)) {
                this.negateField(event, 'showPassword');
            }
        });
    }

    editPasswordOnClick() {
        this.on('edit-button-click', (event) => {
            this.switchEditMode(event);
            let updateFields = this.negateField(event, 'editModeEnabled');
            if (updateFields === true) {
                this.updatePassword(event);
            }
        });
    }

    updatePassword(event) {
        let editedPassword = event.data;
        let toSendObject = {
            "name": editedPassword.name.value,
            "domain": editedPassword.domain.value,
            "email": editedPassword.email.value,
            "password": editedPassword.password.value
        }
        this.CategoryManagerService.editPassword(this.model.mountedCategoryPath, editedPassword.path, toSendObject, (err, data) => {
            if (err) {
                console.log(err, data);
                this._emitFeedback(event, "Password edited failed!", "alert-danger")
                return;
            }
            this._emitFeedback(event, "Password edited successfully!", "alert-success")
        });
    }

    negateField(event, fieldName) {
        let currentPasswords = this.model.passwords;
        let clickedPassword = event.data;

        let passwordIndex = currentPasswords.findIndex(pass => pass.identifier === clickedPassword.identifier);
        let boolValue = clickedPassword[fieldName];
        clickedPassword[fieldName] = !boolValue;

        currentPasswords = [
            ...currentPasswords.slice(0, passwordIndex),
            clickedPassword,
            ...currentPasswords.slice(passwordIndex + 1),
        ]
        this.setModelObject('passwordsToShow', currentPasswords);
        this.setModelObject('passwords', currentPasswords);
        return boolValue;
    }

    switchEditMode(event) {
        let currentPasswords = this.model.passwords;
        let clickedPassword = event.data;

        let passwordIndex = currentPasswords.findIndex(pass => pass.identifier === clickedPassword.identifier);

        clickedPassword.name.readOnly = !clickedPassword.name.readOnly;
        clickedPassword.domain.readOnly = !clickedPassword.domain.readOnly;
        clickedPassword.email.readOnly = !clickedPassword.email.readOnly;
        clickedPassword.password.readOnly = !clickedPassword.password.readOnly;

        currentPasswords = [
            ...currentPasswords.slice(0, passwordIndex),
            clickedPassword,
            ...currentPasswords.slice(passwordIndex + 1),
        ]
        this.setModelObject('passwords', currentPasswords);
    }

    deletePasswordOnClick() {
        this.on('delete-button-click', (event) => {
            this._confirmActionModalHandler(event, (err, response) => {
                if (err || response.value === false) {
                    return;
                }
                let deletedPassword = event.data;
                this.CategoryManagerService.deletePassword(this.model.mountedCategoryPath, deletedPassword.path, (err, data) => {
                    this._getAllPasswords();
                });
            });
        });
    }

    sharePasswordOnClick() {
        this.on('share-button-click', (event) => {
            let currentPassword = event.data;
            let qrCodeModalModel = {
                title: MODELS.shareModal.title('password'),
                description: MODELS.shareModal.description('password', currentPassword.name.value),
                data: event.data
            }
            this._shareQRCodeModalHandler(event, qrCodeModalModel);
        });
    }

    shareCategoryOnClick() {
        this.on('share-category-click', (event) => {
            let qrCodeModalModel = {
                title: MODELS.shareModal.title('category'),
                description: MODELS.shareModal.description('category', this.model.categoryName),
                data: {
                    identifier: this.model.mountedCategoryIdentifier
                }
            }
            this._shareQRCodeModalHandler(event, qrCodeModalModel);
        });
    }

    addPasswordOnClick() {
        this.on('add-password', (event) => {
            this.History.navigateToPageByTag('add-password', event.data);
        });
    }

    importPasswordOnClick() {
        this.on('import-password', (event) => {
            this._importQRCodeModalHandler(event, (err, data) => {
                if (err) {
                    this._emitFeedback(event, MESSAGES.ERROR.IMPORT_MODAL, MESSAGES.ERROR.ALERT_TYPE)
                    return;
                }
                this.CategoryManagerService.importPassword(this.model.mountedCategoryPath, data.value, (err, data) => {
                    if (err) {
                        this._emitFeedback(event, MESSAGES.ERROR.IMPORT_MODAL, MESSAGES.ERROR.ALERT_TYPE)
                        return;
                    }

                    this._emitFeedback(event, MESSAGES.SUCCESS.IMPORT_MODAL, MESSAGES.SUCCESS.ALERT_TYPE)
                    this._getAllPasswords();
                });
            });
        });
    }

    _getAllPasswords() {
        this.CategoryManagerService.listCategoryPasswords(this.model.mountedCategoryPath, (err, passwords) => {
            if (err) {
                passwords = [];
            }
            let updatedPasswords = passwords.map(password => this.getPasswordAsModel(password));
            this.setModelObject('passwords', updatedPasswords);
            this.setModelObject('passwordsToShow', updatedPasswords);
        });
    }

    setModelObject(key, object) {
        this.model.setChainValue(key, JSON.parse(JSON.stringify(object)));
    }

    getPasswordAsModel(password) {
        let data = password.data;
        let hiddenPassword = '*'.repeat(data.password.length);
        let dataToLowercase = data.name.toLowerCase();
        return {
            identifier: password.identifier,
            path: password.path,
            showPassword: false,
            name: {
                name: MODELS.name.name,
                required: true,
                readOnly: true,
                placeholder: MODELS.name.placeholder,
                value: data.name,
            },
            domain: {
                name: MODELS.domain.name,
                required: true,
                readOnly: true,
                placeholder: MODELS.domain.placeholder,
                value: data.domain
            },
            email: {
                name: MODELS.email.name,
                required: true,
                readOnly: true,
                placeholder: MODELS.email.placeholder,
                value: data.email
            },
            password: {
                name: MODELS.password.name,
                required: true,
                readOnly: true,
                placeholder: MODELS.password.placeholder,
                value: data.password
            },
            hiddenPassword: {
                name: MODELS.hiddenPassword.name,
                readOnly: true,
                value: hiddenPassword
            },
            error: {
                occurred: false,
                message: ''
            }
        };
    }
}