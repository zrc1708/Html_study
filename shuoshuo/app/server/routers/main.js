const KoaRouter = require('koa-router')
const md5  = require('md5')
const Models  = require('../models/index')

const router  = new KoaRouter()

router.get('/',async ctx =>{

    // let data =  await Models.Users.findOne({
    //     where:{
    //         id:1
    //     },
    //     include:{
    //         model:Models.Comments
    //     }
    // })

    //获取querystring传过来的数据
    let page = ctx.query.page ||  1
    let prepage = ctx.query.prepage || 2
    let offset = (page-1)*prepage

    let data =  await Models.Contents.findAndCountAll({
            limit:2,
            offset:offset,
            include:{
                model:Models.Users
            }
        })

        // console.log(data.rows)

    ctx.body = {
        code:0,
        count:data.count,
        prepage:prepage,
        data:data.rows.map(d=>{
            return{
                id:d.id,
                title:d.title,
                content:d.content,
                user_id:d.user_id,
                username:d.User.username,
                created_at:d.createdAt,
                like_count:d.like_count,
                comment_count:d.comment_count
            }
        })
    }
})

router.post('/register',async ctx=>{
    // console.log(ctx.request.body)
    let username = ctx.request.body.username.trim() //去除收尾空格
    let password = ctx.request.body.password.trim()
    let repassword = ctx.request.body.repassword.trim()

    if(username == '' ||password==''||repassword==''){
        return ctx.body={
            code:1,
            data:'用户名或密码不能为空'
        }
    }
    if(password!=repassword){
        return ctx.body={
            code:2,
            data:'两次输入的密码不一致'
        }
    }

    let user = await Models.Users.findOne({
        where:{
            username : username
        }
    })

    if(user!==null){
        return ctx.body={
            code:3,
            data:'当前用户已经被注册了'
        }
    }

    let newuser = await Models.Users.build({
        username,
        password:md5(password)
    }).save()

    ctx.body={
        code:0,
        data:{
            id:newuser.id,
            username:newuser.username
        }
    }
})

router.post('/login',async ctx=>{
    let username = ctx.request.body.username
    let password = ctx.request.body.password

    let user = await Models.Users.findOne({
        where:{
            username
        }
    })

    if(user === null){
        return ctx.body={
            code:1,
            data:'不存在该用户'
        }
    }

    if(user.password !==md5(password)){
        return ctx.body={
            code:1,
            data:'密码错误'
        }
    }

    ctx.cookies.set('uid',user.get('id'),{
        httpOnly:false,
        signed:true
    })

    ctx.body={
        code:0,
        data:{
            id:user.id,
            username:user.username
        }
    }
    
})

// router.post('/like',async ctx=>{
//     //让客户端请求的时候带过来一个凭证
//     if( ){

//     }
// })
module.exports = router