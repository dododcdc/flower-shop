# 多阶段构建：使用Maven构建后使用JRE运行
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# 复制pom.xml并下载依赖（利用Docker缓存）
COPY flower_server/pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码
COPY flower_server/ ./

# 打包应用
RUN mvn clean package spring-boot:repackage -DskipTests -B

# 运行阶段：使用更小的JRE镜像
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 从构建阶段复制jar包
COPY --from=builder /app/target/flower-shop-1.0.0.jar app.jar

# 创建非root用户（安全最佳实践）
RUN addgroup -S spring && adduser -S spring -G spring

# 创建uploads目录并设置权限
RUN mkdir -p /app/uploads && \
    chown -R spring:spring /app

USER spring:spring

# 暴露端口
EXPOSE 8080

# JVM参数优化
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
