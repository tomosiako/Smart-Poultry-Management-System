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




function isProductInCart(cart,id){
    for(let i=0; i<cart.length; i++){
        if(cart[i].id==id){
            return true;
        }
    }
    return false

}

function calculateTotal(cart,req){

    total = 0;
    for(let i=0; i<cart.length;i++){
        total=total +(cart[i].price*cart[i].quantity)
    }
    req.session.total = total
    return total

}

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

app.get('/products',function(req,res){
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
        res.render("pages/products",{results,delivery,total})

    })

})

app.post('/add_to_cart',function(req,res){
    var id = req.body.id
    var name = req.body.name
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


    //calculate total
    calculateTotal(cart,req)

    //return to cart page
    res.redirect('/cart')
    console.log("here is the product added to cart" ,cart)

})

app.get('/cart',function(req,res){

    var cart = req.session.cart
    var total = req.session.total

    res.render('pages/cart',{cart:cart,total:total})

})

app.post('/remove_product',function(req,res){
    var id = req.body.id
    var cart = req.session.cart

    for(let i=0; i<cart.length; i++){
        if(cart[i].id == id){
            cart.splice(cart.indexOf(i),1)
        }
    }

    //re-calculate total
    calculateTotal(cart,req)
    res.redirect('/cart')
})

app.post('/update_quantity',function(req,res){
    var id = req.body.id
    var quantity =req.body.quantity
    var increase_btn = req.body.increase_product_quantity
    var decrease_btn = req.body.decrease_product_quantity

    var cart = req.session.cart;

    if(increase_btn){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 0){
                    cart[i].quantity = parseInt(cart[i].quantity)+1;
                }
            }
        }
    }

     if(decrease_btn){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 1){
                    cart[i].quantity = parseInt(cart[i].quantity)-1;
                }
            }
        }
    }

    calculateTotal(cart,req)
    res.redirect('/cart')
})

app.get('/checkout',function(req,res){
    var total = req.session.total
    res.render('pages/checkout',{total:total})
})

app.post('/place_order', function(req,res){

    var name = req.body.name
    var email = req.body.email
    var phone = req.body.phone
    var city = req.body.city
    var address = req.body.city
    var address = req.body.address
    var cost = req.body.cost
    var status = "not paid"
    var date = new Date();
    var product_ids = "";

    
    var con = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"smart_poultry"
    })

    var cart = req.session.cart;
    for(let i=0; i<cart.length; i++){
        product_ids = product_ids + "," + cart[i].id    } 

    con.connect((err)=>{
        if(err){
            console.log(err)
        }
        else{
            var query = "INSERT INTO orders(cost,name,email,status,city,address,phone,date,product_ids) VALUES ?";
            var values =[ 
                [cost, name, email,status,city,address,phone,date,product_ids]
            ];
            con.query(query,[values],(err,results)=>{
                console.log(values)
                res.redirect('/payment')
            })
        }
    })


})
app.get('/payment',function(req,res){
     var cart = req.session.cart;
    res.render('pages/payment',{cart:cart})

})