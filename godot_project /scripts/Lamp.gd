extends Area2D
class_name Lamp

signal ignited(lamp_id: String)

@export var lamp_id: String = "lamp"
@export var is_active: bool = false
@onready var light: PointLight2D = $PointLight2D

func _ready():
    update_visuals()

func ignite():
    if not is_active:
        is_active = true
        update_visuals()
        emit_signal("ignited", lamp_id)

func update_visuals():
    if light:
        light.enabled = is_active
