
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 5635002367953871572585346944479831777037889327777474965208652310115052415513;
    uint256 constant alphay  = 4585166694972191068284906904589838800584647326276134945245855307683305322163;
    uint256 constant betax1  = 13169160798764098323704950457009937617070446790671525540259160225987734135099;
    uint256 constant betax2  = 5045267945956425431414528216253156674018114111656116980961126453369773052545;
    uint256 constant betay1  = 13015186043089929343056631113312345873467125891163220899186717259167931615036;
    uint256 constant betay2  = 2831376358746035100397244786943069348948417042065792849120296947231029529398;
    uint256 constant gammax1 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammax2 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammay1 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant gammay2 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant deltax1 = 6586769165972951203253106762249616552403850691358961971090378554646950692153;
    uint256 constant deltax2 = 9496131199152294108450876116071747411563310819417528917822132264039915488009;
    uint256 constant deltay1 = 9908021870997522250456586299954455887804276857788240570645858966010082559197;
    uint256 constant deltay2 = 9268085671689197708639558121596785217501899634349698618014851278617539250690;

    
    uint256 constant IC0x = 11666088972002977024343196451236958140900571522128132087341446187687347465539;
    uint256 constant IC0y = 12775042008031475321332617611627589713071916743346434401909810837112050108538;
    
    uint256 constant IC1x = 6502596567029161835313099207718444877090872559721928569665353417385108860954;
    uint256 constant IC1y = 9466905902318882242619890505248398319380221505533648007986152494165254322557;
    
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public view returns (bool) {
        console.log("Starting proof verification");
        console.log("Input:", input[0]);
        
        bool isValid;
        assembly {
            let _pA := a
            let _pB := b
            let _pC := c
            let _pubSignals := input

            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            checkField(calldataload(add(_pubSignals, 0)))

            // Validate all evaluations
            isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)
        }
        
        console.log("Verification result:", isValid);
        return isValid;
    }
}
