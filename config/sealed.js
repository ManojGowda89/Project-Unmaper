// Complex name and indirection to obfuscate it
const proto = 'mongodb';
const host = 'localhost';
const port = '27017';
const dbName = 'unmaperdb';

const combo = [proto + '://', host, ':', port, '/', dbName].join('');

module.exports = {
    dburl: combo
};
