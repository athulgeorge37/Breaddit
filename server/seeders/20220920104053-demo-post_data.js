'use strict';

// to create new seed file, execute:
// npx sequelize-cli seed:generate --name demo-mySeedName

const database_name = "Posts"

module.exports = {
	async up (queryInterface, Sequelize) {
		
		const date = new Date();

		const data = [
		{ author_id: 1, title: "Title 1", text: "hello world", createdAt: date, updatedAt: date },
		{ author_id: 1, title: "Title 2", text: "hello world", createdAt: date, updatedAt: date },
    { author_id: 3, title: "Title 3", text: "hello world", createdAt: date, updatedAt: date },
    { author_id: 4, title: "Title 4", text: "hello world", createdAt: date, updatedAt: date },
    { author_id: 5, title: "Title 5", text: "hello world", createdAt: date, updatedAt: date },
		]

		// to populate db with seed data execute:
		// npm run seed

		// table name must include a suffix s
		return queryInterface.bulkInsert(database_name, data, {});
	},

	async down (queryInterface, Sequelize) {

		// to delete seed data from db, execute:
		// npm run drop

		return queryInterface.bulkDelete(database_name, null, {});
	}
};
