import fastify from './index.mjs';
import db from './db.mjs';

(async () => {
  try {
    await fastify.listen(3001);
    await db.authenticate();
  } catch (err) {
    console.log(err);
  }
})();
