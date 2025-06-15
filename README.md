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

## Experimental Results

### Circuit Constraints
- Total number of constraints: 1,507 (non-linear constraints)
- Template instances: 148
- Linear constraints: 0
- Public inputs: 1
- Private inputs: 14
- Total wires: 1,522

### Performance Metrics

#### Proof Generation
- Average time: ~1.081 seconds
- Name hashing: ~0.335 seconds
- Proof generation: ~0.747 seconds

#### Blockchain Verification
- Sepolia: Higher gas costs, longer verification time
- ZkSync: Lower gas costs, faster verification time

### Memory Usage
- Peak memory usage during proof generation: ~2.5GB
- Average memory usage: ~1.8GB

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

### Deployed Contracts

#### Sepolia Testnet
- Contract Address: `0x3D11895D0BB719AcF7B0D995ED19953388318B82`

#### ZkSync Sepolia Testnet
- Contract Address: `0x3D11895D0BB719AcF7B0D995ED19953388318B82`

### Circuit Constraints

- Total number of constraints: 1,507 (non-linear constraints)
- Template instances: 148
- Linear constraints: 0
- Public inputs: 1
- Private inputs: 14
- Total wires: 1,522

### Sample Proof Test

```json
{
    "pi_a": [
        "2362697662440781389547050573638905942109802000918492678604911253049211251656",
        "17560770992279185907265606042719519214415065086173017313293760939833095056750"
    ],
    "pi_b": [
        [
            "9431950061316970408854248991205044687608401273022672686671426354505767570819",
            "4832862778172240778693373324504720039322456535321360237946486748352360641410"
        ],
        [
            "6716916866468099429243955441926554791738661249254531295138614130000844616656",
            "15779362199440043520015197481782495554985528885454465338264181923082716237231"
        ]
    ],
    "pi_c": [
        "20087246615927649160492697042027676857909658589575550209181696305454221930865",
        "16371044190390649430607633484498243034484776945072948821912926919772303999048"
    ],
    "public": [
        "6127766017438882796241294385909301777591804685931624225673042574592414873794"
    ]
} 