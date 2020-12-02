import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';
import {MODELS} from '../services/Constants.js'

function getModel() {
    return {
        title: MODELS.masterPassword.title,
        masterPassword: {
            name: MODELS.masterPassword.name,
            required: true,
            placeholder: MODELS.masterPassword.placeholder,
            value: ''
        }
    };
}

export default class ConfirmPinController extends ModalController {
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(getModel());
        this.masterCheckOnClick();
    }

    masterCheckOnClick() {
        this.on('master-password-check', (event) => {
            let modelMasterPassword = this.model.masterPassword;
            if (modelMasterPassword !== null) {
                modelMasterPassword.value = '';
            }
            this._finishProcess(event)
        });
    }

    _finishProcess (event) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, this.model.masterPassword.value);
    };
}
