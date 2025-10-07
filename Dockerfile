# 多阶段构建：第一阶段 - 构建应用
FROM node:24.6.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖，构建需要）
RUN npm ci --ignore-scripts

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段 - 生产环境镜像
FROM nginx:alpine

# 删除默认的 nginx 配置
RUN rm -rf /usr/share/nginx/html/*

# 从构建阶段复制构建好的文件到 nginx 的静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义的 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 8080 端口
EXPOSE 8080

# 创建非 root 用户和组，用于运行 nginx
# 1) 创建用户和组 'nginxuser'，不使用登录shell，并把主目录设置到 /var/cache/nginx
# 2) 确保 nginx 需要写入的目录归属该用户
RUN addgroup -S nginxgroup \
	&& adduser -S nginxuser -G nginxgroup -h /var/cache/nginx

# 为 nginx 的静态文件、缓存、日志和运行时目录设置权限
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx /run \
	# 确保 pid 文件存在并由非 root 用户拥有
	&& touch /run/nginx.pid \
	&& chown -R nginxuser:nginxgroup /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx /run /run/nginx.pid

# 切换到非 root 用户执行 nginx
USER nginxuser

# 启动 nginx（以非 root 用户运行）
CMD ["nginx", "-g", "daemon off;"]