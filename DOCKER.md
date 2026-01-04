# 🐳 Docker 部署指南

本文档说明如何使用Docker和Docker Compose部署【花言花语】鲜花售卖系统。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少2GB可用内存
- 至少5GB可用磁盘空间

## 🚀 快速开始

### 1. 环境准备

确保已安装Docker和Docker Compose：
```bash
docker --version
docker-compose --version
```

### 2. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，修改数据库密码：
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_USER=flower_user
MYSQL_PASSWORD=your_secure_password
```

### 3. 构建并启动服务

```bash
# 构建镜像并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- **前端**: http://localhost:80
- **后端API**: http://localhost:8080/api
- **健康检查**: http://localhost:8080/actuator/health

## 📦 服务说明

### 服务架构

```
┌─────────────────────────────────────────┐
│         Docker Compose 编排              │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────┐  │
│  │ 前端Nginx │  │ 后端容器  │  │ MySQL│  │
│  │  :80     │  │  :8080   │  │ :3306│  │
│  └──────────┘  └──────────┘  └──────┘  │
│       ↓             ↓             ↑     │
│    静态文件      REST API      数据库   │
└─────────────────────────────────────────┘
```

### 包含的服务

1. **mysql** - MySQL 8.0 数据库
   - 端口：3306
   - 数据卷持久化
   - 自动初始化数据库

2. **backend** - Spring Boot 后端
   - 端口：8080
   - 基于 OpenJDK 21
   - 健康检查启用

3. **frontend** - Nginx 前端
   - 端口：80
   - React 应用静态文件
   - API 反向代理

## 🔧 常用命令

### 启动和停止

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 停止所有服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、卷（会删除数据！）
docker-compose down -v
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入MySQL容器
docker-compose exec mysql bash

# 连接MySQL数据库
docker-compose exec mysql mysql -uroot -p
```

### 重新构建

```bash
# 重新构建并启动
docker-compose up -d --build

# 重新构建特定服务
docker-compose up -d --build backend
```

## 📊 数据持久化

MySQL数据存储在Docker卷中：
```bash
# 查看卷
docker volume ls

# 备份数据库
docker-compose exec mysql mysqldump -uroot -p flower_shop > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -uroot -p flower_shop < backup.sql
```

## 🔍 故障排查

### 服务无法启动

1. **检查端口占用**：
```bash
lsof -i :80
lsof -i :8080
lsof -i :3306
```

2. **查看日志**：
```bash
docker-compose logs backend
docker-compose logs mysql
```

3. **检查健康状态**：
```bash
docker-compose ps
```

### 数据库连接失败

1. 确认MySQL已启动：
```bash
docker-compose logs mysql
```

2. 检查环境变量：
```bash
docker-compose exec backend env | grep MYSQL
```

3. 测试数据库连接：
```bash
docker-compose exec backend wget -O- http://mysql:3306
```

### 前端无法访问后端

1. 检查Nginx配置：
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

2. 测试后端连接：
```bash
docker-compose exec frontend wget -O- http://backend:8080/actuator/health
```

## 🔒 安全建议

### 生产环境部署

1. **修改默认密码**：
   - 修改 `.env` 中的所有密码
   - 使用强密码生成器

2. **限制端口暴露**：
   - 移除不必要的端口映射
   - 只在内网暴露MySQL

3. **启用HTTPS**：
   - 配置SSL证书
   - 使用Cloudflare Tunnel或Nginx反向代理

4. **定期备份**：
   - 设置自动备份脚本
   - 备份到远程存储

### 环境变量保护

```bash
# .env 文件已加入 .gitignore
# 不要提交到版本控制
git add .env.example
git commit -m "Add Docker deployment files"
```

## 🚀 生产环境优化

### 资源限制

编辑 `docker-compose.yml`，添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M

  mysql:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 自动重启

服务已配置自动重启：
```yaml
restart: unless-stopped
```

## 📝 更多信息

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Spring Boot Docker 指南](https://spring.io/guides/topicals/spring-boot-docker/)
