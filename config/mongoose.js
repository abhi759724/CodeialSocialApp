const mongoose = require('mongoose');
const env = require('../config/environment');

mongoose.connect(`mongodb://0.0.0.0/${env.db}`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Error connecting to mongodb"));

db.once('open', function(){
    console.log('connected to database:: MongoDB');
});

module.exports = db;                                                           