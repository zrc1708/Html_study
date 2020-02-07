/**
 * 函数
 *       函数声明
 *       函数表达式
 * 
 * 类型约束
 *      函数参数
 *      函数返回值
 * 
 * 如果函数没有返回值，使用void
 */

 function fn1(x:number,y:number): number {
    return x+y
 }

 fn1(1,2)
//  fn1('a','b')

//函数表达式
// let fn2 = function(x:number,y:number):number{
//     return x+y
// }

//根据类型推断可以简写
// let fn2:(x:number,y:number)=>number = function(x:number,y:number):number{
//     return x+y
// }
let fn2:(x:number,y:number)=>number = function(x,y){
    return x+y
}




//可选参数
function fn3(x:number,y?:number):void{
    console.log(y)
}
fn3(1)



//参数默认值
function fn4(x:number,y:number=1):void{
    console.log(y)
}
fn3(1)



//剩余参数
function fn5(...args:any[]){
    console.log(args)
}