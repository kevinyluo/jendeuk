const { MongoClient } = require("mongodb");
const uri =
  "mongodb://localhost:27017";
const client = new MongoClient(uri, { useUnifiedTopology: true });
const dbName = "JenniesFeet";

client.connect();

module.exports = {
  viewDB: async function (collection, cb) {
    try {
      const db = client.db(dbName);
      const col = db.collection(collection);
      col.find({}).toArray(function (err, docs) {
        cb(docs);
      });
    } catch (err) {
      console.log(err.stack);
    }
  },
  clearCollection: async function (collection, cb) {
    try {
      const db = client.db(dbName);
      const col = db.collection(collection);
      col.remove({});
    } catch (err) {
      console.log(err.stack);
    }
  },
  addDocument: async function (doc, collection) {
    try {
      const db = client.db(dbName);
      console.log("added doc");
      const col = db.collection(collection);

      // Insert a single document, wait for promise so we can read it back
      const p = await col.insertOne(doc);
    } catch (err) {
      console.log(err.stack);
    }
  },
  findDocument: async function (match, collection) {
    try {
      const db = client.db(dbName);
      const col = db.collection(collection);
      return col.findOne(match);
    } catch (err) {
      console.log(err.stack);
    }
  },
  updateDocument: async function (email, key, value, collection) {
    try {
      const db = client.db(dbName);
      // Use the collection "people"
      const col = db.collection(collection);
      let newDict = {};
      newDict[key] = value;
      return col.updateOne({ email: email }, { $set: newDict });
    } catch (err) {
      console.log(err.stack);
    }
  },
  pushUpdate: async function (accessCode, list, value, collection) {
    try {
      const db = client.db(dbName);
      const col = db.collection(collection);
      let assignment = {};
      assignment[list] = value;
      return col.updateOne({ accessCode: accessCode }, { $push: assignment });
    } catch (err) {
      console.log(err.stack);
    }
  },
  deleteDocument: async function (name, collection) {
    try {
      const db = client.db(dbName);
      const col = db.collection(collection);
      return col.deleteOne({ accessCode: name });
    } catch (err) {
      console.log(err.stack);
    }
  },
};
