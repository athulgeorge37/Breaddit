'use strict';

// to create new seed file, execute:
// npx sequelize-cli seed:generate --name demo-mySeedName

const bcrypt = require("bcrypt");

const database_name = "Users"

module.exports = {
	async up (queryInterface, Sequelize) {
		
		const hashed_pssword = await bcrypt.hash("Pass1!", 10); 
		const date = new Date();

		const data = [
		{ email: "Jim@gmail.com", username: "Jim", password: hashed_pssword, createdAt: date },
		{ email: "Pam@gmail.com", username: "Pam", password: hashed_pssword, createdAt: date },
		{ email: "Hank@gmail.com", username: "Hank", password: hashed_pssword, createdAt: date },
		{ email: "Walt@gmail.com", username: "Walt", password: hashed_pssword, createdAt: date },
		{ email: "Bob@gmail.com", username: "Bob", password: hashed_pssword, createdAt: date },
		]

		// to populate db with seed data execute:
		// npm run seed
		// the actual script is in package.json

		// table name must include a suffix s
		return queryInterface.bulkInsert(database_name, data, {});
	},

	async down (queryInterface, Sequelize) {

		// to delete seed data from db, execute:
		// npm run drop
		// the actual script is in package.json

		return queryInterface.bulkDelete(database_name, null, {});
	}
};
