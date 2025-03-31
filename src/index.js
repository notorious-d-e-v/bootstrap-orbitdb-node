/* 
 * This script bootstraps the PayAI OrbitDB databases.
 * The script uses ./libp2p.js to configure the libp2p node.
 * The settings are optimized for persistence and discoverability.
 * Other peers will use this node as a bootstrap node.
 *
*/
import { createHelia } from 'helia';
import { createLibp2p } from 'libp2p';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { createOrbitDB, IPFSAccessController } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { Libp2pOptions } from './libp2p.js';
import { dataDir } from './datadir.js';
import dotenv from 'dotenv';
dotenv.config();


const libp2p = await createLibp2p(Libp2pOptions);
const blockstore = new FsBlockstore(dataDir + '/ipfs');
const ipfs = await createHelia({ libp2p, blockstore });
const orbitdb = await createOrbitDB({ ipfs, directory: dataDir + '/orbitdb' });
console.log("libp2p peerId: ", libp2p.peerId);
console.log("libp2p addresses: ", libp2p.getMultiaddrs());
console.log("");

// define databases
const dbConfigs = [
    { name: "updates", hash: process.env.UPDATES, options: { AccessController: IPFSAccessController({ write: ['*']}), sync: true } },
    { name: "service-ads", hash: process.env.SERVICE_ADS, options: { type: "documents", AccessController: IPFSAccessController({ write: ['*']}), sync: true } },
    { name: "buy-offers", hash: process.env.BUY_OFFERS, options: { type: "documents", AccessController: IPFSAccessController({ write: ['*']}), sync: true } },
    { name: "agreements", hash: process.env.AGREEMENTS, options: { type: "documents", AccessController: IPFSAccessController({ write: ['*']}), sync: true } }
];

const databases = [];

// open databases
for (const dbConfig of dbConfigs) {
    const db = dbConfig.hash
	? await orbitdb.open(dbConfig.hash)
	: await orbitdb.open(dbConfig.name, dbConfig.options);
    databases.push(db);
    console.log(`${dbConfig.name} db: `, db.address);

    db.events.on('update', async (entry) => {
        console.log(`${dbConfig.name} db: `, entry);
    });
}


// log peer connects
libp2p.addEventListener("peer:connect", (evt) => {
    console.log("peer connected");
});
