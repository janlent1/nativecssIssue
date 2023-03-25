module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "browsers": [
                        "last 1 Chrome versions",
                        "last 1 Edge versions",
                        "last 1 Safari versions"
                    ]
                },
                "modules": false
            }
        ]
    ]
};