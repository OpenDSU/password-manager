import ContainerController from '../../cardinal/controllers/base-controllers/ContainerController.js';
import {getCategoryManagerServiceInstance} from "../services/CategoryManagerService.js";
import {getErrorMessageFromFieldsValidation} from '../services/Validator.js'
import {MESSAGES, MODELS} from '../services/Constants.js'

function getModel() {
    return {
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

export default class AddPasswordController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.CategoryManagerService = getCategoryManagerServiceInstance();
        this._populateCategoryList(history.location.state);
        this.addPasswordOnClick();
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