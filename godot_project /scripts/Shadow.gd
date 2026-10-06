extends CharacterBody2D
class_name ShadowCreature

@export var patrol_distance: float = 120.0
@export var speed: float = 40.0
var is_frozen: bool = false
var freeze_timer: float = 0.0
var direction: float = 1.0
var start_x: float = 0.0

func _ready():
    start_x = position.x

func _physics_process(delta: float):
    if is_frozen:
        freeze_timer -= delta
        if freeze_timer <= 0:
            is_frozen = false
        return

    position.x += direction * speed * delta
    if abs(position.x - start_x) > patrol_distance:
        direction *= -1.0

func freeze(duration: float = 3.5):
    is_frozen = true
    freeze_timer = duration
