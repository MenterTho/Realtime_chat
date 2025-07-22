# Sử dụng image Node.js phiên bản 18 (hoặc phiên bản phù hợp)
FROM node:18-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Expose port backend (3001)
EXPOSE 3001

# Chạy ứng dụng ở chế độ production
CMD ["npm", "run", "start:prod"]