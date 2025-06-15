# Diploma Verification System using Circom

This project implements a zero-knowledge proof system for verifying diplomas using Circom. The system allows for secure and private verification of diploma authenticity without revealing sensitive personal information.

## Overview

The system uses Merkle trees and zero-knowledge proofs to verify the authenticity of diplomas. It consists of several key components:

1. **HashDiploma**: Hashes diploma information into a leaf node
2. **Selector**: Handles the selection of left/right nodes in the Merkle tree
3. **MerkleProof**: Verifies the Merkle proof path
4. **DiplomaVerifier**: Main circuit that combines all components

## Technical Details

### Circuit Components

- **HashDiploma**: Uses Poseidon hash function to combine:
  - Name hash
  - Major code
  - Student ID
  - Issue date

- **Selector**: Implements the logic for selecting left/right nodes based on path indices

- **MerkleProof**: 
  - Takes a leaf node and proof path
  - Recomputes the Merkle root
  - Verifies against the provided root

- **DiplomaVerifier**:
  - Main circuit with 5 levels (32 leaves)
  - Public input: root
  - Private inputs: diploma information

### Security Features

- Zero-knowledge proofs ensure privacy
- Merkle tree structure for efficient verification
- Poseidon hash function for cryptographic security

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Compile the circuit:
```bash
circom circuits/DiplomaVerifier.circom --r1cs --wasm --sym
```

3. Generate the proving key:
```bash
snarkjs groth16 setup DiplomaVerifier.r1cs pot12_final.ptau DiplomaVerifier_final.zkey
```

## Usage

1. Generate a proof:
```bash
snarkjs groth16 prove DiplomaVerifier_final.zkey witness.wtns proof.json public.json
```

2. Verify the proof:
```bash
snarkjs groth16 verify verification_key.json public.json proof.json
```

## Dependencies

- circom 2.0.0
- circomlib
- snarkjs

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 