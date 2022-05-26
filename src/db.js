import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost:5556/postgres'
);

export default sequelize;
