var config = {
    port: 3481,
    serverhost: 'http://localhost',
    environment: 'development', //development,staging,live
    secretKey: 'hyrgqwjdfbw4534efqrwer2q38945765',
    restaurantSearchDistance: 10000,
    adminUrl: 'http://localhost:4200/#/',
    production: {
        username: 'brain1uMMong0User',
        password: 'PL5qnU9nuvX0pBa',
        host: '68.183.173.21',
        port: '27017',
        dbName: 'Easyeats',
        authDb: 'admin'
    },
    emailConfig: {
        MAIL_USERNAME: "liveapp.brainium@gmail.com",
        MAIL_PASS: "YW5kcm9pZDIwMTY"
    },
    google: {
        API_KEY: "f1d7b2fd84c8675c345f95cc2976ce218739b96d6e05bf9af393e69ce4ff64c789d241537463a1f7f996d3840c7a072020692ce8f96a47dfc51e105f6f0d7a8888b6c2f01d243e3a0d48513653a4e9db8d5a91126f1d24ad95d3b5f5aa180af3bc9b31725bb567eb2e86a4ffdc82d53dcd1e8fd7c56174b074f64a64e3eacf5bbc7de0cae2643c"
    },
    emailTemplete: {
        logoUrl: "https://logo.com/",
        appUrl: "https://app.com/",
        helpUrl: "https://help.com/",
        facebookUrl: "https://facebook.com/",
        twitterUrl: "https://twitter.com",
        instagramUrl: "https://instagram.com/",
        snapchatUrl: "https://snapchat.com/",
        linkedinUrl: "https://www.linkedin.com",
        youtubeUrl: "https://www.youtube.com",
        loginUrl: "https://login.com/",
        androidUrl: "https://android.com/",
        iosUrl: "https://ios.com/",
    },
    payment: {
        secret_key: "sk_test_9c05820e4b8710f303e023355798b220a0678230",
        public_key: "pk_test_eec485ca81872117bc11b92f8316b214cc1407f0"
    }
}

module.exports = config;