ssh ubuntu@54.193.157.217
Pwd: myaws1!

sudo service mongod restart


Account_info

```
db.createUser( 
{
user: "lrz",
pwd:  "ee547",
roles:[{role: "readWrite" , db:"data"}]})

*db.createUser(
{
user: "hjj",
pwd:  "ee547",
roles:[{role: "readWrite" , db:"data"}]})

db.createUser(
{
user: "lzy",
pwd:  "ee547",
roles:[{role: "userAdmin" , db:"data"}]})

db.createUser(
{
user: "lzy_admin",
pwd:  "ee547",
roles:[{role: "userAdminAnyDatabase" , db:"admin"}]})
```


login command:
`mongo -u <username> -p <pwd> data`
mongo -u hjj -p ee547 data

**DataBase_name** : data\
**Collection**: Movie

e.g. command \
db.movie.find()