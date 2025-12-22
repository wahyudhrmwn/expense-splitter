# API Documentation

Dokumentasi lengkap untuk semua API endpoints dalam aplikasi Expense Splitter.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: [URL production]

## Authentication

Semua API endpoints (kecuali `/api/auth/*`) memerlukan autentikasi. Aplikasi menggunakan **NextAuth.js** dengan Google OAuth.

### Headers

Tidak perlu mengirim header khusus karena NextAuth menggunakan cookies untuk session management.

## API Endpoints

### Authentication

#### `GET /api/auth/signin`

Halaman sign in NextAuth.

#### `GET /api/auth/callback/google`

Callback URL untuk Google OAuth.

#### `POST /api/auth/signout`

Sign out user.

---

### Expense Groups

#### `GET /api/expense-groups`

Mendapatkan semua expense groups milik user yang sedang login.

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Trip ke Bali",
    "description": "Perjalanan liburan",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "people": [
      {
        "id": "uuid",
        "name": "Wahyu Dharmawan",
        "email": "wahyu@example.com"
      }
    ],
    "expenses": [
      {
        "id": "uuid",
        "title": "Makan siang",
        "totalAmount": 165000,
        "paidBy": "person-uuid",
        "includeTax": true,
        "taxPercentage": 11.0,
        "category": "",
        "date": "2024-01-15T12:00:00Z",
        "description": "",
        "items": [
          {
            "personId": "person-uuid",
            "itemName": "Nasi Goreng",
            "amount": 50000
          }
        ]
      }
    ]
  }
]
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

#### `POST /api/expense-groups`

Membuat expense group baru.

**Request Body:**

```json
{
  "title": "Trip ke Bali",
  "description": "Perjalanan liburan ke Bali bersama teman-teman",
  "people": [
    {
      "name": "Wahyu Dharmawan",
      "email": "wahyu@example.com"
    },
    {
      "name": "John Doe",
      "email": null
    }
  ]
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Trip ke Bali",
  "description": "Perjalanan liburan ke Bali bersama teman-teman",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "people": [
    {
      "id": "uuid",
      "name": "Wahyu Dharmawan",
      "email": "wahyu@example.com"
    }
  ],
  "expenses": []
}
```

**Status Codes:**

- `201` - Created
- `400` - Bad request (title required)
- `401` - Unauthorized
- `500` - Server error

---

#### `GET /api/expense-groups/[id]`

Mendapatkan detail expense group berdasarkan ID.

**Response:**

