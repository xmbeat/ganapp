import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { DatabaseFacade } from '../../app/database';

@Injectable()
export class Configurations {
	private defaultConnection: any = {name: 'database.db', location: 'default'};
	private defaultDatabase: SQLiteObject = null;
	private db: DatabaseFacade;
	private table:string;
	public configs: any = {};
	constructor(){
		this.table = "Configurations";
		this.db = new DatabaseFacade();
	}

	getDefaultDatabase(): Promise<any>{
		if (this.defaultDatabase){
			return Promise.resolve(this.defaultDatabase);
		}

		return new SQLite().create(this.defaultConnection)
		.then(db=>{
			this.defaultDatabase = db;
			return db;
		});
	}

	setDatabase(db: SQLiteObject){
		this.db.setDatabase(db);
	}

	init(): Promise<any>{
		return this.db.createTable(this.table, {key: ["TEXT", "NOT NULL"], value: ["TEXT"]})
		.then(()=>{
			this.db.get(this.table).then(configs=>{
		       let result = {};
		       for (let config of configs){
		         result[config['key']] = JSON.parse(config['value']);
		       }
		       this.configs = result;
		    });
		});
	}

	save(): Promise<any>{
		if (this.configs == null || this.configs.length == 0){
			return Promise.reject(new Error("Configurations is empty"));
		}

		let promesa: Promise<any> = null;
	    for(let key in this.configs){
	      let row = {};
	      row['key'] = key;
	      row['value'] = JSON.stringify(this.configs[key]);
	      //Si ya habia una promesa (Un guardado anterior ejecutandose)
	      if (promesa != null){
	        promesa = promesa.then(()=>{
	          return this.db.save(this.table, row, ["key"]).then();
	        });
	      }
	      else{
	        promesa = this.db.save(this.table, row, ["key"]);
	      }
	    }
	    return promesa;
	}
}