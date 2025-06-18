const { groth16 } = require("snarkjs");
const wc = require("./zk_calculator/witness_calculator.js");
const fs = require("fs");
const { AbiCoder } = require("ethers");
const path = require("path");
const { fileURLToPath } = require("url");
const { buildPoseidon } = require("circomlibjs");

function mappingMajorCode(major) {
  switch (major) {
    case "Information Technology":
      return 1;
    case "Information Systems":
      return 2;
    case "Computer Science":
      return 3;
    case "Software Engineering":
      return 4;
    case "Computer Engineering":
      return 5;
    case "Computer Networks & Data Communications":
      return 6;
    case "Information Security":
      return 7;
    case "E-commerce":
      return 8;
    case "Data Science":
      return 9;
    case "Artificial Intelligence":
      return 10;
    case "Microchip Design":
      return 11;
    case "Multimedia Communications":
      return 12;
  }
}

async function prepareDiplomaData(data) {
  // Khởi tạo Poseidon hash function
  const poseidon = await buildPoseidon();

  // Đọc dữ liệu từ file
  // const inputPath = path.join(__dirname, '..', 'data', 'unpro', 'diploma_samples.json');
  // const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // Xử lý dữ liệu
  const processedData = data.map((sample) => {
    // Tạo name từ last_name và first_name
    const name = `${sample.last_name} ${sample.first_name}`;

    // Chuyển name thành bytes
    const nameBytes = Buffer.from(name, "utf8");

    // Chia nameBytes thành các chunk 32 bytes
    const chunks = [];
    for (let i = 0; i < nameBytes.length; i += 32) {
      chunks.push(nameBytes.slice(i, i + 32));
    }

    // Hash từng chunk và kết hợp
    let nameHash = BigInt(0);
    for (const chunk of chunks) {
      // Chuyển chunk thành số bigint
      const chunkBigInt = BigInt("0x" + chunk.toString("hex"));
      // Hash chunk
      const hash = poseidon([chunkBigInt]);
      // Kết hợp với hash hiện tại
      nameHash = poseidon([nameHash, hash]);
    }

    // Tạo majorCode ngẫu nhiên từ 1-5
    // const majorCode = Math.floor(Math.random() * 5) + 1;
    const majorCode = mappingMajorCode(sample.major);

    // Xử lý issue_date: bỏ dấu "-"
    const issueDate = sample.issue_date.replace(/-/g, "");

    // Hash tất cả thông tin của diploma
    const diplomaHash = poseidon([
      nameHash,
      BigInt(majorCode),
      BigInt(sample.student_id),
      BigInt(issueDate),
    ]);

    return {
      nameHash: poseidon.F.toString(nameHash),
      majorCode,
      studentId: sample.student_id,
      issueDate,
      leafHash: poseidon.F.toString(diplomaHash),
    };
  });

  return processedData;
}

async function createMerkleTree(processedData) {
  // Khởi tạo Poseidon hash function
  const poseidon = await buildPoseidon();

  // Tạo leaf nodes từ dữ liệu
  const leaves = processedData.map((diploma) => diploma.leafHash);

  // Đảm bảo số lượng leaves là lũy thừa của 2
  const zeroValue = "0";
  while (leaves.length & (leaves.length - 1)) {
    leaves.push(zeroValue);
  }

  // Hàm tính hash của 2 node
  function hashPair(left, right) {
    const hash = poseidon([BigInt(left), BigInt(right)]);
    return poseidon.F.toString(hash);
  }

  // Hàm tạo Merkle proof cho một leaf
  function generateProof(leafIndex) {
    const proof = {
      leaf: leaves[leafIndex],
      pathIndices: [],
      siblings: [],
    };

    let currentIndex = leafIndex;
    let currentLevel = leaves;

    while (currentLevel.length > 1) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      proof.pathIndices.push(isRight ? 1 : 0);
      proof.siblings.push(currentLevel[siblingIndex]);

      // Tạo level tiếp theo
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right =
          i + 1 < currentLevel.length ? currentLevel[i + 1] : zeroValue;
        nextLevel.push(hashPair(left, right));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  // Tính Merkle root
  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right =
        i + 1 < currentLevel.length ? currentLevel[i + 1] : zeroValue;
      nextLevel.push(hashPair(left, right));
    }
    currentLevel = nextLevel;
  }
  const root = currentLevel[0];

  // Tạo proofs cho mỗi leaf thật
  const proofs = [];
  for (let i = 0; i < processedData.length; i++) {
    proofs.push(generateProof(i));
  }

  // Lưu dữ liệu Merkle tree
  const merkleData = {
    root: root,
    leaves: leaves.slice(0, processedData.length), // Chỉ lưu các leaf thật
    proofs: proofs,
  };

  return merkleData;
}

//Tạo proof để  gửi cho verifier
async function generateProof(merkleTreeData) {
  // build witness calculator with webassembly
  const buffer = fs.readFileSync(
    path.join(__dirname, "zk_calculator", "DiplomaVerifier.wasm")
  );
  const witnessCalculator = await wc(buffer);

  const witnessFile = await witnessCalculator.calculateWTNSBin(
    merkleTreeData,
    0
  );

  const zKeyFile = fs.readFileSync(
    path.join(__dirname, "zk_calculator", "DiplomaVerifier_final.zkey")
  );

  const { proof, publicSignals } = await groth16.prove(zKeyFile, witnessFile);

  const dataStr = await groth16.exportSolidityCallData(proof, publicSignals);
  const data = JSON.parse("[" + dataStr + "]");
  console.log("Data: ", data);

  const abiCoder = new AbiCoder();

  const bytes = abiCoder.encode(
    ["uint256[2]", "uint256[2][2]", "uint256[2]"],
    [data[0], data[1], data[2]]
  );

  console.log("Solidity Calldata");
  console.log("proof: " + bytes);

  return bytes;
}

module.exports = {
  mappingMajorCode,
  prepareDiplomaData,
  createMerkleTree,
  generateProof,
};
