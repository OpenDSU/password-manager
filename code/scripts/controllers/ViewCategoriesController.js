import { getCategoryManagerServiceInstance } from "../services/CategoryManagerService.js";
import {MODELS, MESSAGES, DEFAULT_CATEGORIES} from '../services/Constants.js';
import { CategoriesDataSource } from "../datasources/CategoriesDataSource.js";

const {WebcController} = WebCardinal.controllers;

function getModel() {
    return {
        categoriesToShow: new CategoriesDataSource(),
        categories: new CategoriesDataSource(),
        searchBar: {
            name: MODELS.searchBar.name,
            required: true,
            placeholder: MODELS.searchBar.placeholder,
            value: ''
        },
        categoryMenu: {
            clicked: false,
            icon: 'plus'
        }

    }
}

export default class ViewCategoriesController extends WebcController {
    category;

    constructor(element, history) {
        super(element, history);
        // this.CategoryManagerService = getCategoryManagerServiceInstance();

        this.model = getModel();

        this.addPasswordOnClick();
        this.addCategoryOnClick();
        this.categorySelectOnClick();
        this.searchBoxOnChange();
        this._feedbackEmitterInit(element);
    }

    searchBoxOnChange() {
        this.model.onChange('searchBar', (value) => {
            let searchBarValue = this.model.searchBar.value.toLowerCase();
            let filteredCategories = this.model.categories.filter(category => category.nameToLowercase.includes(searchBarValue));
            this.model.setChainValue('categoriesToShow', JSON.parse(JSON.stringify(filteredCategories)));
        });
    }

    categorySelectOnClick() {
        this.onTagClick('category-click', (event) => {
            this.navigateToPageTag('view-passwords', JSON.stringify({
                category: event.category
            }));
        });
    }

    addCategoryOnClick() {
        this.onTagClick('add-category', (event) => {
            this.navigateToPageTag('add-category');
        });
    }

    addPasswordOnClick() {
        this.onTagClick('add-password', (event) => {
            this.navigateToPageTag('add-password');
        });
    }

    _createMainCategories(callback) {
        DEFAULT_CATEGORIES.forEach(category => this.CategoryManagerService.addCategory(category, callback));
    }
}