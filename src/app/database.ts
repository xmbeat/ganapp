
import {SQLiteObject} from '@ionic-native/sqlite';

export class DatabaseFacade {
  	db: SQLiteObject;
  	
	constructor(db: SQLiteObject = null) {
		this.db = db;
	}	

	getDatabase(){
		return this.db;
	}
	
	setDatabase(db: SQLiteObject){
		this.db = db;
	}

	private escapeString (val:string) {/*
	  val = val.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
	    switch (s) {
	      case "\0":
	        return "\\0";
	      case "\n":
	        return "\\n";
	      case "\r":
	        return "\\r";
	      case "\b":
	        return "\\b";
	      case "\t":
	        return "\\t";
	      case "\x1a":
	        return "\\Z";
	      case "'":
	      case '"':
	      default:
	        return "\\" + s;
	    }
	  });
		*/
	  return val.replace("'", "''");
	}

	private translateValue(value, onArraySeparator = ", ", escapeChar = "'"){
		if (value instanceof String ){
			value = escapeChar + this.escapeString(value.valueOf()) + escapeChar;
		}
		else if (typeof(value) === 'string'){
			value = escapeChar + this.escapeString(value) + escapeChar;
		}
		else if (value instanceof Number){
			value = value.valueOf();
		}
		else if (typeof(value) === "number"){
			value = value;
		}
		else if (typeof(value) === 'boolean'){
			value = value?1:0;
		}
		else if (value == null){
			value = "NULL";
		}
		else if (value instanceof Array){
			let translatedArray = value.map((value, index, array) => {
				return this.translateValue(value, onArraySeparator, escapeChar);
			});
			value = translatedArray.join(onArraySeparator);
		}
		return value;
	}

	/** 
	 * Construye un objeto string que representa la parte "WHERE", "SET", "COL_NAMES" o "VALUES" 
	 * de una consulta SQL. 
	 * @param {Array} conditions - Arreglo asociativo de donde se formara la consulta. Las llaves del arreglo pueden ser las columnas de las tablas, "__or" o "__and".
	 * @param {number} type - Tipo de consulta en la que se usará, 0 para usar solo las llaves, 1 para usar los valores, 2 para la parte "SET", 3 para la parte "WHERE"
	 */
	private implodeQuery(model:any, conditions:any, separator:string, type:number = 0):string{
		let result = "";
		let sep = "";
		let operator = [];
		operator[""] = " = ";
		operator["eq"] = " = ";
		operator["is"] = " is ";
		operator["lt"] = " < ";
		operator["lte"] = " <= ";
		operator["gt"] = " > ";
		operator["gte"] = " >= ";
		operator["in"] = " IN ";
		operator["btw"] = " BETWEEN ";
		operator["like"] = " LIKE ";
		operator["and"] = "";
		operator["or"] = "";

		if (conditions == null){
			conditions = {};
		}

		for(let key in conditions){		
			
			//Si mostramos solo el atributo
			if (type == 0) {
				//Si la llave de las condiciones no existe en el modelo, la ignoramos
				if (model && !(key in model['fields']) ){
					continue;
				}	
				result += sep + key;
			}
			//Si mostramos solo el valor
			else if(type == 1){
				//Si la llave de las condiciones no existe en el modelo, la ignoramos
				if (model && !(key in model['fields']) ){
					continue;
				}	
				result += sep + this.translateValue(conditions[key]);
			}
			//Parte SET
			else if (type == 2){
				//Si la llave de las condiciones no existe en el modelo, la ignoramos
				if (model && !(key in model['fields']) ){
					continue;
				}
				result += sep + key + " = " + this.translateValue(conditions[key]);
			}
			//Parte WHERE
			else {
				let op = "eq";
				let index = key.indexOf("__");
				let negation = "";
				let value;
				let attr = key;
				//Hay especificado un operador en el atributo
				if (index >= 0){
					op = key.substring(index + 2);
					attr = key.substring(0, index);

					let symbol = op.split("_");

					if (symbol[0] == "not"){
						if (symbol.length > 1){
							op = symbol[1];
						}
						negation = "NOT ";
					}
					else{
						op = symbol[0];
						if (symbol.length > 1 && symbol[1] == "not"){
							negation = "NOT ";
						}
					}

				}

				//Si la llave de las condiciones no existe en el modelo, la ignoramos
				if (model && !(attr in model['fields']) ){
					continue;
				}	
				
				if (op == "eq" && conditions[key] == null){
					op = "is";
				}

				if (op == "in"){
					value = "(" + this.translateValue(conditions[key], ", ") + ")";
				}
				else if (op == "and"){
					value = "(" + this.implodeQuery(model, conditions[key], " AND ", 3) + ")";
				}
				else if (op == "or"){
					value = "(" + this.implodeQuery(model, conditions[key], " OR ", 3) + ")";
				}
				else {
					value = this.translateValue(conditions[key], " AND ");
				}

				result += sep + negation +  "(" + attr + operator[op] +  value + ")";
			}
			sep = separator;
		}

		//Caso especial, cuando no hay nada, hacemos el query con el insert por defecto, es decir 'rowid' a null
		if (result.length == 0){
			if (type == 0){
				result = 'rowid';
			}
			else if (type == 1){
				result = 'null';
			}
			//Los demas tipos no deberian llamarse con este parametro vacio
		}

		return result;
	}
	
