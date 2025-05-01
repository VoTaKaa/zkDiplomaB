pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/signatures/eddsa.circom";

template SimpleDiploma() {
    // Private inputs (thông tin cần giữ bí mật)
    signal input studentId;          // Mã số sinh viên
    signal input studentName[32];    // Họ tên sinh viên (32 bytes)
    signal input birthYear;          // Năm sinh
    signal input gpa;                // Điểm trung bình (x100 để xử lý số thập phân)
    signal input major[16];          // Mã ngành học (16 bytes)
    
    // Public inputs (thông tin công khai)
    signal input graduationYear;     // Năm tốt nghiệp
    signal input institutionId;      // Mã trường
    signal input institutionPubKey[2];// Public key của trường
    signal input signatureR8x;       // Chữ ký số của trường
    signal input signatureR8y;
    signal input signatureS;
    signal input currentYear;        // Năm hiện tại (để kiểm tra)
    
    // Output
    signal output isValid;           // Kết quả xác thực
    
    // 1. Kiểm tra năm sinh hợp lệ (>= 1900 và < năm tốt nghiệp)
    component birthYearCheck1 = GreaterEqThan(32);
    birthYearCheck1.in[0] <== birthYear;
    birthYearCheck1.in[1] <== 1900;
    
    component birthYearCheck2 = LessThan(32);
    birthYearCheck2.in[0] <== birthYear;
    birthYearCheck2.in[1] <== graduationYear;
    
    // 2. Kiểm tra năm tốt nghiệp hợp lệ (<= năm hiện tại)
    component gradYearCheck = LessEqThan(32);
    gradYearCheck.in[0] <== graduationYear;
    gradYearCheck.in[1] <== currentYear;
    
    // 3. Kiểm tra GPA hợp lệ (0-400, tương ứng với 0.00-4.00)
    component gpaCheck1 = GreaterEqThan(32);
    gpaCheck1.in[0] <== gpa;
    gpaCheck1.in[1] <== 0;
    
    component gpaCheck2 = LessEqThan(32);
    gpaCheck2.in[0] <== gpa;
    gpaCheck2.in[1] <== 400;
    
    // 4. Tạo message để verify chữ ký
    // Message = hash(studentId || studentName || birthYear || gpa || major || graduationYear || institutionId)
    signal message[7];
    message[0] <== studentId;
    message[1] <== studentName[0]; // Đơn giản hóa, chỉ dùng byte đầu tiên
    message[2] <== birthYear;
    message[3] <== gpa;
    message[4] <== major[0];      // Đơn giản hóa, chỉ dùng byte đầu tiên
    message[5] <== graduationYear;
    message[6] <== institutionId;
    
    // 5. Verify chữ ký
    component verifier = EdDSAMiMCVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== institutionPubKey[0];
    verifier.Ay <== institutionPubKey[1];
    verifier.R8x <== signatureR8x;
    verifier.R8y <== signatureR8y;
    verifier.S <== signatureS;
    verifier.M <== message;
    
    // 6. Kết hợp tất cả các điều kiện
    isValid <== birthYearCheck1.out * 
                birthYearCheck2.out * 
                gradYearCheck.out * 
                gpaCheck1.out * 
                gpaCheck2.out * 
                verifier.out;
}

component main = SimpleDiploma(); 