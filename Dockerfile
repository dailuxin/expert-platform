FROM node:18-slim

# 安装 sql.js WASM 所需依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制依赖文件并安装
COPY package.json package-lock.json* ./
RUN npm install --production

# 复制应用代码
COPY . .

# 数据持久化目录
RUN mkdir -p /app/data
ENV DATA_DIR=/app/data

# 端口
EXPOSE 3000

# 启动
CMD ["node", "app.js"]
