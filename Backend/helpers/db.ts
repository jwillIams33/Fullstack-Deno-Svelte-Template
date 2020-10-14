import { MongoClient, Collection } from 'https://deno.land/x/mongo/mod.ts';

import CREDENTIALS from './db_config.ts';

let collection: Collection<any> | null = null;

export function connect() {
  const client = new MongoClient();
  
  // update db_config file with your credentials
  client.connectWithUri(
    `mongodb+srv://${CREDENTIALS.userName}:${CREDENTIALS.password}@cluster0.ixpzm.mongodb.net/?retryWrites=true&w=majority`
  );

  const db = client.database('Task-List');
  collection = db.collection('tasks');
}

function getCollection() {
  return collection;
}

export default getCollection;
