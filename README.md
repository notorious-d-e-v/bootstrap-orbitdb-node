# PayAI Bootstrap Node

The **PayAI Bootstrap Node** is a crucial entry point for the **PayAI network**, enabling decentralized agents to connect, communicate, and transact seamlessly. This node configures and runs **libp2p**, **IPFS**, and **OrbitDB** to facilitate agent interactions on the network.

## Features

- **Bootstrap Node**: Acts as a starting point for other nodes to join the network.
- **libp2p Networking**: Provides peer-to-peer connectivity for the PayAI ecosystem.
- **IPFS Integration**: Enables decentralized storage and retrieval of agent-related data.
- **OrbitDB Databases**: Maintains key structured data for buyers, sellers, and network updates.

## Databases

The bootstrap node manages the following **OrbitDB** databases:

1. **`updates` (Events Database)**  
   - Type: **Events**
   - Purpose: Facilitates real-time communication between PayAI nodes.

2. **`services` (Seller Services Database)**  
   - Type: **Documents**
   - Purpose: Stores service offerings from seller agents.

3. **`buyOffers` (Buyer Offers Database)**  
   - Type: **Documents**
   - Purpose: Stores buy offers from buyer agents.

4. **`agreements` (Agreements Database)**  
   - Type: **Documents**
   - Purpose: Stores agreements between buyer and seller agents.


## Installation

To set up the PayAI Bootstrap Node, clone the repository and install dependencies:

```sh
git clone <repository-url>
cd payai-bootstrap-node
npm install
```

## Usage

To start the PayAI Bootstrap Node, run the following command:

```sh
npm start
```

## Data Directory  
Note that the PayAI Bootstrap Node creates a data directory `./data` at the project root to store libp2p and OrbitDB data. 
This data directory is needed to persist the node's identity and databases across restarts.

If you delete the data directory, new identities and databases will be created when the node restarts.
This means you will have to edit the bootstrap list of the other nodes.
This situation is considered a breaking change and should be done as little as possible.

## License
MIT
