# 💊 PharmaSentinel
### Blockchain-Based Pharmaceutical Supply Chain Management System

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

---

## 📌 About The Project

**PharmaSentinel** is a secure, blockchain-based web application designed to detect and prevent counterfeit medicines in the pharmaceutical supply chain. 

Fake and substandard medicines pose a serious global health risk. Traditional supply chain systems rely on centralized databases that can be easily manipulated. PharmaSentinel solves this by assigning each medicine batch its own **private blockchain**, where every transaction is permanently recorded using **SHA-256 hashing** and **HMAC digital signatures** — making all data tamper-proof and fully traceable.

---

## ✨ Key Features

- 🔐 **JWT-Based Role Authentication** — Secure login for 6 roles: Manufacturer, Distributor, Wholesaler, Shopkeeper, Consumer, and Regulatory Authority
- ⛓️ **Custom Private Blockchain** — Each medicine batch has its own blockchain with hash chaining and digital signatures
- 📦 **End-to-End Medicine Tracking** — Full lifecycle traceability from manufacturer to consumer
- 🔍 **Counterfeit Detection** — Automatic blockchain validation to detect tampering and duplicate transactions
- 📱 **QR Code / Batch ID Verification** — Consumers can verify medicine authenticity without login
- 🏛️ **Regulatory Admin Dashboard** — Central control panel for monitoring supply chain compliance
- 📊 **Logging & Monitoring** — System activity tracking using Python's logging module

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, Django, Django REST Framework |
| **Frontend** | React JS, Bootstrap |
| **Database** | PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens) |
| **Blockchain** | Custom Private Blockchain Implementation |
| **Cryptography** | SHA-256 Hashing, HMAC Digital Signatures |
| **Monitoring** | Python Logging Module |

---

## 🏗️ System Architecture

```
Consumer / Stakeholder
        ↓
   React JS Frontend
        ↓
Django REST Framework (APIs)
        ↓
   JWT Authentication
        ↓
  Business Logic Layer
     ↙          ↘
PostgreSQL    Custom Blockchain
(User/Batch    (Transaction
   Data)         Records)
```

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Regulatory Authority** | Full system access, user management, compliance monitoring |
| **Manufacturer** | Create medicine batches, initiate blockchain |
| **Distributor** | Receive and transfer medicine batches |
| **Wholesaler** | Receive and forward medicine batches |
| **Shopkeeper** | Receive medicines, mark as sold |
| **Consumer** | Verify medicine authenticity via Batch ID or QR Code |

---

## ⛓️ How The Blockchain Works

Each medicine batch gets its own blockchain where every transaction is stored as a block:

```
Block Structure:
{
  "block_index"     : 1,
  "timestamp"       : "2025-01-01 10:00:00",
  "transaction_data": { batch_id, action, actor, location },
  "previous_hash"   : "abc123...",
  "hash"            : "def456...",
  "digital_signature": "hmac_signature"
}
```

- **SHA-256** generates a unique hash for every block
- **HMAC** digital signatures verify data integrity
- Any tampering breaks the hash chain and is immediately detected

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm
- PostgreSQL

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Fizza-Mukhtar/PharmaSentinel.git
cd PharmaSentinel
```

**2. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

**3. Configure Database**

Create a `.env` file in the backend folder:
```env
DATABASE_NAME=pharmasentinel
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your_django_secret_key
```

**4. Run Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

**5. Start Backend Server**
```bash
python manage.py runserver
```

**6. Frontend Setup**
```bash
cd frontend
npm install
npm start
```

The app will be running at `http://localhost:3000`

---

## 📁 Project Structure

```
PharmaSentinel/
├── backend/
│   ├── authentication/       # JWT auth & user roles
│   ├── blockchain/           # Custom blockchain logic
│   ├── medicines/            # Medicine batch management
│   ├── supply_chain/         # Transfer & tracking APIs
│   ├── dashboard/            # Regulatory admin panel
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Role-based pages
│   │   └── App.js
│   └── package.json
└── README.md
```

---

## 🔒 Security Features

- All passwords are hashed using Django's built-in security
- JWT tokens expire automatically for session safety
- Blockchain hash chaining detects any data tampering
- HMAC signatures verify block integrity
- Role-based access ensures users can only perform authorized actions

---

## 📸 Screenshots

> <img width="1361" height="636" alt="1" src="https://github.com/user-attachments/assets/153438e7-de0a-4591-b6db-2f092ae6af81" />
> <img width="1365" height="637" alt="5 drap" src="https://github.com/user-attachments/assets/86ebf386-ad5e-4224-ab6a-228cdcf7f7be" />



---

## 🎯 Future Enhancements

- [ ] Integration with public blockchain (Ethereum)
- [ ] AI-based anomaly detection in supply chain
- [ ] SMS/Email alerts for suspicious activity
- [ ] Multi-language support

---

## 👩‍💻 Author

**Fizza Mukhtar**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fizza-mukhtar-018759258)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/Fizza-Mukhtar)

---

## 📄 License

This project is for academic purposes.

---

> *"Ensuring every medicine that reaches a patient is genuine — because health cannot be compromised."*
