import { generateKeyPair, privateKeyFromRaw } from '@libp2p/crypto/keys'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { identify, identifyPush } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { LevelDatastore } from 'datastore-level'
import { dataDir } from './datadir.js'
import fs from 'fs';

const KEYPAIR_PATH = dataDir + '/keypair.json';


/* 
 * Get or create a keypair
 * 
 * If a keypair exists, load it
 * Otherwise, create a new one and save it to disk
*/
async function getOrCreateKeypair() {
    let keypair;
    if (fs.existsSync(KEYPAIR_PATH)) {
        // load keypair from disk
        keypair = JSON.parse(fs.readFileSync(KEYPAIR_PATH));
        keypair = await privateKeyFromRaw(Uint8Array.from(Object.values(keypair.raw)));
        console.log("Loaded existing keypair.\n");
    } else {
        // generate new keypair
        keypair = await generateKeyPair('Ed25519');
        console.log("Generated new keypair.\n");

        // write keypair to disk
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(keypair));
    }

    return keypair;
}

const keypair = await getOrCreateKeypair();
const datastore = new LevelDatastore(dataDir + '/libp2p');
await datastore.open(); // level database must be ready before node boot

export const Libp2pOptions = {
  privateKey: keypair,
  datastore,
  peerStore: {
    persistence: true,
    threshold: 5
  },
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/2368',
      '/ip4/0.0.0.0/tcp/2369/ws'
    ]
  },
  transports: [
    tcp(),
    webSockets()
  ],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    identifyPush: identifyPush(),
    pubsub: gossipsub({ allowPublishToZeroTopicPeers: true })
  }
}
