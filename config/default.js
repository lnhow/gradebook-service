/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt
 */

module.exports = {

    api: {
        port: 3001,
        root: '', //root: '/api',
        version: '/v1',
        lang_code: 'vi',
        env: 'local',
        secret_key: 'a3e75cdd13bdff759417988f501978ae',
    },

    mysqldb: {
        host: 'b04wqnwkn9xxov6ohypk-mysql.services.clever-cloud.com',
        port: '3306',
        username: "uxqqsoofqrilu9ph",
        dbname: "b04wqnwkn9xxov6ohypk",
        passwrd: "bQ1b6s23Dwho8wOwtHNH",
    },

    logger: {
        console: {
            level: 'debug',
        },
        file: {
            logDir: 'logs',
            logFile: 'app_log.log',
            level: 'debug',
            maxsize: 1024 * 1024 * 10, // 10MB
            maxFiles: 5,
        },
    },
   
    acceptDomain: [
        'http://localhost:3000',
    ]
};
