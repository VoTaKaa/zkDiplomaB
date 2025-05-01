const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

describe("Diploma Verification", function () {
  let diplomaManager;
  let diplomaVerifier;
  let owner;

  before(async function () {
    // Deploy DiplomaVerifier
    const DiplomaVerifier = await ethers.getContractFactory("Groth16Verifier");
    diplomaVerifier = await DiplomaVerifier.deploy();
    await diplomaVerifier.deployed();
    console.log("DiplomaVerifier deployed to:", diplomaVerifier.address);

    // Deploy DiplomaManager
    const DiplomaManager = await ethers.getContractFactory("DiplomaManager");
    diplomaManager = await DiplomaManager.deploy(diplomaVerifier.address);
    await diplomaManager.deployed();
    console.log("DiplomaManager deployed to:", diplomaManager.address);

    [owner] = await ethers.getSigners();
  });

  it("Should verify a valid diploma", async function () {
    // Load proof and public inputs
    const proof = JSON.parse(fs.readFileSync("proof.json", "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync("public.json", "utf8"));

    // Add root to valid roots
    await diplomaManager.addRoot(publicSignals[0]);
    console.log("Added root:", publicSignals[0]);

    // Format proof for contract
    const proofForContract = {
      a: proof.pi_a.slice(0, 2),
      b: [
        proof.pi_b[0].slice(0).reverse(),
        proof.pi_b[1].slice(0).reverse()
      ],
      c: proof.pi_c.slice(0, 2)
    };

    // Verify proof
    const result = await diplomaManager.verifyDiploma(
      proofForContract.a,
      proofForContract.b,
      proofForContract.c,
      publicSignals
    );

    expect(result).to.be.true;
  });

  it("Should reject invalid root", async function () {
    const proof = JSON.parse(fs.readFileSync("proof.json", "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync("public.json", "utf8"));

    const proofForContract = {
      a: proof.pi_a.slice(0, 2),
      b: [
        proof.pi_b[0].slice(0).reverse(),
        proof.pi_b[1].slice(0).reverse()
      ],
      c: proof.pi_c.slice(0, 2)
    };

    // Try to verify with invalid root
    const invalidSignals = [ethers.utils.hexlify(ethers.utils.randomBytes(32))];
    
    await expect(
      diplomaManager.verifyDiploma(
        proofForContract.a,
        proofForContract.b,
        proofForContract.c,
        invalidSignals
      )
    ).to.be.revertedWith("Invalid root");
  });
}); 