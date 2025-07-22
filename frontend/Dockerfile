# Build stage
FROM node:18-alpine AS builder

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

# Production stage
FROM nginx:alpine

# Sao chép file tĩnh từ build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Sao chép cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port frontend (80)
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]