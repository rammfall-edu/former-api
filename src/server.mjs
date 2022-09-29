import fastify from './index.mjs';
import db from './db.mjs';

(async () => {
  try {
    await fastify.listen(process.env.PORT || 3001);
    await db.authenticate();
  } catch (err) {
    console.log(err);
  }
})();
