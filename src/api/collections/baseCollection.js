/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
class baseCollection {

	constructor(table) {
		this.table = table;

		this.arrayFilter = [];
		this.stringSelect = 'SELECT t.* ';
		this.arrayTable = [];
		this.stringJoin = '';
		this.arrayCondition = [];
		this.stringCondition = ' ';
		this.stringFilter = ' ';
		this.limit = 20;
		this.offset = 0;
	}

	reset() {
		this.arrayFilter = [];
		this.stringSelect = 'SELECT t.* ';
		this.arrayTable = [];
		this.stringJoin = '';
		this.arrayCondition = [];
		this.stringCondition = ' ';
		this.stringFilter = ' ';
		this.limit = 20;
		this.offset = 0;
	}

	setLimit(limit) {
		let _limit = Math.min(limit, 2000);
		_limit = Math.max(_limit, 1);
		this.limit = _limit;
		console.log('================:setLimit');
		console.log(this.limit);
	}

	setOffset(pageNumber) {
		console.log('================:setOffset');
		console.log(pageNumber);
		this.offset = (this.limit) * (pageNumber - 1);
		console.log(this.offset);
	}

	addSelect(arrayField = []) {

		if (arrayField.length != 0) {
			for (let i = 0; i < arrayField.length; i++) {
				if (i == 0) {
					this.stringSelect = `SELECT ${arrayField[i]}`
				} else {
					this.stringSelect += `, ${arrayField[i]}`;
				}
			}
		}

		return this.stringSelect;
	}

	join(table, fieldJoin, rootJoin, typeJoin = '') {
		this.stringJoin += ` ${typeJoin} JOIN ${table} ON ${fieldJoin} = ${rootJoin} `;
		return this.stringJoin;

	}

	where(field, operation, value) {
		if (field != '') {

			if (operation == 'LIKE') {
				value = `'%` + value + `%'`
			} else if (operation == 'IN') {
				value = value
			} else {
				value = `'` + value + `'`
			}

			let condition = {
				connect: 'AND',
				field: field,
				operation: (operation != '') ? operation : '=',
				value: value
			};

			this.arrayCondition.push(condition);
		}
	}

	whereIsNULL(field) {
		if (field != '') {

			let condition = {
				connect: 'AND',
				field: field,
				operation: 'IS',
				value: null
			};

			this.arrayCondition.push(condition);
		}
	}

	andOrWhereIsNULL(field, pos_cond) {

		let value = null;
		if (field != "") {

			let condition = {
				operation: "IS",
			}
			switch (pos_cond) {
				case 'first':
					condition.connect = "AND"
					condition.field = "(" + field;
					condition.value = value;
					break;
				case 'middle':
					condition.connect = "OR"
					condition.field = field;
					condition.value = value;
					break;
				case 'last':
					condition.connect = "OR"
					condition.field = field;
					condition.value = value + ")";
					break;
				default:
			}

			this.arrayCondition.push(condition);
		}
	}

	andOrWhere(field, operation, value, pos_cond) {
		if (field != "") {
			if (operation == "LIKE") {
				value = `'%${value}%'`;
			} else
				if (operation == "IN") {
					value = `${value}`;
				}
				else {
					value = `'${value}'`;
				}

			let condition = {
				operation: operation != "" ? operation : "=",
			}
			switch (pos_cond) {
				case 'first':
					condition.connect = "AND"
					condition.field = "(" + field;
					condition.value = value;
					break;
				case 'middle':
					condition.connect = "OR"
					condition.field = field;
					condition.value = value;
					break;
				case 'last':
					condition.connect = "OR"
					condition.field = field;
					condition.value = value + ")";
					break;
				default:
			}

			this.arrayCondition.push(condition);
		}
	}

	orwhere(field, operation, value) {
		if (field != '') {

			if (operation == 'LIKE') {
				value = `'%` + value + `%'`
			} else if (operation == "IN") {
				value = `${value}`;
			} else {
				value = `'` + value + `'`
			}

			let condition = {
				connect: 'OR',
				field: field,
				operation: (operation != '') ? operation : '=',
				value: value
			};

			this.arrayCondition.push(condition);
			//this.arrayCondition[field].push(condition);

		}
	}

	orderBy() {
		let string_filter = '';
		for (let i = 0; i < this.arrayFilter.length; i++) {
			if (i == 0) {
				string_filter += " ORDER BY " + `${this.arrayFilter[i].field}` + ` ${this.arrayFilter[i].sort_by}`;
			} else {
				string_filter += `, ${this.arrayFilter[i].field} ${this.arrayFilter[i].sort_by}`
			}
		}
		this.stringFilter = string_filter;
		return this.stringFilter;


	}

	addSort(field = '', value = '') {
		if (field != '' && value != '') {
			let record = {
				field: field,
				sort_by: value
			};

			this.arrayFilter.push(record);

		}
	}

	genCondition() {
		let stringCondition = '';
		if (this.arrayCondition.length > 0) {
			let arrayCheckExist = [];
			for (let i = 0; i < this.arrayCondition.length; i++) {
				arrayCheckExist[this.arrayCondition[i].field + "_" + this.arrayCondition[i].value] = this.arrayCondition[i];
			}

			let i = 0;
			for (var data in arrayCheckExist) {
				if (i == 0) {
					stringCondition += `WHERE ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
				} else {
					stringCondition += ` ${arrayCheckExist[data].connect} ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
				}
				i++;
			}
		}
		return stringCondition;
	}

	finallizeTotalCount() {
		const condition = this.genCondition();
		const sql = (this.arrayCondition.length === 0)
			? `SELECT count(*) AS total FROM ${this.table} t ${this.stringJoin}`
			: `SELECT count(*) AS total FROM ${this.table} t ${this.stringJoin} ${condition}`
			;

		return sql;
	}

	finallize(is_limit = true) {

		let sql_string = '';
		this.stringCondition = this.genCondition();

		sql_string = this.stringSelect +
			` FROM ${this.table} t ` +
			this.stringJoin +
			this.stringCondition +
			this.orderBy();

		if (is_limit == true) {
			sql_string += ` LIMIT ${this.limit} OFFSET ${this.offset}`;
			console.log(sql_string);
		}

		this.reset();
		return sql_string;

	}

	find(value) {
		return this.stringSelect +
			`FROM ${this.table} t ` +
			`WHERE id = ${value}` +
			`LIMIT 1`;
	}
}

module.exports = baseCollection;
