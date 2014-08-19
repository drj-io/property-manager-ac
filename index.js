var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var session = require('express-session');

//app.use(express.cookieParser);


app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'keyboard cat'
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


users = [
    {
        username: 'david',
        password: 'password'
    },
    {
        username: 'joe',
        password: 'qwerty'
    },
    {
        username: 'ben',
        password: 'asdf'
    }
];

containerClass = '';

var properties = [
        {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '800-531-3278',
            rating: 5

        },
        {
            address: '4616 S Shields St, Fort Collins, CO 80526',
            phone: '970-226-2500',
            rating: 5
        },
        {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '800-341-3278',
            rating: 5

        },
        {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '501-541-3278',
            rating: 5

        },
                {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '720-541-3278',
            rating: 5

        },
                {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '303-541-3278',
            rating: 5

        },
                {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '801-541-3278',
            rating: 5

        },
        {
            address: '504 E Eisenhower Blvd, Loveland, CO 80513',
            phone: '800-541-3273',
            rating: 5

        }




];





app.set('view engine', 'ejs');

app.use('/', express.static(__dirname + '/public'));

/*

######                                                           
#     # #####   ####  #####  ###### #####  ##### # ######  ####  
#     # #    # #    # #    # #      #    #   #   # #      #      
######  #    # #    # #    # #####  #    #   #   # #####   ####  
#       #####  #    # #####  #      #####    #   # #           # 
#       #   #  #    # #      #      #   #    #   # #      #    # 
#       #    #  ####  #      ###### #    #   #   # ######  ####  

*/

app.get('/properties/list',function(req,res){
   // user = checkUser(req, res);
    res.render('properties-list',{properties:properties})

})
app.get('/properties/create', function(req,res){
    user = checkUser(req, res);
    res.render("properties-form", {
        propertyId: -1,
        containerClass: 'edit'
    })

})


app.get('/properties/autocomplete/:value',
 function(req,res){
    var foundResults = [];

    properties.forEach(function(property, index){

        if(property.phone.indexOf(req.params.value) == 0){
            foundResults.push(property.phone)
        }
    })


    res.send(foundResults);

})
app.post('/properties/create', function(req,res){
    user = checkUser(req,res);
    properties.push({
         address: req.body.address,
            phone: req.body.phone,
            rating: req.body.rating,
    });

    res.redirect('/properties/list');
})

app.get('/properties/edit/:id', function(req,res){
    user = checkUser(req,res);

    res.render("properties-form",{
        propertyId: req.params.id, 
        property: properties[req.params.id],
        containerClass: 'edit'
    })
});

app.get('/properties/view/:id', function(req,res) {
    user = checkUser(req,res);

    res.render("properties-view", {
        propertyId: req.params.id,
        property: properties[req.params.id]
    })
});

app.post('/properties/edit/:id', function(req,res){
    user = checkUser(req,res);
    properties[req.params.id] = {
            address: req.body.address,
            phone: req.body.phone,
            rating: req.body.rating,
    }

    res.redirect('/properties/list')

})


app.get('/properties/delete/:id', function(req,res){
    user = checkUser(req,res);
    properties.splice(req.params.id,1);
    res.redirect('/properties/list');
})

/*

     #  #####  ####### ######  
#     # #     # #       #     # 
#     # #       #       #     # 
#     #  #####  #####   ######  
#     #       # #       #   #   
#     # #     # #       #    #  
 #####   #####  ####### #     # 



*/


app.get('/', function(req, res){

    user = checkUser(req, res);

    var data = {

        user: user,
        message :'hello there '
    }
    res.render('home',{ data:data });
})

app.get('/login', function(req, res){

    res.render('login', {})

});


app.post('/user/login', function(req, res){

    console.log( req.body.username, req.body.password);


     var validUser = false;

    users.forEach(function(user ,index){
        console.log(user.username);

        if((user.username == req.body.username) && (user.password == req.body.password)){
            console.log('found a valid user');
            validUser = user.username;
        }
    });
    
    if(validUser){
        
        req.session.user = validUser;
        
        res.redirect('/');
    }
    else{
        res.redirect('/login?error=401')
    }

})


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

// 

// Check to see if the user session is active on the user's browser
function checkUser(req,res){

     if (req.session.user) {
        return req.session.user;
    }
    else{
        res.redirect('/login');
        res.end();
    }
}
