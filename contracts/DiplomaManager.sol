// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DiplomaVerifier.sol";

contract DiplomaManager {
    Groth16Verifier public verifier;
    
    // Mapping để lưu trữ root của Merkle tree
    mapping(uint256 => bool) public validRoots;
    
    // Event khi một root mới được thêm vào
    event RootAdded(uint256 root);
    
    // Event khi một diploma được verify thành công
    event DiplomaVerified(uint256 root);

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
    }

    // Hàm thêm root mới (chỉ owner mới được thêm)
    function addRoot(uint256 _root) public {
        validRoots[_root] = true;
        emit RootAdded(_root);
    }

    // Hàm verify diploma
    function verifyDiploma(
        bytes calldata proofs,
        uint256 input
    ) public returns (bool) {
        require(validRoots[input], "Invalid root");

        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) = abi
            .decode(proofs, (uint256[2], uint256[2][2], uint256[2]));
        

        uint256[1] memory inputs = [input];
        bool proofValid = verifier.verifyProof(a, b, c, inputs);
        require(proofValid, "Invalid proof");
        
        emit DiplomaVerified(input);
        return true;
    }

    // Hàm kiểm tra root có hợp lệ không
    function isValidRoot(uint256 _root) public view returns (bool) {
        return validRoots[_root];
    }
} 