```json
{
  "id": "uuid",
  "title": "Trip ke Bali",
  "description": "Perjalanan liburan",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z",
  "people": [...],
  "expenses": [...]
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

#### `PUT /api/expense-groups/[id]`

Update expense group.

**Request Body:**

```json
{
  "title": "Trip ke Bali - Updated",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Trip ke Bali - Updated",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:00:00Z",
  "people": [...],
  "expenses": [...]
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

#### `DELETE /api/expense-groups/[id]`

Hapus expense group. Semua data terkait (people, expenses, items) akan terhapus secara cascade.

**Response:**

```json
{
  "message": "Expense group deleted successfully"
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

### People (Anggota Group)

#### `POST /api/expense-groups/[id]/people`

Menambahkan anggota baru ke dalam group.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "expenseGroupId": "group-uuid"
}
```

**Status Codes:**

- `201` - Created
- `400` - Bad request (name required)
- `401` - Unauthorized
- `404` - Group not found
- `500` - Server error

---

#### `PUT /api/expense-groups/[id]/people/[personId]`

Update data anggota.

**Request Body:**

```json
{
  "name": "Jane Doe Updated",
  "email": "jane.updated@example.com"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Jane Doe Updated",
  "email": "jane.updated@example.com",
  "expenseGroupId": "group-uuid"
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

#### `DELETE /api/expense-groups/[id]/people/[personId]`

Hapus anggota dari group. Semua expense items yang terkait akan terhapus secara cascade.

**Response:**

```json
{
  "message": "Person deleted successfully"
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

### Expenses (Pengeluaran)

#### `POST /api/expense-groups/[id]/expenses`

Menambahkan pengeluaran baru.

**Request Body:**

```json
{
  "title": "Makan siang",
  "totalAmount": 165000,
  "paidBy": "person-uuid",
  "includeTax": true,
  "taxPercentage": 11.0,
  "category": "",
  "date": "2024-01-15T12:00:00Z",
  "description": null,
  "items": [
    {
      "personId": "person-uuid-1",
      "itemName": "Nasi Goreng",
      "amount": 50000
    },
    {
      "personId": "person-uuid-2",
      "itemName": "Es Teh",
      "amount": 30000
    },
    {
      "personId": "person-uuid-1",
      "itemName": "Ayam Goreng",
      "amount": 70000
    }
  ]
}
```

**Catatan:**

- `totalAmount` = subtotal + pajak (jika `includeTax = true`)
- `items[].amount` = nominal item **TANPA pajak**
- Pajak akan dihitung secara proporsional per item

**Response:**

```json
{
  "id": "uuid",
  "title": "Makan siang",
  "totalAmount": 165000,
  "paidBy": "person-uuid",
  "includeTax": true,
  "taxPercentage": 11.0,
  "category": "",
  "date": "2024-01-15T12:00:00Z",
  "description": null,
  "expenseGroupId": "group-uuid",
  "items": [
    {
      "id": "uuid",
      "personId": "person-uuid-1",
      "itemName": "Nasi Goreng",
      "amount": 50000
    },
    {
      "id": "uuid",
      "personId": "person-uuid-2",
      "itemName": "Es Teh",
      "amount": 30000
    },
    {
      "id": "uuid",
      "personId": "person-uuid-1",
      "itemName": "Ayam Goreng",
      "amount": 70000
    }
  ]
}
```

**Status Codes:**

- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Group not found
- `500` - Server error

---

#### `PUT /api/expense-groups/[id]/expenses/[expenseId]`

Update pengeluaran.

**Request Body:**

```json
{
  "title": "Makan siang - Updated",
  "totalAmount": 180000,
  "paidBy": "person-uuid",
  "includeTax": true,
  "taxPercentage": 11.0,
  "category": "",
  "date": "2024-01-15T12:00:00Z",
  "description": null,
  "items": [...]
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Makan siang - Updated",
  "totalAmount": 180000,
  ...
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

#### `DELETE /api/expense-groups/[id]/expenses/[expenseId]`

Hapus pengeluaran. Semua items terkait akan terhapus secara cascade.

**Response:**

```json
{
  "message": "Expense deleted successfully"
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

## Error Responses

Semua error responses mengikuti format berikut:

```json
{
  "error": "Error message description"
}
```

### Status Codes

- `400` - Bad Request (validation error, missing required fields)
- `401` - Unauthorized (user not authenticated)
- `404` - Not Found (resource tidak ditemukan)
- `500` - Internal Server Error (server error)

## Notes

1. **User Isolation**: User hanya bisa mengakses expense groups miliknya sendiri. API akan otomatis filter berdasarkan `userId` dari session.

2. **Cascade Delete**:

   - Menghapus group akan menghapus semua people dan expenses
   - Menghapus person akan menghapus semua expense items yang terkait
   - Menghapus expense akan menghapus semua items

3. **Date Format**: Semua tanggal menggunakan format ISO 8601 (UTC): `YYYY-MM-DDTHH:mm:ssZ`

4. **Amount Precision**: Semua amount menggunakan tipe `Float`. Untuk currency, disarankan menggunakan 2 decimal places.

5. **Tax Calculation**:
   - Pajak dihitung dari subtotal (jumlah semua `items[].amount`)
   - Pajak dibagi secara proporsional per item saat menghitung saldo
   - `totalAmount` = subtotal + (subtotal × taxPercentage / 100)
