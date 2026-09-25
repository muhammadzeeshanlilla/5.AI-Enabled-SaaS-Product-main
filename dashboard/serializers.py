from rest_framework import serializers
from .models import UploadedFile, PredictionResult


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'file_name', 'row_count', 'columns', 'uploaded_at']


class PredictionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionResult
        fields = ['id', 'prediction_type', 'result', 'created_at']