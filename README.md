Playable Game URL:
https://coders-16.github.io/GLITCH-havkathon/
GitHub Repository:
https://github.com/coders-16/GLITCH-havkathon/
# THE LAST LIGHT ⚡

> *"A comic you can play, light you can manipulate, and a story you can't trust."*

**Submitted to:** 100-Hour Indie Connect Game Jam  
**Themes:** **Comic**, **Twist**, **Light**  
**Repository:** [github.com/coders-16/the-last-light](https://github.com/coders-16/the-last-light)  
**Playable Itch.io Build:** [coders-16.itch.io/the-last-light](https://coders-16.itch.io/the-last-light)  

---
## 💡 How The Three Themes Are Implemented

### 1. Theme: COMIC 📖
- **The World is a Graphic Novel:** Every level is structured as a physical multi-panel comic book page with gutter margins, panel numbers, and narrative caption boxes.
- **Dynamic Onomatopoeia:** Bold visual sound-effect bursts (`POW!`, `WHOOSH!`, `CLICK!`, `BZZZZT!`, `FROZEN!`) pop out with stylized jagged starbursts and 3D extrusion lettering.
- **Halftone & Ink Aesthetics:** Shading is rendered using vintage Ben-Day / halftone dot matrix patterns, dip-pen outlines, and typewriter dialogue bubbles with speaker tails.
- **Breaking the 4th Wall:** Characters comment on page numbers and panel borders. In the climax, the panels themselves crack and peel back.

### 2. Theme: LIGHT 💡
- **Living Spark of Light:** You play as **Lumi**, emitting a real-time radial light aura that banishes ambient darkness.
- **Light as Resource & Key:** 
  - **Streetlamps / Beacons:** Restoring persistent light across darkened city avenues.
  - **Prisms & Mirrors:** Directing optical laser beams across auditorium rows to trigger solar receptors and burn away dark barriers.
  - **Subduing Shadows:** Using focused **Light Flares** (`[SPACE]`) to freeze shadow creatures into crystalline statues.
  - **Invisible Ink:** Uncovering phosphorescent memories and secret text that only reveal under Lumi's glow.

### 3. Theme: TWIST 🔄
- **Narrative Subversion:** The game sets up a classic hero's quest: Lumi is restoring a city hit by an unexpected blackout.
- **Environmental Clues:**
  - Billboards initially state *"NOTHING HAPPENED HERE"*, but shining light on them glitches the ink into *"WAIT... THAT'S NOT WHAT HAPPENED. RUN."*
  - NPCs like Mr. Higgins mutter lines about events that haven't happened yet.
  - The "Shadow Monsters" are revealed to be citizens blinded by the catastrophic overload, shielding their eyes in horror.
- **The Grand Climax:** In *The Final Page*, the truth emerges: Lumi was NOT created to fix the blackout. **Lumi WAS the catastrophic power surge itself**! 
- **Dual Endings:** Players choose between **The True Dawn** (dispersing the overload to let the natural morning sun return) and **The Living Arc** (ascending as the comic's neon guardian superhero).

---

## 🎮 Areas & Gameplay Progression

1. **Area 1: The Dark Street** (Tutorial & Cognitive Dissonance)  
   - Learn movement, passive illumination, and light flares.  
   - Task: Kindle the 3 street lamps to unlock the Plaza Gate.  
   - Encounter Mr. Higgins and witness the first glitched billboard.
2. **Area 2: The Broken Theatre** (Optics & Rewritten Scripts)  
   - Mirror reflection mechanics.  
   - Rotate mirrors to route the projector spotlight into the stage receptor.  
   - Madame Clara reveals that the script is rewriting itself in real time.
3. **Area 3: The Shadow District** (Light Management & The Citizens)  
   - Patrolling shadow creatures that must be frozen with light flares.  
   - Listen to the shadow souls to uncover the tragedy of the Great Flash.
4. **Area 4: The Final Page** (The Revelation & Climax)  
   - Fractured comic panels, central power grid array.  
   - Align the final circuit and make the ultimate choice between two distinct endings.

---

## 🕹️ Controls

| Action | Key / Input |
| :--- | :--- |
| **Move Lumi** | `W`, `A`, `S`, `D` or `Arrow Keys` |
| **Light Flare** | `SPACE` (expands aura, kindles lamps, freezes shadows) |
| **Interact / Rotate Mirror** | `E` or `Left Mouse Click` |
| **Advance Dialogue** | `SPACE`, `E`, or `Left Click` |
| **Audio Toggle** | `🔊 MUTE` Button (top header) |
| **Restart Level** | `↺ RESTART` Button |

---

## 🚀 Running the Game Locally

### Option 1: Python Launcher (Instant 1-Click)
Run the included python script to start the local web server and launch your default browser:
```bash
python run_game.py
```
Or:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080/index.html` in your web browser.

### Option 2: Deploying to Itch.io (HTML5)
1. Zip the repository contents (`index.html`, `css/`, `js/`).
2. Upload the `.zip` file to your itch.io project dashboard.
3. Set **Kind of project** to **HTML** and check **This file will be played in the browser**.
4. Set viewport dimensions to `960 x 640` (default game canvas resolution).

---

## 📜 License
This project is open source and licensed under the [MIT License](LICENSE).
See [CREDITS.md](CREDITS.md) for full asset and technology attribution.
