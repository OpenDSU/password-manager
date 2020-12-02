import ContainerController from '../../cardinal/controllers/base-controllers/ContainerController.js';
import {getCategoryManagerServiceInstance} from '../services/CategoryManagerService.js'
import {getErrorMessageFromFieldsValidation} from '../services/Validator.js'
import {MODELS} from '../services/Constants.js'

const CATEGORIES_DATA_PATH = '/code/categories.json';

function getModel() {
    return {
        name: {
            label: MODELS.name.label,
            name: MODELS.name.name,
            required: true,
            placeholder: MODELS.name.placeholder,
            value: ''
        },
        iconChooser: {
            size: '25px',
            color: 'black',
            value: ''
        },
        error: {
            occurred: false,
            message: ''
        }
    }
}

export default class AddPasswordController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.CategoryManagerService = getCategoryManagerServiceInstance();

        this.getModel = this.setModel(getModel());
        this.addCategoryOnClick();
    }

    addCategoryOnClick() {
        this.on('add-category-submit', (event) => {
            let errorMessage = getErrorMessageFromFieldsValidation(this.model);
            if (errorMessage) {
                this._setErrorMessage(errorMessage);
                return;
            }
            let toSendObject = {
                "name": this.model.name.value,
                "folderType": this.model.iconChooser.value
            }
            this.CategoryManagerService.addCategory(toSendObject, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.History.navigateToPageByTag('view-items');
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
}