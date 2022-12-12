import {getCategoryManagerServiceInstance} from '../services/CategoryManagerService.js'
import {MODELS} from '../services/Constants.js'
import { CategoriesDataSource } from "../datasources/CategoriesDataSource.js";

const { WebcController } = WebCardinal.controllers;

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

export default class AddCategoryController extends WebcController {
    constructor(...props) {
        super(...props);
        this.CategoryManagerService = getCategoryManagerServiceInstance();

        this.getModel = this.setModel(getModel());

        this.addCategoryListener();
        // this.addCategoryOnClick();
    }

    addCategoryListener() {
        this.onTagClick('add-new-category', () => {
            console.log("clicked add-new-category");
            const newCategoryName = document.getElementById('category-name').value;
            this.model.dataSource = new CategoriesDataSource();
            this.model.dataSource.addCategoryToEnclave(newCategoryName);
        });
    }

    // addCategoryOnClick() {
    //     this.on('add-category-submit', (event) => {
    //         let errorMessage = getErrorMessageFromFieldsValidation(this.model);
    //         if (errorMessage) {
    //             this._setErrorMessage(errorMessage);
    //             return;
    //         }
    //         let toSendObject = {
    //             "name": this.model.name.value,
    //             "folderType": this.model.iconChooser.value
    //         }
    //         this.CategoryManagerService.addCategory(toSendObject, (err, data) => {
    //             if (err) {
    //                 console.log(err);
    //                 return;
    //             }
    //             this.History.navigateToPageByTag('view-items');
    //         });
    //     });
    // }
    //
    // _setErrorMessage(message) {
    //     let error = {
    //         occurred: message || message === null || message.trim() === '',
    //         message: message
    //     }
    //     this.model.setChainValue('error', JSON.parse(JSON.stringify(error)));
    // }
}