const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const DataLoader = require('dataloader');
var ObjectId = require('mongodb').ObjectID;
var { buildSchema } = require('graphql');
const { assertResolversPresent, makeExecutableSchema } = require('@graphql-tools/schema');
var MongoClient = require('mongodb').MongoClient;
const app = express();
const MONGO_CONFIG_FILE = './config/mongo.json';
const { ObjectID } = require('bson');
const e = require('express');
const session=require('express-session');

(async function(){
  
    let confg = {
        host : "localhost",
        dbname: "data",
        port: "27017"
    }
    const uri = "mongodb://"+confg.host+":"+confg.port;
    let client =  await MongoClient.connect(uri);
    const qidb = client.db(confg.dbname);
    var typeDefs = `
    type Query {
        userById(uid: ID!): User
        
        userByname(name: String, pw: String): User
          
        movieById(mid: ID!): Movie
        movieBykw(kw: String):[Movie]!
        commentById(cid: ID!): Comment
        ratingById(rid: ID!): Rating
        genre(name: String, limit: Int): [Movie]!
        comment(mid:ID, uid: ID, limit: Int): [Comment]!
        rate(mid:ID, uid: ID, limit: Int): [Rating]!
    }

    type Mutation {
        userCreate(inputUser: InputUser): User
        userUpdate(uid: ID!, inputUser: InputUser): User
        CommentCreate(inputComment: InputComment): Comment
        RateCreate(inputRate: InputRate): Rating
        RateUpdate(rid: ID!, rate: Float): Rating

        login(name: String, password: String): Boolean
    }

    input InputUser{
        name: String
        password: String
        age: Int
        address: String
        Email: String
        status:statusEnum
    }

    input InputComment{
        movieId: ID
        userId: ID
        commentText: String
    }

    input InputRate{
        movieId: ID
        userId: ID
        rate: Float
    }
    
    enum statusEnum{
        memeber
        nonmember
    }
    
    type User {
        uid: ID!
        name: String
        password: String
        age: Int
        address: String
        Email: String
        status:statusEnum
    }
    type Movie {
        mid: ID!
        adult: Boolean
        budget: Int
        genres: [Genre]
        language: String
        title: String
        overview: String
        popularity: Float
        release_date: String
        revenue: Float
        runtime: Float
        status: String
    }
    type Genre{
        id: Int
        name: String
    }

    type Rating{
        rid: ID
        movieId: ID
        userId: ID
        rate: Float
    }

    type Comment{
        cid: ID
        movieId: ID
        userId: ID
        commentText: String
    }
    `;
    
      const resolvers = {
       
        Query:{
            userById:(_, { uid }, context) => {
            return context.loaders.user.load(uid);
          },
            userByname: async (_, { name, pw }, context) => {
            const data = await qidb.collection('Users').find({"name": name, "password":pw}).toArray();
            return data[0];
          },  
          movieById:(_, { mid }, context) => {
            return context.loaders.movie.load(mid);
          },
          movieBykw: async (_, { kw }, context) => {
            const data = await qidb.collection('Movies').find({"original_title": { $regex: kw, $options: 'i' }}).toArray();
            // console.log(data);
            return data
          },
          commentById:(_, {  cid }, context) => {
            return context.loaders.comment.load(cid);
          },
          ratingById:(_, {  rid }, context) => {
            return context.loaders.rating.load(rid);
          },
          genre: async (_, {name, limit = 5 }, context) => {
            const data = await qidb.collection('Movies').find({"genres.name": name}).limit(limit).toArray();
            return data;
          },
          comment: async (_, { mid = null, uid = null, limit = 5}, context) => {
            let data = await qidb.collection('Comments').find().limit(limit).toArray();
            if(!uid && !mid){
                data = await qidb.collection('Comments').find().limit(limit).toArray();
            }else if(!uid){
                data = await qidb.collection('Comments').find({"movieId": mid}).limit(limit).toArray();
            }else if(!mid){
                data = await qidb.collection('Comments').find({"userId": uid}).limit(limit).toArray();
            }else{
                data = await qidb.collection('Comments').find({"movieId": mid,"userId": uid}).limit(limit).toArray();
            }
            return data
          },
          rate: async (_, {mid = null, uid = null, limit = 5}, context) => {
            let data = await qidb.collection('Ratings').find().limit(limit).toArray();
            if(!uid && !mid){
                data = await qidb.collection('Ratings').find().limit(limit).toArray();
            }else if(!uid){
                data = await qidb.collection('Ratings').find({"movieId": mid}).limit(limit).toArray();
            }else if(!mid){
                data = await qidb.collection('Ratings').find({"userId": uid}).limit(limit).toArray();
            }else{
                data = await qidb.collection('Ratings').find({"movieId": mid,"userId": uid}).limit(limit).toArray();
            }
            return data
          },
        },
        Mutation: {
            userCreate: async (_, {inputUser }, context) => {
                inputUser._id = ObjectId();
                const data = await qidb.collection('Users').insertOne(inputUser);
                return context.loaders.user.load(inputUser._id);
            },
            userUpdate: async (_, {uid, inputUser}, context) => {
                data = await qidb.collection('Users').updateOne({_id:ObjectId(uid)}, {$set: inputUser });
                return context.loaders.user.load(uid);
            },
            CommentCreate: async (_, {inputComment }, context) => {
                inputComment._id = ObjectId();
                const data = await qidb.collection('Comments').insertOne(inputComment);
                return context.loaders.comment.load(inputComment._id);
            },
            RateCreate: async (_, {inputRate }, context) => {
                inputRate._id = ObjectId();
                const data = await qidb.collection('Ratings').insertOne(inputRate);
                return context.loaders.rating.load(inputRate._id);
            },
            RateUpdate: async (_, {rid, rate }, context) => {
    
                const data = await qidb.collection('Ratings').updateOne({_id:ObjectId(rid)}, {$set: {"rate": rate} });
                return context.loaders.rating.load(rid);
            },
            login: async(_, {name, pw}, context) =>{
                const data = await qidb.collection('Users').find({"name": name, "password":pw}).toArray();
                if(data == []){
                    return false;
                }else{
                    context.session.userId = name;
                    context.session.loginStatus = "true";
                    console.log(context.session);
                    return true;
                }
                
            }
        },
    
        User:{
            uid:({_id}, _, context) =>{
                return _id;
                },
            name:({name}, _, context) =>{
            return name;
            },
            password:({password}, _, context) =>{
                return password;
            },
            age:({age}, _, context) =>{
                return age;
            }, 
            address:({address}, _, context) =>{
                return address;
            },
            Email:({Email}, _, context) =>{
                return Email;
            }, 
            status:({status}, _, context) =>{
                return status;
            }, 
        },
        Movie:{
            mid:({_id}, _, context) =>{
                return _id;
              },
            adult:({adult}, _, context) =>{
            return adult;
            },
            budget:({budget}, _, context) =>{
            return budget;
            },
            genres:({genres}, _, context) =>{
            return genres;
            },
            language:({original_language}, _, context) =>{
            return original_language;
            },
            title:({title}, _, context) =>{
            return title;
            },
            overview:({overview}, _, context) =>{
            return overview;
            },
            popularity:({popularity}, _, context) =>{
            return popularity;
            },
            release_date:({release_date}, _, context) =>{
            return release_date;
            },
            revenue:({revenue}, _, context) =>{
            return revenue;
            },
            runtime:({runtime}, _, context) =>{
                return runtime;
                },
            status:({status}, _, context) =>{
                return status;
                },
        },
        Genre:{
            id:({id}, _, context) =>{
                    return id;
                },
            name:({name}, _, context) =>{
                return name;
                },
        },
        Rating:{
            rid:({_id}, _, context) =>{
                    return _id;
                    },
            movieId:({movieId}, _, context) =>{
                return movieId;
                },
            userId:({userId}, _, context) =>{
                return userId;
                },
            rate:({rate}, _, context) =>{
                return rate;
                },
        },
        Comment:{
            cid:({_id}, _, context) =>{
                return _id;
                },
            movieId:({movieId}, _, context) =>{
                return movieId;
                },
            userId:({userId}, _, context) =>{
                return userId;
                },
            commentText:({commentText}, _, context) =>{
                return commentText;
                },
        },
      }
    
    const schema = makeExecutableSchema({
      resolvers,
      resolverValidationOptions: {
        requireResolversForAllFields:  'warn',
        requireResolversToMatchSchema: 'warn'
      },
      typeDefs
    });

    app.use(session(
        { name:'SessionCookie',
        secret:'secret-key',
          resave: false,
          saveUninitialized: false,
        }));

    app.get('/ping',  function(req, res){
      let respBody = '';
      res.writeHead(204)
      res.write(respBody);
      res.end();}
      )
    
    app.use('/graphql', graphqlHTTP(async (req) => {
      return {
        schema:schema,
        graphiql: true,
        context: {
          db: qidb,
          loaders: {
              user: new DataLoader(keys => getUsers(qidb, keys)),
              movie: new DataLoader(keys => getMovies(qidb, keys)),
              comment: new DataLoader(keys => getComments(qidb, keys)),
              rating: new DataLoader(keys => getRatings(qidb, keys)),
          },
          session
        },
        // formatError: (err) => {
        //   const error = getErrorCode(err.message)
        //   return ({ message: error.message, statusCode: error.statusCode })
        // }
      };
    }));
    
    app.listen(3000);
    console.log('GraphQL API server running at http://localhost:3000/graphql');
    
  })()
  
  async function getUsers(qidb, keys) {
      const data = await qidb.collection('Users').find({"_id": {$in:keys.map(key => ObjectID(key))}}).toArray();
      const results = data.reduce((acc, row) => {
        acc[row._id] = row;
        return acc;
      }, {});
      return keys.map(key => results[key] || new Error(`no result for ${key}`));
      
  }
  
  async function getMovies(qidb, keys) {
    const data = await qidb.collection('Movies').find({"_id": {$in:keys.map(key => ObjectID(key))}}).toArray();
    const results = data.reduce((acc, row) => {
      acc[row._id] = row;
      return acc;
    }, {});
    return keys.map(key => results[key] || new Error(`no result for ${key}`));
    
}

async function getComments(qidb, keys) {
    const data = await qidb.collection('Comments').find({"_id": {$in:keys.map(key => ObjectID(key))}}).toArray();
    const results = data.reduce((acc, row) => {
      acc[row._id] = row;
      return acc;
    }, {});
    return keys.map(key => results[key] || new Error(`no result for ${key}`));
    
}

async function getRatings(qidb, keys) {
    const data = await qidb.collection('Ratings').find({"_id": {$in:keys.map(key => ObjectID(key))}}).toArray();
    const results = data.reduce((acc, row) => {
      acc[row._id] = row;
      return acc;
    }, {});
    return keys.map(key => results[key] || new Error(`no result for ${key}`));
    
}