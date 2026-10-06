extends Area2D
class_name ComicMirror

signal rotated(angle_degrees: float)

@export var angle_degrees: float = 45.0

func _ready():
    rotation_degrees = angle_degrees

func rotate_mirror():
    angle_degrees = fmod(angle_degrees + 45.0, 360.0)
    rotation_degrees = angle_degrees
    emit_signal("rotated", angle_degrees)

func _input_event(viewport, event, shape_idx):
    if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
        rotate_mirror()
