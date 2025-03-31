import { generateKeyPair, privateKeyFromRaw } from '@libp2p/crypto/keys'
import { bootstrap } from "@libp2p/bootstrap";
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { identify, identifyPush } from '@libp2p/identify'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { LevelDatastore } from 'datastore-level'
import { dataDir } from './datadir.js'
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

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
  peerDiscovery: [
    bootstrap({
      list: [
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa", // rust-libp2p-server
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
	"/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8", // js-libp2p-amino-dht-bootstrapper
	"/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",           // mars.i.ipfs.io
	"/ip4/104.131.131.82/udp/4001/quic-v1/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",   // mars.i.ipfs.io
      ]
    }),
  ],
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/2368',
      '/ip4/0.0.0.0/tcp/2369/ws',
    ],
    announce: [
      `/ip4/${process.env.IPV4_ADDRESS}/tcp/2368`,
      `/ip4/${process.env.IPV4_ADDRESS}/tcp/2369/ws`,
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
    pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
	  /*
    aminoDHT: kadDHT({
      protocol: '/ipfs/kad/1.0.0',
      peerInfoMapper: removePrivateAddressesMapper,
      clientMode: false
    }),
    */
  }
}
