# Diploma Verification System using Zero-Knowledge Proofs

This project implements a secure diploma verification system using Zero-Knowledge Proofs (ZKP) and blockchain technology. It allows for privacy-preserving verification of academic credentials.

## Features

- Zero-Knowledge Proof generation for diploma verification
- Merkle tree implementation for efficient storage and verification
- Smart contract deployment on both Ethereum Sepolia and ZkSync Sepolia
- Performance measurement tools for proof generation and verification
- Sample diploma data generation and processing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hardhat
- circom
- snarkjs

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `secret.json` file in the root directory with your private key:
```json
{
    "privateKey": "your-private-key-here"
}
```

## Project Structure

```
├── circuits/               # Circom circuit files
├── contracts/             # Smart contracts
├── scripts/              # Deployment and test scripts
├── utils/               # Utility functions
├── diploma_samples.json # Sample diploma data
├── hardhat.config.js   # Hardhat configuration
└── secret.json        # Private key configuration (not in git)
```

## Usage

### 1. Generate Proof

```bash
node scripts/measure_proving_time.js
```

This will:
- Process diploma data
- Generate Merkle tree
- Create ZK proof
- Measure performance metrics

### 2. Deploy Contracts

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to ZkSync Sepolia
npx hardhat run scripts/deploy.js --network zkSyncSepolia
```

### 3. Verify Proof on Blockchain

```bash
# Test on Sepolia
npx hardhat run scripts/test_sepolia.js --network sepolia

# Test on ZkSync
npx hardhat run scripts/test_zksync.js --network zkSyncSepolia
```

## Performance Metrics

### Proof Generation
- Average time: ~1.081 seconds
- Name hashing: ~0.335 seconds
- Proof generation: ~0.747 seconds

### Blockchain Verification
- Sepolia: Higher gas costs, longer verification time
- ZkSync: Lower gas costs, faster verification time

## Security Considerations

- Private keys are stored in `secret.json` (not committed to git)
- Zero-knowledge proofs ensure privacy of diploma data
- Merkle tree implementation for efficient verification
- Smart contract security best practices

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- circom
- snarkjs
- Hardhat
- ZkSync
- Ethereum Foundation 