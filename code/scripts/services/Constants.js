let MESSAGES = {
    ERROR: {
        ALERT_TYPE: 'alert-danger',
        PASSWORDS_MUST_MATCH: 'Passwords must match.',
        IMPORT_MODAL: 'Importing failed!',
        EDIT_PASSWORD: ''
    },
    SUCCESS: {
        ALERT_TYPE: 'alert-success',
        IMPORT_MODAL: 'Importing was successfully!'
    }
}

let MODELS = {
    name: {
        label: 'Name',
        name: 'name',
        placeholder: 'Name here...'
    },
    domain: {
        label: 'Domain',
        name: 'domain',
        placeholder: 'Domain here...'
    },
    email: {
        label: 'Email address',
        name: 'email',
        placeholder: 'Email address here...'
    },
    category: {
        label: 'Select category',
        placeholder: 'Please select one category...'
    },
    password: {
        label: 'Enter your password',
        confirmLabel: 'Confirm your password',
        name: 'password',
        hint: 'The submission will create an account using your name and password.',
        placeholder: 'Password here...'
    },
    masterPassword: {
        title: 'Insert the master password',
        name: 'masterPassword',
        placeholder: 'Master password...'
    },
    hiddenPassword: {
        name: 'hiddenPassword'
    },
    folderRadioGroup: {
        label: 'Choose a folder type',
        optionValues: [
            'users',
            'ticket',
            'briefcase',
            'shopping-cart',
            'at',
            'university',
            'gamepad'
        ],
        value: 'users'
    },
    searchBar: {
        name: 'searchBar',
        placeholder: 'Search here...'
    },
    importModal: {
        title: (object) => `Scan a QR Code or insert the SEED of wanted ${object}`,
        importButtonName: (object) => `Import ${object}`
    },
    shareModal: {
        title: (object) => `Share your ${object}`,
        description: (object, objectName) => `Sharing your ${object} named ${objectName} means someone else will have access to it. Think twice about it.`,
    },
    deletePassword: {
        title: 'Are you sure?',
        description: (passwordName, passwordEmail) => `Deleting the password named ${passwordName} with email ${passwordEmail} is a non-reversible process. Think twice about it.`,
        acceptButtonText: 'Yes, delete it',
        denyButtonText: 'No, go back',
    }
}

let DEFAULT_CATEGORIES = [
    {
        name: 'Social',
        folderType: 'users'
    },
    {
        name: 'Entertainment',
        folderType: 'ticket'
    },
    {
        name: 'Business',
        folderType: 'briefcase'
    },
    {
        name: 'Shopping',
        folderType: 'shopping-cart'
    },
]

let TIME_LIMITS = {
    PIN_CHECK_LIMIT : 10000
}

export {
    MESSAGES, MODELS, DEFAULT_CATEGORIES, TIME_LIMITS
}