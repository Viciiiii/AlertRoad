from ultralytics import YOLO
model = YOLO("ml_model/alertroad_yolov8_best.pt")
print(model.names)