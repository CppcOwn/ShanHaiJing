from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from src.config.config import TENCENT_CLOUD_CONFIG
import os
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)

class COSUtils:
    def __init__(self):
        self.config = CosConfig(
            Region=TENCENT_CLOUD_CONFIG['cos_region'],
            SecretId=TENCENT_CLOUD_CONFIG['secret_id'],
            SecretKey=TENCENT_CLOUD_CONFIG['secret_key']
        )
        self.client = CosS3Client(self.config)
        self.bucket = TENCENT_CLOUD_CONFIG['cos_bucket']
    
    def upload_file(self, local_file_path, cos_file_path):
        """
        上传文件到 COS
        :param local_file_path: 本地文件路径
        :param cos_file_path: COS 文件路径
        :return: 上传结果
        """
        try:
            response = self.client.put_object_from_local_file(
                Bucket=self.bucket,
                LocalFilePath=local_file_path,
                Key=cos_file_path
            )
            logging.info(f"文件上传成功: {cos_file_path}")
            return response
        except Exception as e:
            logging.error(f"文件上传失败: {e}")
            return None
    
    def download_file(self, cos_file_path, local_file_path):
        """
        从 COS 下载文件
        :param cos_file_path: COS 文件路径
        :param local_file_path: 本地文件路径
        :return: 下载结果
        """
        try:
            response = self.client.get_object(
                Bucket=self.bucket,
                Key=cos_file_path
            )
            # 确保本地目录存在
            os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
            # 写入文件
            with open(local_file_path, 'wb') as f:
                f.write(response['Body'].read())
            logging.info(f"文件下载成功: {cos_file_path}")
            return response
        except Exception as e:
            logging.error(f"文件下载失败: {e}")
            return None
    
    def list_files(self, prefix):
        """
        列出 COS 目录下的文件
        :param prefix: 目录前缀
        :return: 文件列表
        """
        try:
            response = self.client.list_objects(
                Bucket=self.bucket,
                Prefix=prefix
            )
            files = []
            if 'Contents' in response:
                files = [item['Key'] for item in response['Contents']]
            logging.info(f"列出目录 {prefix} 下的文件成功")
            return files
        except Exception as e:
            logging.error(f"列出文件失败: {e}")
            return []
    
    def delete_file(self, cos_file_path):
        """
        删除 COS 上的文件
        :param cos_file_path: COS 文件路径
        :return: 删除结果
        """
        try:
            response = self.client.delete_object(
                Bucket=self.bucket,
                Key=cos_file_path
            )
            logging.info(f"文件删除成功: {cos_file_path}")
            return response
        except Exception as e:
            logging.error(f"文件删除失败: {e}")
            return None
