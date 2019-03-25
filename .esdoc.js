module.exports = {
    "source": ".",
    "destination": "./docs",
    "excludes": ["node_modules"],
    "plugins": [
        {
            "name": "esdoc-standard-plugin",
            "option": {
                "lint": {"enable": true},
                "coverage": {"enable": true},
                "accessor": {"access": ["public", "protected", "private"], "autoPrivate": true},
                "undocumentIdentifier": {"enable": true},
                "unexportedIdentifier": {"enable": false},
                "typeInference": {"enable": true},
                "brand": {
                  // "logo": "./logo.png",
                  "title": "My Library",
                  "description": "this is awesome library",
                  "repository": "https://github.com/foo/bar",
                  "site": "http://my-library.org",
                  "author": "https://twitter.com/foo",
                  "image": "http://my-library.org/logo.png"
                },
                // "manual": {
                //   "index": "./manual/index.md",
                //   "globalIndex": true,
                //   "asset": "./manual/asset",
                //   "files": [
                //     "./manual/overview.md"
                //   ]
                // },
                "test": {
                  "source": "./tests/",
                  "interfaces": ["describe", "it", "context", "suite", "test"],
                  "includes": ["(spec|Spec|test|Test)\\.js$"],
                  "excludes": ["\\.config\\.js$"]
                }
            }
        },
        {"name": "esdoc-ecmascript-proposal-plugin", "option": {"all": true}}
    ]
};