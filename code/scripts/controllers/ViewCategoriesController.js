// noinspection DuplicatedCode

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
        this.CategoryManagerService = getCategoryManagerServiceInstance();

        this.model = getModel();

        this.categoryMenuOnClick();
        this.addPasswordOnClick();
        this.addCategoryOnClick();
        this.categorySelectOnClick();
        this.searchBoxOnChange();
        this.importCategoryOnClick();
        this._getAllCategories();
        this._feedbackEmitterInit(element);
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

    searchBoxOnChange() {
        this.model.onChange('searchBar', (value) => {
            let searchBarValue = this.model.searchBar.value.toLowerCase();
            let filteredCategories = this.model.categories.filter(category => category.nameToLowercase.includes(searchBarValue));
            this.model.setChainValue('categoriesToShow', JSON.parse(JSON.stringify(filteredCategories)));
        });
    }

    categorySelectOnClick() {
        this.onTagClick('category-click', (event) => {
            console.log("EVENT CATEGORY", event.category);
            this.navigateToPageTag('view-passwords', JSON.stringify({
                category: event.category
            }));
        });

        // this.on('category-click', (event) => {
        //     this.History.navigateToPageByTag('view-passwords', JSON.parse(JSON.stringify(event.data)));
        // });
    }

    addCategoryOnClick() {
        this.onTagClick('add-category', (event) => {
            console.log("clicked add-category");
            this.navigateToPageTag('add-category');
        });

        // this.on('add-category', (event) => {
        //     this.History.navigateToPageByTag('add-category');
        // });
    }

    addPasswordOnClick() {
        this.onTagClick('add-password', (event) => {
            console.log("clicked add-password");
            this.navigateToPageTag('add-password');
        });

        // this.on('add-password', (event) => {
        //     this.History.navigateToPageByTag('add-password');
        // });
    }

    categoryMenuOnClick() { // ////////
        this.onTagClick('category-menu-trigger', (event) => {
            console.log("clicked category menu");
            let isClicked = this.model.categoryMenu.clicked;
            let nextCategoryMenu = {
                clicked: !isClicked,
                icon: isClicked ? 'plus' : 'minus'
            };
            this.model.categoryMenu = JSON.parse(JSON.stringify(nextCategoryMenu));
        });

        // this.on('category-menu-click', (event) => {
        //     let isClicked = this.model.categoryMenu.clicked;
        //     let nextCategoryMenu = {
        //         clicked: !isClicked,
        //         icon: isClicked ? 'plus' : 'minus'
        //     }
        //     this.model.setChainValue('categoryMenu', JSON.parse(JSON.stringify(nextCategoryMenu)));
        // });
    }

    _getAllCategories() {
        this.CategoryManagerService.listCategories((err, categories) => {
            if (categories.length === 0) {
                this._createMainCategories((err, data) => {
                    if (err) {
                        console.log(err, data);
                        return;
                    }
                    this._getAllCategories();
                });
                return;
            }

            if (err) {
                categories = [];
            }

            categories = categories.map(category => {
                return {
                    ...category,
                    'nameToLowercase': category.data.name.toLowerCase(),
                    'icon': category.data.folderType
                }
            })
            this.model.categories = JSON.parse(JSON.stringify(categories));
            this.model.categoriesToShow = JSON.parse(JSON.stringify(categories));

            // this.model.setChainValue('categories', JSON.parse(JSON.stringify(categories)));
            // this.model.setChainValue('categoriesToShow', JSON.parse(JSON.stringify(categories)));
        });
    }

    _createMainCategories(callback) {
        DEFAULT_CATEGORIES.forEach(category => this.CategoryManagerService.addCategory(category, callback));
    }

    importCategoryOnClick() { // ///////
        this.onTagClick('import-category', (event) => {
            console.log("clicked import-category");
            this._importQRCodeModalHandler(event, (err, data) => {
                if (err) {
                    console.log("EROARE IMPORT QR CODE MODAL HANDLER");
                    this._emitFeedback(event, MESSAGES.ERROR.IMPORT_MODAL, MESSAGES.ERROR.ALERT_TYPE);
                    return;
                }
                this.CategoryManagerService.importCategory(data.value, (err, data) => {
                    if (err) {
                        this._emitFeedback(event, MESSAGES.ERROR.IMPORT_MODAL, MESSAGES.ERROR.ALERT_TYPE)
                        return;
                    }
                    this._emitFeedback(event, MESSAGES.SUCCESS.IMPORT_MODAL, MESSAGES.SUCCESS.ALERT_TYPE)
                    this._getAllCategories();
                });
            });
        });

        // this.on('import-category', (event) => {
        //     this._importQRCodeModalHandler(event, (err, data) => {
        //         if (err) {
        //             this._emitFeedback(event, MESSAGES.ERROR.IMPORT_MODAL, MESSAGES.ERROR.ALERT_TYPE)
        //             return;
        //         }
        //         this.CategoryManagerService.importCategory(data.value, (err, data) => {
        //             if (err) {
        //                 this._emitFeedback(event, MESSAGES.ERROR.IMPORT_MODAL, MESSAGES.ERROR.ALERT_TYPE)
        //                 return;
        //             }
        //             this._emitFeedback(event, MESSAGES.SUCCESS.IMPORT_MODAL, MESSAGES.SUCCESS.ALERT_TYPE)
        //             this._getAllCategories();
        //         });
        //     });
        // });
    }

    _importQRCodeModalHandler(event, callback) {
        event.preventDefault();
        event.stopImmediatePropagation();
        let toBeImportedObject = 'category';
        let qrCodeModalModel = {
            title: MODELS.importModal.title(toBeImportedObject),
            importButtonName: MODELS.importModal.importButtonName(toBeImportedObject)
        }
        this.showModal('importQRCodeModal', qrCodeModalModel, callback);
    }
}