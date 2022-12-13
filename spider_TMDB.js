const axios = require('axios');
var MongoClient = require('mongodb').MongoClient;

const API_BASE_PATH = (id) => `https://api.themoviedb.org/3/movie/${id}?api_key=4feebb16ae595729276d594644e3818b`
const API_COMMENT_PATH = (id) => `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=4feebb16ae595729276d594644e3818b`
const IMG_BASE = (img) => `https://image.tmdb.org/t/p/w500/${img}`
const fs = require('fs');



const port = "27017";
const host = "18.144.8.30";
const dbname = "new_data";
const opts = {
    useUnifiedTopology: true
  };
const uri = "mongodb://hjj:ee547@"+host+":"+port+"/"+dbname;
let client = new MongoClient(uri);
client.connect();

const dataDb = client.db(dbname,opts);



async function promiseFSWrite(path, data) {
    return new Promise((res, rej) => {
        fs.writeFile(path, data, (err) => {
            if (err) rej(err);
            else res();
        })
    })
}

async function save_Moive_Image(imageId) {
    axios.get(API_BASE_PATH(imageId))
        .then((res) => {
			dataDb.collection("Movies").insertOne(res.data)
            if (res.data.backdrop_path)
                promiseFSWrite(`./data/${imageId}.json`, JSON.stringify(res.data));
            return res.data.backdrop_path;
        })
        .then((img) => axios.get(IMG_BASE(img), {
            responseType: 'arraybuffer'
        }))
        .then((res) => promiseFSWrite(`./imgs/${imageId}.jpg`, res.data))
        .catch(err => {
            console.log(imageId + " err!");
        })
}


async function save_Comment(imageId) {
    axios.get(API_COMMENT_PATH(imageId))
        .then((res) => {
			tmp = res.data
			id = tmp.id
			results = tmp.results
			results.forEach(item =>{
				insert_doc = {
					movieId: id,
					commentText: item.content
				}
				dataDb.collection("Comments").insertOne(insert_doc)

			})
			
            if (tmp)
                promiseFSWrite(`./comment/${imageId}.json`, JSON.stringify(tmp));
        })
        .catch(err => {
            console.log(imageId + " err!");
        })
}



for (let index = 2; index < 402; index++) {
    save_Moive_Image(index);
	save_Comment(index);
}



