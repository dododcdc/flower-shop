#!/bin/bash

# 【花言花语】Docker部署脚本

set -e

echo "========================================="
echo "  🌺 【花言花语】Docker 部署工具"
echo "========================================="
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：未安装Docker，请先安装Docker"
    echo "   安装指南：https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误：未安装Docker Compose"
    echo "   安装指南：https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker环境检查通过"
echo ""

# 检查.env文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，设置数据库密码"
    echo "   vi .env"
    echo ""
    read -p "按Enter继续（请确保已修改密码）..."
fi

# 检查后端jar包
if [ ! -f flower_server/target/flower-shop-1.0.0.jar ]; then
    echo "📦 后端jar包不存在，开始编译..."
    cd flower_server
    mvn clean package -DskipTests
    cd ..
    echo "✅ 后端编译完成"
    echo ""
fi

echo "🚀 开始构建和启动服务..."
echo ""

# 构建并启动
docker-compose up -d --build

echo ""
echo "========================================="
echo "  ✅ 部署完成！"
echo "========================================="
echo ""
echo "📍 服务地址："
echo "   前端: http://localhost"
echo "   后端: http://localhost:8080/api"
echo "   健康检查: http://localhost:8080/api/actuator/health"
echo ""
echo "📊 查看状态："
echo "   docker-compose ps"
echo ""
echo "📋 查看日志："
echo "   docker-compose logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker-compose stop"
echo ""
echo "🗑️  删除服务："
echo "   docker-compose down"
echo ""
