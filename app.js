var express = require("express"), 
http = require("http"),
app = express(),
server = http.createServer(app),
path = require("path"),
mongo = require('mongodb').MongoClient,
dbconnection = mongo.connect('mongodb://localhost:27017/chatemera', MongoAccess),
database = null;

var collection;

function MongoAccess(err, db) {
    if (err) throw err;
    console.log("Conexion exitosirijilla");
    
    database = db;

    collection = db.createCollection('usercollection', function(err, collection) {
            if (err) throw err;

       /*collection.insert({nickname: "Zhionit", email: "Zhionit@hotmail.com", nombre: "Marlon Ramirez"}, function(err, insertioned) { 
            if (err)  throw err;
            console.log("Insercion exitosirijilla");
        });

        collection.insert({nickname: "Emera", email: "Emera@hotmail.com", nombre: "Juan David"}, function(err, insertioned) {
            if (err) throw err;
            console.log("Insercion exitosirijilla");
        });

        collection.insert({nickname: "Zheref", email: "Zheref@hotmail.com", nombre: "Sergio Lozano"}, function(err, insertioned)  {
            if (err) throw err;
            console.log("Insercion exitosirijilla");
        });

        collection.insert({nickname: "Blacksam", email: "Blacksam@hotmail.com", nombre: "Samir Tapiero"}, function(err, insertioned)  {
            if (err) throw err;
            console.log("Insercion exitosirijilla");
        });*/
    });
}
 
app.use(express.static(path.join(__dirname, 'public')));
 
app.set("views",__dirname + "/views");


 
app.get("/", function(req,res){
    res.render("index.jade", {title : "CHAT EMERA"});
});
 
server.listen(3000);
 

var usuariosOnline = {};
 
var io = require("socket.io").listen(server);
 

io.sockets.on('connection', function(socket) 
{
  
    socket.on("loginUser", function(username)
    {
        var usercollection = database.collection("usercollection");

        console.log(usercollection.find({}));
        //ERROR**** -> Nickname2 puede ser u objeto json o puede ser un arreglo de objetos json
        /*var nickname2 = usercollection.find({nickname:username}).toArray(function(err, usuarios)
        {
            console.dir(usuarios);        
        });*/
        var cantidad;
        var nickname2 = database.collection('usercollection').find({nickname:username}).toArray(function(err, docs) 
                            {
                                console.dir(docs);
                                cantidad = docs.length; 

                                if(usuariosOnline[username])
                                {
                                    socket.emit("userInUse");
                                    return;
                                }
                            
                                else if (cantidad > 0)
                                {   
                                    socket.username = username;
                                    usuariosOnline[username] = socket.username;
                                    socket.emit("refreshChat", "yo", "Bienvenido " + socket.username + ", te has conectado.");
                                    socket.broadcast.emit("refreshChat", "conectado", "El usuario " + socket.username + " se ha conectado al chat.");
                                    io.sockets.emit("updateSidebarUsers", usuariosOnline);
                                }
                            
                                else
                                {
                                    socket.emit("userNotFound");
                                    return;
                                }
                            });


        
        
    });
 
    
    socket.on('addNewMessage', function(message) 
    {
        
        socket.emit("refreshChat", "msg", "Yo : " + message + ".");
        
        socket.broadcast.emit("refreshChat", "msg", socket.username + " dice: " + message + ".");
    });
 
    
    socket.on("disconnect", function()
    {
        
        if(typeof(socket.username) == "undefined")
        {
            return;
        }
        
        delete usuariosOnline[socket.username];
        
        io.sockets.emit("updateSidebarUsers", usuariosOnline);
        
        socket.broadcast.emit("refreshChat", "desconectado", "El usuario " + socket.username + " se ha desconectado del chat.");
    });
});