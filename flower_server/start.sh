#!/bin/bash

# 【花言花语】鲜花售卖系统启动脚本

echo "🌺 【花言花语】后端服务启动中..."

# 检查Java版本
java_version=$(java -version 2>&1 | grep "version" | awk '{print $3}' | tr -d '"' | cut -d'.' -f1)
if [ "$java_version" -lt 21 ]; then
    echo "❌ 需要Java 21或更高版本，当前版本: $(java -version 2>&1 | head -1)"
    exit 1
fi

# 检查Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ 未找到Maven，请先安装Maven 3.9+"
    exit 1
fi

echo "✅ Java版本: $(java -version 2>&1 | head -1)"
echo "✅ Maven版本: $(mvn -version | head -1)"

# 检查数据库连接
echo "🔍 检查数据库连接..."
if mysql -u root -e "USE flower_shop;" 2>/dev/null; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败，请检查MySQL服务是否启动，数据库flower_shop是否创建"
    exit 1
fi

# 安装依赖
echo "📦 安装Maven依赖..."
mvn clean compile

# 启动应用
echo "🚀 启动Spring Boot后端服务..."
echo "📱 后端服务地址: http://localhost:8080/api"
echo "🔍 健康检查: http://localhost:8080/api/test/health"
echo "📊 数据库测试: http://localhost:8080/api/test/db"
echo "ℹ️  系统信息: http://localhost:8080/api/test/info"
echo ""
echo "按 Ctrl+C 停止服务"
echo "----------------------------------------"

mvn spring-boot:run