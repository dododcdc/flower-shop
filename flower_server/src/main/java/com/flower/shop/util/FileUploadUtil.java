package com.flower.shop.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件上传工具类
 */
@Slf4j
public class FileUploadUtil {

    // 允许的图片类型
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp");

    // 最大文件大小（5MB）
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * 上传单个文件
     *
     * @param file       上传的文件
     * @param uploadPath 上传目录
     * @return 文件访问路径
     */
    public static String uploadFile(MultipartFile file, String uploadPath) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过5MB");
        }

        // 获取原始文件名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("文件名不能为空");
        }

        // 验证文件类型
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("不支持的文件类型，仅支持: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // 生成新文件名（UUID + 扩展名）
        String newFileName = generateFileName(extension);

        // 按日期创建子目录（如：uploads/2025/11/23/）
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));

        // 确保使用绝对路径
        Path path = Paths.get(uploadPath);
        String absoluteUploadPath = path.isAbsolute() ? uploadPath : path.toAbsolutePath().toString();
        Path uploadDir = Paths.get(absoluteUploadPath, dateDir);

        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 保存文件
        Path filePath = uploadDir.resolve(newFileName);
        file.transferTo(filePath.toFile());

        // 返回Web可访问的相对路径（用于存储到数据库）
        String relativePath = "/uploads/" + dateDir + "/" + newFileName;
        log.info("文件上传成功，相对路径: {}, 绝对路径: {}", relativePath, filePath.toAbsolutePath());

        return relativePath;
    }

    /**
     * 批量上传文件
     *
     * @param files      上传的文件列表
     * @param uploadPath 上传目录
     * @return 文件访问路径列表
     */
    public static List<String> uploadFiles(List<MultipartFile> files, String uploadPath) throws IOException {
        List<String> filePaths = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return filePaths;
        }

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String filePath = uploadFile(file, uploadPath);
                filePaths.add(filePath);
            }
        }

        return filePaths;
    }

    /**
     * 删除文件
     *
     * @param filePath   文件路径（相对路径，如 /uploads/2025/11/23/xxx.jpg）
     * @param uploadPath 上传根目录
     * @return 是否删除成功
     */
    public static boolean deleteFile(String filePath, String uploadPath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }

        try {
            // 移除开头的 /uploads/
            String relativePath = filePath.replace("/uploads/", "");

            // 确保使用绝对路径
            Path path = Paths.get(uploadPath);
            String absoluteUploadPath = path.isAbsolute() ? uploadPath : path.toAbsolutePath().toString();
            Path fullPath = Paths.get(absoluteUploadPath, relativePath);

            log.info("尝试删除文件: {} (绝对路径: {})", filePath, fullPath);

            if (Files.exists(fullPath)) {
                Files.delete(fullPath);
                log.info("文件删除成功: {}", filePath);
                return true;
            } else {
                log.warn("文件不存在: {}", fullPath);
                return false;
            }
        } catch (IOException e) {
            log.error("文件删除失败: {}", filePath, e);
            return false;
        }
    }

    /**
     * 批量删除文件
     *
     * @param filePaths  文件路径列表
     * @param uploadPath 上传根目录
     */
    public static void deleteFiles(List<String> filePaths, String uploadPath) {
        if (filePaths == null || filePaths.isEmpty()) {
            return;
        }

        for (String filePath : filePaths) {
            deleteFile(filePath, uploadPath);
        }
    }

    /**
     * 获取文件扩展名
     */
    private static String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * 生成唯一文件名
     */
    private static String generateFileName(String extension) {
        return UUID.randomUUID().toString().replace("-", "") + "." + extension;
    }
}
