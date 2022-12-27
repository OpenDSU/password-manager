import {getCategoryManagerServiceInstance} from '../services/CategoryManagerService.js';
import {MODELS} from '../services/Constants.js';

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

        this.setModel(getModel());
        this.addCategoryListener();
    }

    addCategoryListener() {
        this.onTagClick('add-new-category', () => {
            const newCategoryName = document.getElementById('category-name').value;
            getCategoryManagerServiceInstance((err, instance) => {
                if (err) {
                    // display modal with error message for the user (e.g. try again)
                }
                instance.addCategory(newCategoryName, (err) => {
                    if (err) {
                        // display modal with error message for the user (e.g. try again)
                    }
                    this.navigateToPageTag('view-items');
                })
            });
        });
    }
}