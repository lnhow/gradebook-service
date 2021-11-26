/*
 * Copyright (c) Nhat Tin 2019. All Rights Reserved.
 */

var mysql = require('mysql');
const config = require('config');
const logger = require('../utils/logger');

const { host, username, passwrd, port, dbname } = config.get('mysqldb');
var pool = mysql.createPool({
    connectionLimit : 10,
    waitForConnections: true,
    host: host,
    port: port,
    user: username,
    password: passwrd,
    database: dbname
});

exports.connection = {
    query: function () {
        var queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        // console.log('SQL = ', queryArgs[0]);

        pool.getConnection(function (err, conn) {
			
			logger.info('Sql client has been successfully created');
			
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }

            if (conn) { 
                
                var q = conn.query.apply(conn, queryArgs);

                q.on('end', function () {
                    conn.release();
                    logger.info(`Connection release`);
                });

                events.forEach(function (args) {
                    q.on.apply(q, args);
                });
            }
        });

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
};