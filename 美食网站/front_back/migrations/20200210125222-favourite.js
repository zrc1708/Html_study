'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('favourite', {
         id: {
            primaryKey:true,
            allowNull:false,
            autoIncrement: true,
            type:Sequelize.INTEGER,
            comment:'用户id'
         } ,
         cookbook_id:{
          type:Sequelize.INTEGER,
          filed:'cookbook_id',
          allowNull:false,
        },
         userId:{
          type:Sequelize.INTEGER,
          filed:'user_id',
          allowNull:false,
          defaultValue:0
        },
        createdIpAt:{
          type:Sequelize.CHAR(15),
          allowNull:false,
          filed:'created_ip_at',
          defaultValue:'',
        },
        createdAt:{
          allowNull:false,
          type:Sequelize.DATE,
          filed:'created_at',
          comment:'创建时间'
        },
        updatedAt:{
          allowNull:false,
          type:Sequelize.DATE,
          filed:'updated_at',
          comment:'更新时间'
        },
        },{
          tableName:'favourite',
          charset:'utf8mb4',
          collate:'utf8mb4_bin',
          indexes:[
            {
  
            }
          ]
        });
    
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   return queryInterface.dropTable('favourite');
  }
};
