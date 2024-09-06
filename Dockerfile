# 使用官方的 Node.js 镜像作为构建阶段
FROM node:16 AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建项目（生产模式）
RUN npm run build

# 使用 nginx 镜像来提供生产环境的静态文件服务
FROM nginx:alpine

# 复制构建好的文件到 nginx 的静态资源目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制自定义的 nginx 配置（可选）
#COPY ./nginx.conf /etc/nginx/nginx.conf

# 暴露端口 80
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
