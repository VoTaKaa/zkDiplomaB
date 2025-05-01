pragma circom 2.0.0;

include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/sha256/sha256.circom";
include "node_modules/circomlib/circuits/signatures/eddsa.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template StringToBits(n) {
    signal input in[n];
    signal output out[n*8];
    
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < 8; j++) {
            out[i*8 + j] <== (in[i] >> j) & 1;
        }
    }
}

template DateValidator() {
    signal input day;
    signal input month;
    signal input year;
    signal output isValid;
    
    // Kiểm tra ngày hợp lệ (1-31)
    component dayCheck = LessEqThan(8);
    dayCheck.in[0] <== day;
    dayCheck.in[1] <== 31;
    
    // Kiểm tra tháng hợp lệ (1-12)
    component monthCheck = LessEqThan(8);
    monthCheck.in[0] <== month;
    monthCheck.in[1] <== 12;
    
    // Kiểm tra năm hợp lệ (1900-2100)
    component yearLowerCheck = GreaterEqThan(16);
    yearLowerCheck.in[0] <== year;
    yearLowerCheck.in[1] <== 1900;
    
    component yearUpperCheck = LessEqThan(16);
    yearUpperCheck.in[0] <== year;
    yearUpperCheck.in[1] <== 2100;
    
    isValid <== dayCheck.out * monthCheck.out * yearLowerCheck.out * yearUpperCheck.out;
}

template Diploma() {
    // Private inputs
    signal private input studentName[32];      // Tên sinh viên (32 bytes)
    signal private input birthDay;             // Ngày sinh
    signal private input birthMonth;           // Tháng sinh
    signal private input birthYear;            // Năm sinh
    signal private input diplomaId[16];        // Mã số bằng (16 bytes)
    signal private input issueDay;             // Ngày cấp
    signal private input issueMonth;           // Tháng cấp
    signal private input issueYear;            // Năm cấp
    
    // Public inputs
    signal input institutionName[32];          // Tên trường (32 bytes)
    signal input institutionPubKey[2];         // Public key của trường
    signal input signatureR8x;                 // Chữ ký số
    signal input signatureR8y;
    signal input signatureS;
    signal input currentYear;                  // Năm hiện tại (để kiểm tra ngày cấp)
    
    // Output
    signal output isValid;                     // Kết quả xác thực
    
    // Chuyển đổi string thành bits
    component nameBits = StringToBits(32);
    nameBits.in <== studentName;
    
    component idBits = StringToBits(16);
    idBits.in <== diplomaId;
    
    component institutionBits = StringToBits(32);
    institutionBits.in <== institutionName;
    
    // Kiểm tra ngày sinh hợp lệ
    component birthDateValidator = DateValidator();
    birthDateValidator.day <== birthDay;
    birthDateValidator.month <== birthMonth;
    birthDateValidator.year <== birthYear;
    
    // Kiểm tra ngày cấp hợp lệ
    component issueDateValidator = DateValidator();
    issueDateValidator.day <== issueDay;
    issueDateValidator.month <== issueMonth;
    issueDateValidator.year <== issueYear;
    
    // Kiểm tra ngày cấp không trong tương lai
    component yearCheck = LessEqThan(16);
    yearCheck.in[0] <== issueYear;
    yearCheck.in[1] <== currentYear;
    
    // Tạo message để verify chữ ký
    component hasher = Sha256(4);
    hasher.in[0] <== nameBits.out;
    hasher.in[1] <== idBits.out;
    hasher.in[2] <== institutionBits.out;
    hasher.in[3] <== 0;
    
    // Verify chữ ký
    component verifier = EdDSAMiMCVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== institutionPubKey[0];
    verifier.Ay <== institutionPubKey[1];
    verifier.R8x <== signatureR8x;
    verifier.R8y <== signatureR8y;
    verifier.S <== signatureS;
    verifier.M <== hasher.out;
    
    // Kết quả xác thực (tất cả các điều kiện phải thỏa mãn)
    isValid <== verifier.out * 
                birthDateValidator.isValid * 
                issueDateValidator.isValid * 
                yearCheck.out;
}

component main = Diploma(); 