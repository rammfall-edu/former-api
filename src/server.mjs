import fastify from './index.mjs';
import db from './db.mjs';

(async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3001,
      host: '0.0.0.0'
    });
    await db.authenticate();
  } catch (err) {
    console.log(err);
  }
})();
