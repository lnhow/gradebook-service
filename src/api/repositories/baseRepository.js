/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const db = require('../../adapter/mysqlClient');

class BaseRepository {
  constructor(table) {
    this.table = table;
    this.db = db;
  }

  list(sql) {
    return new Promise((resolve, reject) => {
      this.db.connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  listCount(sql) {
    return new Promise((resolve, reject) => {
      this.db.connection.query(sql, (err, rows) => {
        if (err)
        reject(err);
      else {
        if (rows.length == 0) {
          resolve(null);
        }

        var string = JSON.stringify(rows);
        var json = JSON.parse(string);

        resolve(json[0]);
      }
      })
    });
  }

  show(id) {
    const sql = `SELECT t.* FROM ${this.table} t WHERE t.id=${id} LIMIT 1`;

    return new Promise((resolve, reject) => {
      db.connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else if (rows.length === 1) {
          resolve(rows[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  showByCol(col_name, col_value) {
    const sql = `SELECT t.* FROM ${this.table} t WHERE t.${col_name}='${col_value}' LIMIT 1`;
    return new Promise((resolve, reject) => {
      db.connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else if (rows.length === 1) {
          resolve(rows[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  create(params) {
    const now_date = new Date();
    params.created_at = now_date;

    const sql = `INSERT INTO ${this.table} SET ?`;

    return new Promise((resolve, reject) => {
      this.db.connection.query(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  update(id, params) {
    const now_date = new Date();
    params.updated_at = now_date;

    const sql = `UPDATE ${this.table} SET ? WHERE id=${id}`;

    return new Promise((resolve, reject) => {
      this.db.connection.query(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(rows);
        }
      });
    });
  }

  updateByCol(col_name, col_value, params) {
    const now_date = new Date();
    params.updated_at = now_date;

    const sql = `UPDATE ${this.table} SET ? WHERE ${col_name}=${col_value}`;

    return new Promise((resolve, reject) => {
      this.db.connection.query(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(rows);
        }
      });
    });
  }

  getCountFiltered(sql) {
    return new Promise((resolve, reject) => {
      this.db.connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else {
          resolve(rows[0].total);
        }
      });
    });
  }
}

module.exports = BaseRepository;
