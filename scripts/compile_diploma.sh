#!/bin/bash

# Tạo thư mục build nếu chưa có
mkdir -p build/diploma

# Compile circuit
echo "Compiling circuit..."
circom circuits/examples/diploma/SimpleDiploma.circom --r1cs --wasm --sym -o build/diploma

# Generate witness
echo "Generating witness..."
node build/diploma/SimpleDiploma_js/generate_witness.js build/diploma/SimpleDiploma_js/SimpleDiploma.wasm circuits/examples/diploma/input.json build/diploma/witness.wtns

# Generate zkey
echo "Generating zkey..."
snarkjs plonk setup build/diploma/SimpleDiploma.r1cs pot12_final.ptau build/diploma/SimpleDiploma.zkey

# Export verification key
echo "Exporting verification key..."
snarkjs zkey export verificationkey build/diploma/SimpleDiploma.zkey build/diploma/verification_key.json

# Generate proof
echo "Generating proof..."
snarkjs plonk prove build/diploma/SimpleDiploma.zkey build/diploma/witness.wtns build/diploma/proof.json build/diploma/public.json

# Verify proof
echo "Verifying proof..."
snarkjs plonk verify build/diploma/verification_key.json build/diploma/public.json build/diploma/proof.json 