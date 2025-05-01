const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');

async function main() {
    try {
        // Đọc Merkle tree data để lấy root và proofs
        const merkleData = JSON.parse(fs.readFileSync('merkle_tree_data.json', 'utf8'));
        const processedDiplomas = JSON.parse(fs.readFileSync('processed_diplomas.json', 'utf8'));

        // Lấy thông tin của diploma đầu tiên
        const realDiploma = processedDiplomas[0];
        
        // Tạo input cho circuit theo đúng format
        const input = {
            // Private inputs
            nameHash: realDiploma.nameHash,
            majorCode: realDiploma.majorCode,
            studentId: realDiploma.studentId,
            issueDate: realDiploma.issueDate,

            // Public inputs
            root: merkleData.root,
            pathIndices: merkleData.proofs[0].pathIndices,
            siblings: merkleData.proofs[0].siblings
        };

        // Lưu input vào file
        fs.writeFileSync('input.json', JSON.stringify(input, null, 2));

        console.log('Đã tạo xong input.json cho diploma thật');
        console.log('\nThông tin diploma:');
        console.log('- nameHash:', realDiploma.nameHash);
        console.log('- majorCode:', realDiploma.majorCode);
        console.log('- studentId:', realDiploma.studentId);
        console.log('- issueDate:', realDiploma.issueDate);
        console.log('\nMerkle proof:');
        console.log('- pathIndices:', input.pathIndices);
        console.log('- siblings:', input.siblings);
        console.log('- root:', input.root);

        // 2. Generate witness
        console.log('\nGenerating witness...');
        await execAsync('node DiplomaVerifier_js/generate_witness.js DiplomaVerifier_js/DiplomaVerifier.wasm input.json witness.wtns');
        console.log('Witness generated successfully!');

        // 3. Generate proof
        console.log('\nGenerating proof...');
        await execAsync('snarkjs groth16 prove DiplomaVerifier_0001.zkey witness.wtns proof.json public.json');
        console.log('Proof generated successfully!');

        // 4. Verify proof
        console.log('\nVerifying proof...');
        const { stdout } = await execAsync('snarkjs groth16 verify verification_key.json public.json proof.json');
        console.log('Verification result:', stdout);

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 