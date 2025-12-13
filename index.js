var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var session = require('express-session')
const axios = require("axios");
const moment = require("moment");

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

app.get('/login',function(req,res){
   
    res.render('pages/login')
})

app.get('/collection',function(req,res){
   
    res.render('pages/collection')
})

app.get('/employeelogin',function(req,res){
   
    res.render('pages/employeelogin')
})

app.get('/employeeDashboard',function(req,res){
     var con = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"smart_poultry"
    })
    con.query("SELECT * FROM employee_details",(err,results)=>{
        
        res.render('pages/employeeDashboard',{results})

   })
   res.render('pages/employeeDashboard')
   
   
})

app.get('/usedproducts',function(req,res){
    res.render('pages/usedproducts')

})

app.get('/register',function(req,res){
   
    res.render('pages/register')
})

app.get('/managerlog',function(req,res){
   
    res.render('pages/managerlog')
   })
// app.get('/managerDshboard',function(req,res){

//     const con = mysql.createConnection({
//         host: "localhost",
//         user: "root",
//         password: "",
//         database: "smart_poultry"
//     });

//                 const q1 = "SELECT * FROM employee_details";
//                 // const q2 = "SELECT * FROM employee_details";
//                 // const q3 = "SELECT * FROM employee_details";

//                 con.query(q1, (err1, results) => {
//                     if (err1){
//                         return res.status(500).send("DB error");
//                     } 
//                     console.log('hureeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
//                     console.log(results)
//                      return res.render('pages/managerDshboard',{results:results})
                    

//                      });

//                 // con.query(q2, (err2, r2) => {
//                 //     if (err2) {return res.status(500).send("DB error");
//                 //     }
//                 //      res.render('pages/employeeDashboard',{results})
//                 //      });

//                 // con.query(q3, (err3, r3) => {
//                 //     if (err3) {
//                 //         return res.status(500).send("DB error");
//                 //     }
//                 //      res.render('pages/employeeDashboard',{results})
//                 //      });
                          

//                             // ONLY ONE RESPONSE!
               
   
//     //res.render('pages/managerDshboard')
// })


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
                res.redirect('/payment')
            })
        }
    })


})
app.get('/payment',function(req,res){
     var cart = req.session.cart;
     var total = req.session.total

    //var number = req.body.number
    


     getAccessToken()
        .then((accessToken) => {
          const url =
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
          const auth = "Bearer " + accessToken;
          const timestamp = moment().format("YYYYMMDDHHmmss");
          const password = new Buffer.from(
            "174379" +
              "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
              timestamp
          ).toString("base64");
    
          axios
            .post(
              url,
              {
                BusinessShortCode: "174379",
                Password:password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: total,
                PartyA: "0113472564", //phone number to receive the stk push
                PartyB:"600000",// "174379",
                PhoneNumber: "254113472564",
                CallBackURL: "https://dd3d-105-160-22-207.ngrok-free.app/callback",
                AccountReference: "SCAR PAY",
                TransactionDesc: "Mpesa Daraja API stk push test",
              },
              {
                headers: {
                  Authorization: auth,
                },
              }
            )
            .then((response) => {
              res.send("😀 Request is successful done ✔✔. Please enter mpesa pin to complete the transaction");
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send("❌ Request failed");
            });
        })
        .catch(console.log);




    res.render('pages/payment',{total:total})

})














//payment

// ACCESS TOKEN FUNCTION - Updated to use 'axios'
async function getAccessToken() {
   const consumer_key = "F1p9PsmwaX97HAZdDbJLABDpazEodNK4BcVVdagWsq43E9Ud"; // REPLACE IT WITH YOUR CONSUMER KEY
   const consumer_secret = "gn7YNJKYuatTbiBcXL5Ng91HSkFK82JR9fxaTXfPK4szZKLf0jB3oza5rDomuzed"; // REPLACE IT WITH YOUR CONSUMER SECRET
   const url =
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  //const consumer_key = "F1p9PsmwaX97HAZdDbJLABDpazEodNK4BcVVdagWsq43E9Ud"; // REPLACE IT WITH YOUR CONSUMER KEY
  //const consumer_secret = "gn7YNJKYuatTbiBcXL5Ng91HSkFK82JR9fxaTXfPK4szZKLf0jB3oza5rDomuzed"; // REPLACE IT WITH YOUR CONSUMER SECRET
//   const url =
//     "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth =
    "Basic " +
    new Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });
   
    const dataresponse = response.data;
    // console.log(data);
    const accessToken = dataresponse.access_token;
    return accessToken;
  } catch (error) {
    throw error;
  }
}






// login



