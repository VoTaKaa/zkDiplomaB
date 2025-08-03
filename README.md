# zkDiploma - Hệ thống Xác minh Bằng cấp sử dụng Zero-Knowledge Proof

### 👥 Người dùng hệ thống

- **Issuer**: Tổ chức phát hành bằng cấp (trường đại học)
- **Holder**: Người sở hữu bằng cấp (sinh viên)
- **Verifier**: Bên xác minh bằng cấp (nhà tuyển dụng)

## 🚀 Cài đặt và Khởi chạy

### 📋 Yêu cầu hệ thống

- Node.js (v16 trở lên)
- npm hoặc yarn
- MongoDB
- MetaMask browser extension
- Git

### 🔧 Cài đặt Backend

1. **Di chuyển vào thư mục backend:**

```bash
cd backend
```

2. **Cài đặt dependencies:**

```bash
npm install
```

3. **Tạo file .env:**

```bash
cp .env.example .env
```

4. **Cấu hình biến môi trường (.env):**

```env
PORT=
MONGO_DB=
```

5. **Khởi chạy server:**

```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3001`

### 🎨 Cài đặt Frontend

1. **Di chuyển vào thư mục frontend:**

```bash
cd frontend
```

2. **Cài đặt dependencies:**

```bash
npm install
```

3. **Tạo file .env:**

```bash
cp .env.example .env
```

4. **Cấu hình biến môi trường (.env):**

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_DIPLOMA_MANAGER_ADDRESS=your_smart_contract_address
REACT_APP_CHAIN_ID=
REACT_APP_CHAIN_NAME=
REACT_APP_RPC_URL=
REACT_APP_BLOCK_EXPLORER=
```

5. **Khởi chạy ứng dụng:**

```bash
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 🔗 Smart Contract

Địa chỉ contracts trên Sepolia Testnet: `0x3D11895D0BB719AcF7B0D995ED19953388318B82`

## 📁 Cấu trúc dữ liệu

### Diploma Sample Format

```json
{
  "samples": [
    {
      "last_name": "Vo",
      "first_name": "Tan Khoa",
      "date_of_birth": "1990-01-29",
      "place_of_birth": "Binh Dinh",
      "gender": "Male",
      "ethnicity": "Kinh",
      "nationality": "Vietnam",
      "course_duration": "2008-2013",
      "graduation_year": 2013,
      "major": "Software Engineering",
      "classification": "Good",
      "gpa": 8.25,
      "study_type": "Full-time",
      "certificate_number": "CB00624/20KH2/2011",
      "old_certificate_number": null,
      "decision_number": "91/QD-DHCNTT-DTDH",
      "book_number": "014PM13",
      "issue_date": "2013-05-24",
      "institution_code": "CQUI",
      "student_id": "08520555",
      "wallet_address": "0x77c5cf4fC4bAAe1b9b0B3A2a8c480E9e8934EA75"
    },
    {
      "last_name": "Thach",
      "first_name": "Minh Luan",
      "date_of_birth": "2004-08-24",
      "place_of_birth": "Tra Vinh",
      "gender": "Male",
      "ethnicity": "Khmer",
      "nationality": "Vietnam",
      "course_duration": "2022-2026",
      "graduation_year": 2026,
      "major": "Information Technology",
      "classification": "Excellent",
      "gpa": 9.0,
      "study_type": "Full-time",
      "certificate_number": "CB00625/20KH2/2011",
      "old_certificate_number": null,
      "decision_number": "91/QD-DHCNTT-DTDH",
      "book_number": "014PM13",
      "issue_date": "2013-05-24",
      "institution_code": "CQUI",
      "student_id": "08520556",
      "wallet_address": "0x77c5cf4fC4bAAe1b9b0B3A2a8c480E9e8934EA75"
    }
  ]
}
```
