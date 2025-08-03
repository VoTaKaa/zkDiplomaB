// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DiplomaVerifier.sol";
import "hardhat/console.sol";

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
        console.log("DiplomaManager deployed with verifier:", address(verifier));
    }

    // Hàm thêm root mới (chỉ owner mới được thêm)
    function addRoot(uint256 _root) public {
        validRoots[_root] = true;
        console.log("Added new root:", _root);
        emit RootAdded(_root);
    }

    // Hàm verify diploma
    function verifyDiploma(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public returns (bool) {
        console.log("Verifying diploma with root:", input[0]);
        require(validRoots[input[0]], "Invalid root");
        console.log("Root is valid");
        
        bool proofValid = verifier.verifyProof(a, b, c, input);
        console.log("Proof verification result:", proofValid);
        require(proofValid, "Invalid proof");
        
        emit DiplomaVerified(input[0]);
        return true;
    }

    // Hàm kiểm tra root có hợp lệ không
    function isValidRoot(uint256 _root) public view returns (bool) {
        return validRoots[_root];
    }
} 