extends Node2D
class_name ComicManager

# Master manager for Comic narrative, twist reveals, and page progression
@export var current_page: int = 1

func _ready():
    print("The Last Light initialized. Themes: Comic, Twist, Light.")

func trigger_twist_glitch():
    print("TWIST TRIGGERED: Reality peeling back!")
