pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template Hash2() {
    signal input in[2];
    signal output out;
    
    component hash = Poseidon(2);
    hash.inputs[0] <== in[0];
    hash.inputs[1] <== in[1];
    out <== hash.out;
}

template MerkleTreeInclusionProof(nLevels) {
    signal input leaf;           // Hash của thông tin văn bằng
    signal input pathIndices[nLevels];  // Chỉ số đường đi trong cây
    signal input siblings[nLevels];     // Hash của các node anh em
    signal input root;           // Root hash của cây
    
    signal computedRoot;         // Root hash được tính toán
    
    component hashers[nLevels];
    signal intermediates[nLevels + 1];
    
    intermediates[0] <== leaf;
    
    for (var i = 0; i < nLevels; i++) {
        hashers[i] = Hash2();
        
        // Nếu pathIndices[i] = 0, leaf là node trái
        // Nếu pathIndices[i] = 1, leaf là node phải
        hashers[i].in[0] <== pathIndices[i] == 0 ? intermediates[i] : siblings[i];
        hashers[i].in[1] <== pathIndices[i] == 0 ? siblings[i] : intermediates[i];
        
        intermediates[i + 1] <== hashers[i].out;
    }
    
    computedRoot <== intermediates[nLevels];
    
    // Kiểm tra root hash tính được có khớp với root hash cho trước
    root === computedRoot;
}

template DiplomaVerifier(nLevels) {
    // Public input
    signal input root;               // Root hash của cây Merkle (public)
    
    // Private inputs
    signal private input studentId;  // Mã số sinh viên
    signal private input gpa;        // Điểm trung bình (x100)
    signal private input pathIndices[nLevels];  // Chỉ số đường đi
    signal private input siblings[nLevels];     // Hash của các node anh em
    
    // Output
    signal output isValid;           // Kết quả xác thực
    
    // 1. Hash thông tin văn bằng
    component leafHasher = Hash2();
    leafHasher.in[0] <== studentId;
    leafHasher.in[1] <== gpa;
    
    // 2. Kiểm tra GPA hợp lệ (0-400)
    component gpaCheck1 = GreaterEqThan(32);
    gpaCheck1.in[0] <== gpa;
    gpaCheck1.in[1] <== 0;
    
    component gpaCheck2 = LessEqThan(32);
    gpaCheck2.in[0] <== gpa;
    gpaCheck2.in[1] <== 400;
    
    // 3. Kiểm tra Merkle proof
    component merkleProof = MerkleTreeInclusionProof(nLevels);
    merkleProof.leaf <== leafHasher.out;
    merkleProof.pathIndices <== pathIndices;
    merkleProof.siblings <== siblings;
    merkleProof.root <== root;
    
    // 4. Kết hợp tất cả các điều kiện
    isValid <== gpaCheck1.out * gpaCheck2.out;
}

component main = DiplomaVerifier(3); // 3 levels = 8 leaves 