module.exports = {
    "extends": "airbnb-base",
    "settings": {
        "import/resolver": {
            "node": {
                "moduleDirectory": ["node_modules", "src/"]
            }
        }
    },
    "rules": {
        "no-console": 0,
        "arrow-body-style": 0,
        "camelcase": 0,
        "quotes": 0,
        "no-plusplus": 0,
        "no-case-declarations": 0
    }
};