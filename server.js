const { ObjectID } = require('bson');
const { query } = require('express');
var express = require('express');
const { piDependencies } = require('mathjs');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var contentType = 'application/json';
const userKeys = [ "_id","name","password","age","address","Email","status"]

function checkUserParams(query){
    let res = {
        "_id": new ObjectID(),
        "name": '',
        "password":  '',
        "age": '',
        "address": '',
        "Email": '',
        "status": '',
    }
    for (var key in query) { 
        if(userKeys.includes(key)){
            // key in query is valid:
            res[key] = query[key];
        }else{
            return {};
        }
    }
    return res;
}

(async function(){
const port = "27017";
// const host = "54.193.157.217";
const host = "localhost";
const dbname = "data";
const opts = {
    useUnifiedTopology: true
  };
const uri = "mongodb://"+host+":"+port;
let client =  await MongoClient.connect(uri);
const dataDb = client.db(dbname,opts);


app.get('/ping', function(req, res){
    return res.send('');
    // return res.status(404).send('Not found');
});

app.get('/userById/:id', async function(req, res){
    let id = req.params.id;
    const data = await dataDb.collection('Users').find({"_id": ObjectId(id)}).toArray();
    // const data = await dataDb.collection('Users').find({});
    if (data == []){
        return res.status(400).send('user not found with id:' + id);
    }else{
        console.log('1111', JSON.stringify(data))
        return res.send(JSON.stringify(data[0]));
    }     
});
app.get('/movieById/:id', async function(req, res){
    let id = req.params.id;
    const data = await dataDb.collection('Movie').find({"id": Number.parseInt(id)}).toArray();
    console.log(data)
    if (data == []){
        return res.status(400).send('movie not found with id:' + id);
    }else{
        return res.send(JSON.stringify(data[0]));
    }     
});

app.get('/commentById/:id', async function(req, res){
    let id = req.params.id;
    const data = await dataDb.collection('Comments').find({"_id": ObjectId(id)});
    if (data == []){
        return res.status(400).send('comment not found with id:' + id);
    }else{
        return res.send(JSON.stringify(data[0]));
    }     
});

app.get('/ratingById/:id', async function(req, res){
    let id = req.params.id;
    const data = await dataDb.collection('Ratings').find({"_id": ObjectId(id)});
    if (data == []){
        return res.status(400).send('rating not found with id:' + id);
    }else{
        return res.send(JSON.stringify(data[0]));
    }     
});

app.get('/user/:name/:pw', async function(req, res){
    let name = req.params.name;
    let pw = req.params.pw;
    console.log(name,pw)
    const data = await dataDb.collection('Users').find({"name": name, "password": pw}).toArray();
    if (data == []){
        return res.status(400).send('Wrong name or password');
    }else{
        return res.send(JSON.stringify(data[0]));
    }     
});

app.get('/movie/:kw', async function(req, res){
    let name = req.params.kw;
    
    const data = await dataDb.collection('Movie').find({"original_title": { $regex: name, $options: 'i' }});
    if (data == []){
        return res.status(400).send('no movie found with name: ' + name);
    }else{
        return res.send(JSON.stringify(data));
    }
});

app.get('/genre/:name/:limit?', async function(req, res){
    let genre = req.params.name.toLowerCase();
    genre[0] = genre[0].toUpperCase();
    let limit = req.params.limit || 5;
    const data = await dataDb.collection('Users').find({"genres.name": genre}).limit(limit);
    if (data == []){
        return res.status(400).send('no movie found with genre: ' + genre);
    }else{
        return res.send(JSON.stringify(data));
    }
});

app.get('/comment/:mid?/:uid?/:limit?', async function(req, res){
    let mid = req.params.mid;
    let uid = req.params.uid;
    let limit = req.params.limit || 5;
    if(!uid && !mid){
        const data = await dataDb.collection('Comments').find().limit(limit);
    }else if(!uid){
        const data = await dataDb.collection('Comments').find({"movieId": mid}).limit(limit);
    }else if(!mid){
        const data = await dataDb.collection('Comments').find({"userId": uid}).limit(limit);
    }else{
        const data = await dataDb.collection('Comments').find({"movieId": mid,"userId": uid}).limit(limit);
    }

    if (data == []){
        return res.status(400).send('no comment found with mid: ' + mid.toString() + ' pid: ' + pid.toString());
    }else{
        return res.send(JSON.stringify(data));
    }
});

app.get('/rate/:mid?/:uid?/:limit?', async function(req, res){
    let mid = req.params.mid;
    let uid = req.params.uid;
    let limit = req.params.limit || 5;
    if(!uid && !mid){
        const data = await dataDb.collection('Ratings').find().limit(limit);
    }else if(!uid){
        const data = await dataDb.collection('Ratings').find({"movieId": mid}).limit(limit);
    }else if(!mid){
        const data = await dataDb.collection('Ratings').find({"userId": uid}).limit(limit);
    }else{
        const data = await dataDb.collection('Ratings').find({"movieId": mid,"userId": uid}).limit(limit);
    }

    if (data == []){
        return res.status(400).send('no rating found with mid: ' + mid.toString() + ' pid: ' + pid.toString());
    }else{
        return res.send(JSON.stringify(data));
    }
});

app.post('/user', async function(req, res){
    var paramUser = checkUserParams(req.query);
    console.log(paramUser);
    if(paramUser == {}){
        return res.status(400).send('invalid parameter');

    }else{
        const data = await dataDb.collection('Users').insertOne(paramUser);
        console.log('here');
        // return res.redirect('/userById/' + paramUser._id.toString());
        res.writeHead(200, { 'Content-Type': contentType,
                        'Location': '/userById/'+paramUser._id.toString()
                    });
        res.end();
    }
});

app.post('/user/:id', async function(req, res){
    var paramUser = checkUserParams(req.query);
    paramUser._id = ObjectId(req.params.id);
    if(paramUser == {}){
        return res.status(400).send('invalid parameter');

    }else if(!paramUser['name']){
        return res.status(400).send('no name');
    }else if(!paramUser['password']){
        return res.status(400).send('no password');
    } else{
        const data = await dataDb.collection('Users').updateOne({_id:ObjectId(req.params.id)}, {$set: paramUser});
        return res.redirect('/userById/' + paramUser._id.toString());
    }
});



var server = app.listen(3000, function(){
    console.log('create rest api');
 });
})()