	createTable(table: string, obj:any){
		let sql = "CREATE TABLE IF NOT EXISTS '" + this.escapeString(table) + "'";
		let columns = "";
		let separator = "";
		let primaryKeys = "";
		let separatorKey = "";
		if (!('id' in obj)){
			obj['id'] = ["INTEGER", "PRIMARY KEY"];
		}
		for (let prop in obj){
			columns += separator + prop;
			for (let opt of obj[prop]){
				if (opt.toLowerCase() == "primary key"){
					primaryKeys += separatorKey + prop;
					separatorKey = ", ";
				}
				else{
					columns += " " + opt;		
				}
			}
			separator = ", ";
		}
		sql += "(" + columns;
		if (primaryKeys != ""){
			sql += ", PRIMARY KEY(" + primaryKeys + ")"; 
		}
		sql += ")";
		if (this.db == null){
			return Promise.reject(new Error("DB is not setted"));
		}
		return this.db.executeSql(sql, []);
	}

	delete(model: any, attribs:any){
		let table = null;
		if (typeof(model) == 'string'){
			table = model;
			model = null;
		}
		else{
			table = model['table'];
		}
		let sql = "DELETE FROM " + this.escapeString(table);
		let where = this.implodeQuery(model, attribs, " AND ", 3);
		if (where && where.length > 0){
			sql += " WHERE " + where;
		}
		if (this.db == null){
			return Promise.reject({code:5});
		}
		console.log("QUERY:" + sql);
		return this.db.executeSql(sql, []);
	}

