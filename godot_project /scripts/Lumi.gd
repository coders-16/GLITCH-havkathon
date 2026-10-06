extends CharacterBody2D
class_name Lumi

signal flare_triggered(pos: Vector2)
signal energy_changed(current: float, max_val: float)

@export var speed: float = 210.0
@export var max_energy: float = 100.0
var energy: float = 100.0
var is_flaring: bool = false
var flare_timer: float = 0.0

@onready var light: PointLight2D = $PointLight2D
@onready var sprite: Sprite2D = $Sprite2D

func _ready():
    energy = max_energy

func _physics_process(delta: float):
    # Flare timer
    if is_flaring:
        flare_timer -= delta
        if flare_timer <= 0:
            is_flaring = false
            if light:
                light.texture_scale = 1.0
    else:
        if energy < max_energy:
            energy = min(max_energy, energy + delta * 10.0)
            emit_signal("energy_changed", energy, max_energy)

    # Input movement
    var input_vector = Vector2.ZERO
    input_vector.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
    input_vector.y = Input.get_action_strength("ui_down") - Input.get_action_strength("ui_up")
    input_vector = input_vector.normalized()

    velocity = input_vector * speed
    move_and_slide()

    # Flare trigger
    if Input.is_action_just_pressed("ui_select") or Input.is_action_just_pressed("flare"):
        trigger_flare()

func trigger_flare():
    if energy >= 25.0 and not is_flaring:
        energy -= 25.0
        is_flaring = true
        flare_timer = 1.2
        if light:
            light.texture_scale = 2.0
        emit_signal("flare_triggered", global_position)
        emit_signal("energy_changed", energy, max_energy)
