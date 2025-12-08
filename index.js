var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var session = require('express-session')

mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"smart_poultry"
})

var app = express()

app.use(express.static('public'))
app.set('view engine','ejs')

app.listen(8080)
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({secret:"secret"}))





//localhost:8080

app.get('/',function(req,res){

   var con = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"smart_poultry"
    })
    con.query("SELECT * FROM products",(err,results)=>{
        res.render("pages/index",{results:results})
        console.log(results)

    })


})

app.get('/cart',function(req,res){
   // const cartItems = 0
    //const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = 400; // fixed delivery fee
    const total = 302 + delivery;
   
    var con = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"smart_poultry"
    })
    con.query("SELECT * FROM products",(err,results)=>{
        res.render("pages/cart",{results,delivery,total})

    })

})

app.post('/add_to_cart',function(req,res){
    var id = req.body.id
    var name = req.body.mane
    var price = req.body.price
    var quantity = req.body.quantity
    var image = req.body.image
    var product = {id:id,name:name,price:price,quantity:quantity,image:image}


    if(req.session.cart){
        var cart = req.session.cart

        if(!isProductInCart(cart,id)){
            cart.push(product)
        }
    }
    else{
        req.session.cart = [product]
        var cart = req.session.cart
    }
})