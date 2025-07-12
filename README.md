
## Công nghệ sử dụng
[![My Skills](https://skillicons.dev/icons?i=react,javascript,nodejs,mongodb,express,tailwindcss)](https://skillicons.dev)

![Maintainer](https://img.shields.io/badge/React-Update-blue) 

![Maintainer](https://img.shields.io/badge/Node.js-Update-green) 

![Maintainer](https://img.shields.io/badge/MongoDB-Update-green) 

![Maintainer](https://img.shields.io/badge/Socket.IO-Update-orange)



## Giới thiệu

`Chat Application` là một ứng dụng web chat thời gian thực được xây dựng bằng **MERN stack** (MongoDB, Express.js, React, Node.js) và **Socket.IO**. Dự án cho phép người dùng nhắn tin tức thời, quản lý hồ sơ, và theo dõi trạng thái online/offline. Ứng dụng được triển khai trên **Render** từ một repository duy nhất, sử dụng file `package.json` tổng để quản lý build và chạy cả backend và frontend.

## Các tính năng

- **Real-Time Messaging**: Sử dụng **Socket.IO** để gửi và nhận tin nhắn tức thời, đảm bảo không lặp tin nhắn.
- **User Status Updates**: Hỗ trợ cập nhật trạng thái `isOnline` và thông tin hồ sơ (`updateProfile`) theo thời gian thực.
- **Secure Authentication**: Xây dựng **RESTful APIs** với **Express.js** và **JWT** cho đăng ký, đăng nhập, và quản lý hồ sơ người dùng.
- **Scalable Database**: Tích hợp **MongoDB** với **Mongoose** để lưu trữ và quản lý dữ liệu người dùng và tin nhắn.
- **Image Uploads**: Sử dụng **Cloudinary** và **Multer** để tải lên và quản lý ảnh đại diện.
- **Unified Deployment**: Triển khai trên **Render** với một repository, tối ưu hóa quy trình build và start.
- **Code Quality**: Áp dụng **Prettier** và **Husky** để định dạng mã tự động, đảm bảo codebase nhất quán.

## Cài đặt

### Yêu cầu

- Node.js (Phiên bản 18.x hoặc cao hơn)
- MongoDB Atlas account
- Cloudinary account
- Render account

### Cài đặt Dự án

1. **Clone dự án:**

   ```bash
   git clone https://github.com/your-username/chat-app.git
   cd chat-app
2. **Cài đặt các phụ thuộc:**

   ```bash
   npm run install:all
   ```
###  Bổ sung env

## File .env [frontend]

```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
```

## File .env [backend]

```bash
PORT=3001
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/chat_app?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Chạy ứng dụng:**

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```
4. **Tổng quan về thư mục đồ án:**
```bash
Directory structure:
└── mentertho-realtime_chat/
    ├── package.json
    ├── backend/
    │   ├── package.json
    │   └── src/
    │       ├── server.js
    │       ├── config/         
    │       ├── controller/         
    │       ├── middleware/ 
    │       ├── model/      
    │       ├── routes/
    │       ├── services/
    │       └── test/
    └── frontend/
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.css
            ├── App.jsx
            ├── index.css
            ├── main.jsx
            ├── components/
            ├── constants/
            ├── context/
            ├── hooks/
            ├── lib/
            └── pages/

```
## 4. Screenshots
<p align="center"><img src="https://github.com/MenterTho/Realtime_chat/blob/master/frontend/public/screenshots/Home.png" alt="drawing"width="800"/></p>

<p align="center"> <img src="https://github.com/MenterTho/Realtime_chat/blob/master/frontend/public/screenshots/Profile.png" alt="drawing" width="800"/> </p>

<p align="center"> <img src="https://github.com/MenterTho/Realtime_chat/blob/master/frontend/public/screenshots/Info_profile.png" alt="drawing" width="800"/> </p>

<p align="center"> <img src="https://github.com/MenterTho/Realtime_chat/blob/master/frontend/public/screenshots/Chat.png" alt="drawing" width="800"/> </p>

## 5. Render demo 
https://realtime-chat-oo5w.onrender.com
