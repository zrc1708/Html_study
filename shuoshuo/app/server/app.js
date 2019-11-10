(async function(){
    const Koa  = require('koa')
    const KoaStaticCache = require('koa-static-cache')
    const KoaBodyParser = require('koa-bodyparser')
    const router = require('./routers/main')

    const app = new Koa()


    app.use(KoaStaticCache('./public',{
        prefixL:'public',
        gzip:true
    }))


    app.use(KoaBodyParser())

    app.use(router.routes())
    app.listen(8888)
})()