	/**
	 * Obtiene los registros de una tabla que cumplan con los criterios ingresados
	 * @example
	 * //Regresa los registros de "TableName" donde la columa "col1" sea igual a "ValueOfCol1",
	 * //"col2" sea mayor a "12" y "col3" no esté en el conjunto (1, 3, 4).
	 * //internamente crea una consulta SQL asi: 
	 * //SELECT * FROM 'TableName' WHERE (col1 = 'ValueOfCol1') AND (col2 > 12) AND NOT (col3 in (1, 3, 4));
	 * get("TableName", {col1: 'ValueOfCol1', col2__lt: 12, col3__not_in:[1, 3, 4]});
	 * @param {any} model - modelo donde se obtendran los registros si es string se toma como nombre de la tabla.
	 * @param {any} attribs - criterios de filtracion, debe ser un arreglo asociativo en el que cada llave corresponde una columna de la tabla.
	 * @param {number} limit - la cantidad de registros a leer.
	 * @param {number} offset - posicion desde donde se empezará a leer.
	 */
	get(model: any, attribs:any = null, limit:number = -1, offset:number = 0, order_by:string = null, sort = 0, columns:Array<string> = null){
		let table = null;
		let columnPart = "*";
		if (typeof(model) == 'string'){
			table = model;
			model = null;
		}
		else{
			table = model['table'];
		}
		if (columns){
			columnPart = this.translateValue(columns, ", ", "\"");
		}
		let sql = "SELECT " + columnPart + " FROM '" + this.escapeString(table) + "'";
		let where = this.implodeQuery(model, attribs, " AND ", 3);
		
		if (where && where.length > 0){
			sql += " WHERE " + where;
		}

		if (order_by && order_by.length > 0){
			sql += " ORDER BY '" + this.escapeString(order_by) + "'";
			if (sort == 0){
				sql += " ASC";
			}
			else{
				sql += " DESC";
			}
		}
		
		sql += " LIMIT " + limit + " OFFSET " + offset;
		if (this.db == null){
			return Promise.reject({code:5});
		}
		console.log("QUERY: " + sql);
		return this.db.executeSql(sql, [])
		.then(response => {
			let result = [];
			for (let i = 0; i < response.rows.length; i++){
				result.push(response.rows.item(i));
			}
			return Promise.resolve(result);
		})
		.catch(error=> Promise.reject(error));
	}

	update(model: any, obj:any, conditions:any){
		let table = null;
		if (typeof(model) == 'string'){
			table = model;
			model = null;
		}
		else{
			table = model['table'];
		}
		let sql = "UPDATE '" + this.escapeString(table) + "'";
		sql += " SET " + this.implodeQuery(model, obj, ", ", 2);
		sql += " WHERE " + this.implodeQuery(model, conditions, " AND ", 3);
		if (this.db == null){
			return Promise.reject({code:5});
		}
		console.log("QUERY: " + sql);
		return this.db.executeSql(sql, []).then(response=>{
			return Promise.resolve(response.rowsAffected);
		});
	}

	create(model:any, obj:any){
		let table = null;
		if (typeof(model) == 'string'){
			table = model;
			model = null;
		}
		else{
			table = model['table'];
		}
		let sql = "INSERT INTO '" + this.escapeString(table) + "'";
		sql += " (" + this.implodeQuery(model, obj, ", ", 0) + ")";
		sql += " VALUES(" + this.implodeQuery(model, obj, ", ", 1) +")";
		if (this.db == null){
			return Promise.reject({code:5});
		}
		console.log("QUERY: " + sql);
		return this.db.executeSql(sql, []).then(response=>{
			return Promise.resolve(response.insertId);
		});
	}

	save (model: any, obj:any, primaryKeys = []): Promise<any>{
		//No hay llaves primarias 
		if (primaryKeys == null || primaryKeys.length  == 0){
			//Se ingreso un id superior a 0, tratamos de actualizar
			//si no creamos uno nuevo con el id pasado
			if (obj && 'id' in obj && obj['id'] > 0){
				return this.update(model, obj, {id: obj['id']})
				.then(affected=>{
					if (affected == 0){
						return this.create(model, obj);
					}
					return obj['id'];
				});
			}
			else{
				return this.create(model, obj);
			}
		}
		//Hay llaves primarias debemos hacer un update considerandolas
		else{
			//Creamos las condiciones del query con las llaves primarias
			let conditions = {};
			for (let primaryKey of primaryKeys){
				conditions[primaryKey] = obj[primaryKey];
			}
			//Si el objeto tiene un id mayor a 0 lo metemos al query
			if ('id' in obj && obj['id'] > 0){
				conditions['id'] = obj['id'];
			}

			//Tratamos de hacer un update
			return this.update(model, obj, conditions).then(affected=>{
				if (affected == 0){
					return this.create(model, obj);
				}
				else if (affected == 1){
					if ('id' in obj && obj['id'] > 0){
						return obj['id'];
					}
					else{
						return this.get(model, conditions, 1).then((results:any)=>{
							if (results && results.length == 1){
								return results[0]['id'];
							}
							return 0;
						});
					}
				}
				return -affected;
			});
		}
	}
	
}
