import fastify from './index';
import db from './db';

(async () => {
  try {
    await fastify.listen(3000);
    await db.authenticate();
  } catch (err) {
    console.log(err);
  }
})();
