import { Application } from 'https://deno.land/x/oak@v6.3.1/mod.ts';
import { connect } from './helpers/db.ts';
import router from "./routes.ts";
// test again
const port = 4000;

connect();

const app = new Application();

app.use(async (ctx, next) => {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
    ctx.response.headers.set('Access-Control-Allow-Methods', 
    'GET, POST, PUT, DELETE,'
    );
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Server Running on Port ${port}`);

await app.listen({ port });