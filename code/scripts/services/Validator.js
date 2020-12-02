function isFieldEmpty(field) {
    return field === undefined || field === null || field.trim() === '';
}

function fieldIsTooShort(field) {
    return field === undefined  || field === null || field.trim().length < 6;
}

function getErrorMessageFromFieldsValidation(model) {
    let validKeys = Object.keys(model).filter(modelName => model[modelName].label && !model[modelName].options);
    let emptyFieldKey = validKeys.find(key => isFieldEmpty(model[key].value))
    if (emptyFieldKey) {
        return model[emptyFieldKey].label + ' cannot be empty.'
    }

    let tooShortFieldKey = validKeys.find(key => fieldIsTooShort(model[key].value))
    if (tooShortFieldKey) {
        return model[tooShortFieldKey].label + ' is too short.'
    }
    return null;
}


export {
    getErrorMessageFromFieldsValidation
};