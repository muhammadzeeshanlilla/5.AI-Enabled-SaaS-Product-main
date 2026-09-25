from django.db import models
from django.contrib.auth.models import User


class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    row_count = models.IntegerField(default=0)
    columns = models.JSONField(default=list)

    class Meta:
        ordering = ['-uploaded_at']


class DataRow(models.Model):
    uploaded_file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='rows')
    row_data = models.JSONField()
    row_index = models.IntegerField()

    class Meta:
        ordering = ['row_index']


class PredictionResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    uploaded_file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='predictions')
    prediction_type = models.CharField(max_length=50, default='trend_forecast')
    result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']