app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const total =   req.session.total ;
    

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "Ecommerce1"
    });

    con.connect((err) => {
        if (err) {
            console.error("Database Connection Failed: ", err);
            return res.status(500).send("Database connection error.");
        }

        con.query("SELECT * FROM users where email=? and password=?",[email,password],(err, result) =>{ 
            if (err) {
                console.error("Query Error: ", err);
                return res.status(500).send("Error retrieving products.");
                console.log(err)
            }
            req.session.email = email;
            res.render('pages/checkout', { 
                total: req.session.total | 0, 
                email: req.session.email
            });

        //     res.render('pages/checkout', { total: total ,name:name});
        // });

        con.end(); // Close the database connection
    });
});
});






app.post('/employeelog', (req, res) => {
    const employeenumber = req.body.employeenumber;
    const password = req.body.password;

  
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "smart_poultry"
    });

    con.connect((err) => {
        if (err) {
            console.error("Database Connection Failed: ", err);
            return res.status(500).send("Database connection error.");
        }

        con.query("SELECT * FROM employee_details where number=? and password=?",[employeenumber,password],(err, result) =>{ 
            // if (err) {
            //     console.error("Query Error: ", err);
            //     return res.status(500).send("Error retrieving products.");
            //     console.log(err)
            // }
            //     else //     else
                if (result.length === 0) {
                    // Wrong login
                    return res.send("Invalid login credentials");
                }
                 res.render('pages/employeeDashboard');

      

        con.end(); // Close the database connection
    });
});
});






app.post('/managerlog', (req, res) => {
    const managerid = req.body.managerid;
    const password = req.body.password;

  
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "smart_poultry"
    });

    con.connect((err) => {
        if (err) {
            console.error("Database Connection Failed: ", err);
            return res.status(500).send("Database connection error.");
        }

        con.query("SELECT * FROM manager where id=? and password=?",[managerid,password],(err, result) =>{ 
            // if (err) {
            //     console.error("Query Error: ", err);
            //     return res.status(500).send("Error retrieving products.");
            //     console.log(err)
            // }
            //     else //     else
                if (result.length === 0) {
                    // Wrong login
                    return res.send("Invalid login credentials");
                }


                // If login successful, query multiple tables
            const qEmployees = "SELECT * FROM employee_details";
            // const qInventory = "SELECT * FROM inventory";   // example table
            // const qTasks = "SELECT * FROM tasks";           // example table

            con.query(qEmployees, (err1, results) => {
                if (err1) return res.status(500).send("DB error on employees");

                // con.query(qInventory, (err2, inventory) => {
                //     if (err2) return res.status(500).send("DB error on inventory");

                //     con.query(qTasks, (err3, tasks) => {
                //         if (err3) return res.status(500).send("DB error on tasks");

                        // Render the dashboard and pass all results
                        res.render('pages/managerDshboard', {
                            results: results,
                            // inventory: inventory,
                            // tasks: tasks
                        });

                        con.end(); // Close the database connection
                 

      

        
    });
});
});
})

app.post('/registeremployee',function(req,res){

    const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"smart_poultry"
})

   
    const { name,workid, email, password,phone,id_number,role } = req.body;

    if (!name || !email || !password || !workid || !phone || !id_number || !role) {
        console.log(name,workid,password,email,phone,id_number,role)
        return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if email already exists
    const checkid = "SELECT number FROM employee_details WHERE number = ?";
    db.query(checkid, [workid], (err, result) => {
        if (err) return res.status(500).json({ msg: "Server error" });

        if (result.length > 0) {
            return res.status(400).json({ msg: "Work ID already registered" });
            //return res.render('pages/managerDshboard')

        }

        // Hash password
        //const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert new user
        const insertUser = "INSERT INTO employee_details (name, email, number , id_number,role,phone,password) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(insertUser, [name, email,workid,id_number,role,phone, password], (err2) => {
            if (err2) {
                
            console.log(err2)
            return res.status(500).json({ msg: "Failed to register user" });
            }

            const qEmployees = "SELECT * FROM employee_details";
           
            db.query(qEmployees, (err1, results) => {
                if (err1) return res.status(500).send("DB error on employees");

                        res.render('pages/managerDshboard', {
                            results: results,
                           
                        });


    });
       
          

          
        });
    })
    });

    app.post("/removeEmployee", (req, res) => {
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "smart_poultry"
    });

    const empId = req.body.id;

    if (!empId) return res.status(400).send("Missing employee ID.");

    const sql = "DELETE FROM employee_details WHERE number = ?";
    db.query(sql, [empId], (err, result) => {
        if (err){
            console.log(err)
            return res.status(500).send("Failed to delete");
        } 
          const qEmployees = "SELECT * FROM employee_details";
           
            db.query(qEmployees, (err1, results) => {
                if (err1) return res.status(500).send("DB error on employees");

                        res.render('pages/managerDshboard', {
                            results: results,
                           
                        });



              
          

        //res.render("pages/managerDshboard");  // Reload list
        console.log('donjo')
    });
    
      db.end(); // Close the database connection
});
    })

