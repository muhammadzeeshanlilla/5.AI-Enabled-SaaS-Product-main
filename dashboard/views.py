import pandas as pd
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import UploadedFile, DataRow, PredictionResult
from .serializers import UploadedFileSerializer
from .ai_service import run_prediction


class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)

        # Read CSV or Excel
        try:
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
        except Exception as e:
            return Response({'error': f'Could not read file: {str(e)}'}, status=400)

        # Save file record
        uploaded = UploadedFile.objects.create(
            user=request.user,
            file_name=file.name,
            row_count=len(df),
            columns=list(df.columns),
        )

        # Save each row
        rows = []
        for i, row in df.iterrows():
            rows.append(DataRow(
                uploaded_file=uploaded,
                row_data=row.to_dict(),
                row_index=i,
            ))
        DataRow.objects.bulk_create(rows)

        return Response({
            'id': uploaded.id,
            'file_name': uploaded.file_name,
            'row_count': uploaded.row_count,
            'columns': uploaded.columns,
        }, status=201)


class FileListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UploadedFileSerializer

    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)


class FileDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        try:
            uploaded = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=404)

        rows = list(uploaded.rows.values_list('row_data', flat=True))
        return Response({
            'file_name': uploaded.file_name,
            'columns': uploaded.columns,
            'rows': rows,
        })


class PredictionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, file_id):
        try:
            uploaded = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=404)

        rows = list(uploaded.rows.values_list('row_data', flat=True))
        result = run_prediction(rows, uploaded.columns)

        prediction = PredictionResult.objects.create(
            user=request.user,
            uploaded_file=uploaded,
            result=result,
        )

        return Response(result, status=200) 