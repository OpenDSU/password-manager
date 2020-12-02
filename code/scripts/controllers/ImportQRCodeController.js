import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';

export default class ImportQRCodeController extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model.setChainValue('data', '');
        this.model.setChainValue('importIsDisabled', true);

        this.importSeedInputOnChange();
        this.importOnClick();
    }

    importSeedInputOnChange() {
        this.model.onChange("data", (value) => {
            if (this.model.data.length > 5) {
                this.model.setChainValue('importIsDisabled', false);
            } else {
                this.model.setChainValue('importIsDisabled', true);
            }
        })
    }

    importOnClick() {
        this.on('import-on-click', (event) => {
            this._finishProcess(event, {value: this.model.data});
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
