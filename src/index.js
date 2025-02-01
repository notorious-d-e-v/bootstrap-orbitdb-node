/* 
 * This script bootstraps the PayAI OrbitDB databases.
 * The script uses ./config/libp2p.js to configure the libp2p node.
 * The settings are optimized for persistence and discoverability.
 * Other peers will use this node as a bootstrap node.
 *
*/
import { createHelia } from 'helia';
import { createLibp2p } from 'libp2p';
import { createOrbitDB, IPFSAccessController } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { Libp2pOptions } from './libp2p.js';
import { dataDir } from './datadir.js';


const libp2p = await createLibp2p(Libp2pOptions);
const blockstore = new FsBlockstore(dataDir + '/ipfs');
const ipfs = await createHelia({ libp2p, blockstore });
const orbitdb = await createOrbitDB({ ipfs, directory: dataDir + '/orbitdb' });
console.log("libp2p peerId: ", libp2p.peerId);
console.log("libp2p addresses: ", libp2p.getMultiaddrs());
console.log("");

// create the databases
const updates = await orbitdb.open("updates", { AccessController: IPFSAccessController({ write: ['*']}), sync: true });
console.log('updates db: ', updates.address);

const serviceAds = await orbitdb.open("service-ads", { type: "documents", AccessController: IPFSAccessController({ write: ['*']}), sync: true });
console.log('services db: ', serviceAds.address);

const buyOffers = await orbitdb.open("buy-offers", { type: "documents", AccessController: IPFSAccessController({ write: ['*']}), sync: true });
console.log('buy offers db: ', buyOffers.address);

const agreements = await orbitdb.open("agreements", { type: "documents", AccessController: IPFSAccessController({ write: ['*']}), sync: true });
console.log('agreements db: ', agreements.address);


updates.events.on('update', async (entry) => {
    // what has been updated.
    console.log('updates db: ', entry.payload.value)
})
