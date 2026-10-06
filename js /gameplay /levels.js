/**
 * The Last Light - Levels & World Definitions
 * Defines the 4 Comic Areas: The Dark Street, The Broken Theatre, The Shadow District, and The Final Page
 */

const LEVELS = [
    // ==========================================
    // AREA 1: THE DARK STREET (TUTORIAL & DISSONANCE)
    // ==========================================
    {
        id: 1,
        title: "Page 1: The Dark Street",
        chapter: "Chapter I: Shadows on Cobblestone",
        ambientTheme: 1,
        playerStart: { x: 90, y: 320 },
        exitTrigger: { x: 890, y: 310, w: 50, h: 80, nextArea: 2 },
        narrationStart: "PANEL 1: The city fell silent three nights ago. Lumi, a solitary spark, awakens in the cold dark.",

        panels: [
            { id: 1, title: "Panel 1 • The Alley", x: 20, y: 40, w: 280, h: 560 },
            { id: 2, title: "Panel 2 • Watchman's Post", x: 310, y: 40, w: 320, h: 560 },
            { id: 3, title: "Panel 3 • The Plaza Gate", x: 640, y: 40, w: 300, h: 560 }
        ],

        walls: [
            // Outer borders
            { x: 10, y: 30, w: 940, h: 10 },
            { x: 10, y: 600, w: 940, h: 10 },
            { x: 10, y: 30, w: 10, h: 580 },
            { x: 940, y: 30, w: 10, h: 250 },
            { x: 940, y: 390, w: 10, h: 220 },

            // Comic Gutter Dividers (with doorway cuts)
            { x: 300, y: 40, w: 10, h: 220 },
            { x: 300, y: 400, w: 10, h: 200 },
            { x: 630, y: 40, w: 10, h: 220 },
            { x: 630, y: 400, w: 10, h: 200 },

            // Street obstacles / crates
            { x: 140, y: 160, w: 50, h: 50 },
            { x: 480, y: 440, w: 60, h: 40 }
        ],

        lamps: [
            { x: 180, y: 320, id: 'lamp_1' },
            { x: 450, y: 220, id: 'lamp_2' },
            { x: 780, y: 320, id: 'lamp_3' }
        ],

        mirrors: [],
        emitters: [],
        receptors: [],
        shadows: [],

        npcs: [
            {
                x: 390, y: 340,
                name: "Mr. Higgins",
                role: "The Watchman",
                dialogue: {
                    lines: [
                        { speaker: "MR. HIGGINS", text: "Brrr! Who turned off the sky? Oh, it's you, little fireball!" },
                        { speaker: "MR. HIGGINS", text: "Wait... didn't you already blow that transformer yesterday?" },
                        { speaker: "MR. HIGGINS", text: "...Wait, what did I just say? My head feels full of static.", isGlitch: true },
                        { speaker: "MR. HIGGINS", text: "Never mind. Kindle the three street lamps with [SPACE] so we can see the gate!" }
                    ]
                }
            }
        ],

        hiddenGlyphs: [
            {
                x: 770, y: 140,
                normalText: "CITY NOTICE: QUIET EVENING",
                secretText: "WAIT... THAT'S NOT WHAT HAPPENED. RUN."
            }
        ],

        isObjectiveComplete(state) {
            // All 3 lamps must be ignited
            return state.lamps.every(l => l.active);
        },

        objectiveDescription: "Kindle all 3 Street Lamps using [SPACE] Flare to unlock the Plaza Gate."
    },

    // ==========================================
    // AREA 2: THE BROKEN THEATRE (MIRROR PUZZLE & PROPHECY)
    // ==========================================
    {
        id: 2,
        title: "Page 2: The Broken Theatre",
        chapter: "Chapter II: Cast in Starlight",
        ambientTheme: 2,
        playerStart: { x: 80, y: 280 },
        exitTrigger: { x: 890, y: 280, w: 50, h: 90, nextArea: 3 },
        narrationStart: "PANEL 4: The Grand Royal Theatre. Props lie abandoned. A projector hums in the mezzanine.",

        panels: [
            { id: 4, title: "Panel 1 • The Foyer & Booth", x: 20, y: 40, w: 300, h: 560 },
            { id: 5, title: "Panel 2 • The Auditorium", x: 330, y: 40, w: 320, h: 560 },
            { id: 6, title: "Panel 3 • The Stage Curtain", x: 660, y: 40, w: 280, h: 560 }
        ],

        walls: [
            // Outlines
            { x: 10, y: 30, w: 940, h: 10 },
            { x: 10, y: 600, w: 940, h: 10 },
            { x: 10, y: 30, w: 10, h: 580 },
            { x: 940, y: 30, w: 10, h: 220 },
            { x: 940, y: 380, w: 10, h: 230 },

            // Gutters
            { x: 320, y: 40, w: 10, h: 200 },
            { x: 320, y: 380, w: 10, h: 220 },
            { x: 650, y: 40, w: 10, h: 200 },
            { x: 650, y: 380, w: 10, h: 220 },

            // Theatre seating rows
            { x: 380, y: 160, w: 180, h: 30 },
            { x: 380, y: 420, w: 180, h: 30 }
        ],

        lamps: [
            { x: 140, y: 150, id: 'theatre_lamp_1', initiallyActive: true },
            { x: 820, y: 460, id: 'theatre_lamp_2' }
        ],

        // Projector beam cast across the room
        emitters: [
            { x: 80, y: 150, angle: 0, length: 800, active: true } // Points east towards mirrors
        ],

        mirrors: [
            // Mirror 1 intercepts horizontal beam at (480, 150) and bounces down (45° or 135°)
            { x: 480, y: 150, angleDeg: 135 },
            // Mirror 2 at (480, 280) bounces beam right into stage receptor
            { x: 480, y: 280, angleDeg: 45 }
        ],

        receptors: [
            { x: 800, y: 280, id: 'stage_receptor', label: 'STAGE LIGHTS' }
        ],

        shadows: [],

        npcs: [
            {
                x: 230, y: 380,
                name: "Madame Clara",
                role: "Playwright",
                dialogue: {
                    lines: [
                        { speaker: "MADAME CLARA", text: "Quiet in the stalls! We were rehearsing Act III when the power evaporated!" },
                        { speaker: "MADAME CLARA", text: "Wait... the script! Look at page 40! It says: 'Lumi was born of fire, not hope.'" },
                        { speaker: "MADAME CLARA", text: "Who wrote this line?! I never wrote that line!", isGlitch: true },
                        { speaker: "MADAME CLARA", text: "Rotate the mirrors [CLICK or E] to redirect the projector beam into the Stage Sensor!" }
                    ]
                }
            }
        ],

        hiddenGlyphs: [
            {
                x: 800, y: 140,
                normalText: "MURAL: THE CITY GENERATOR",
                secretText: "ALERT: THE SPARK ESCAPED FROM REACTOR CORE."
            }
        ],

        isObjectiveComplete(state) {
            return state.receptors.some(r => r.id === 'stage_receptor' && r.activated);
        },

        objectiveDescription: "Rotate the mirrors [CLICK or E] to route the projector light into the Stage Receptor."
    },

    // ==========================================
    // AREA 3: THE SHADOW DISTRICT (MANAGEMENT & THE HUMAN TRUTH)
    // ==========================================
    {
        id: 3,
        title: "Page 3: The Shadow District",
        chapter: "Chapter III: The Phantoms in Negative",
        ambientTheme: 3,
        playerStart: { x: 70, y: 310 },
        exitTrigger: { x: 890, y: 310, w: 50, h: 80, nextArea: 4 },
        narrationStart: "PANEL 7: Dark mist clings to the lower alleys. Strange figures wander blindly in the haze.",

        panels: [
            { id: 7, title: "Panel 1 • The Dark Underpass", x: 20, y: 40, w: 290, h: 560 },
            { id: 8, title: "Panel 2 • The Maze of Shadows", x: 320, y: 40, w: 330, h: 560 },
            { id: 9, title: "Panel 3 • The Substation Breach", x: 660, y: 40, w: 280, h: 560 }
        ],

        walls: [
            // Perimeter
            { x: 10, y: 30, w: 940, h: 10 },
            { x: 10, y: 600, w: 940, h: 10 },
            { x: 10, y: 30, w: 10, h: 580 },
            { x: 940, y: 30, w: 10, h: 250 },
            { x: 940, y: 390, w: 10, h: 220 },

            // Gutters
            { x: 310, y: 40, w: 10, h: 220 },
            { x: 310, y: 390, w: 10, h: 210 },
            { x: 650, y: 40, w: 10, h: 220 },
            { x: 650, y: 390, w: 10, h: 210 },

            // Alleyway chicanes
            { x: 420, y: 180, w: 20, h: 180 },
            { x: 530, y: 280, w: 20, h: 200 }
        ],

        lamps: [
            { x: 200, y: 180, id: 'shadow_lamp_1' },
            { x: 480, y: 120, id: 'shadow_lamp_2' },
            { x: 800, y: 440, id: 'shadow_lamp_3' }
        ],

        emitters: [],
        mirrors: [],
        receptors: [],

        shadows: [
            {
                x: 380, y: 310,
                patrolPoints: [{ x: 380, y: 120 }, { x: 380, y: 480 }],
                dialogue: [
                    { speaker: "SHADOW SOUL", text: "The flash... my eyes burned. We were just ordinary people." },
                    { speaker: "SHADOW SOUL", text: "Why are you shining that at us again, little spark?" }
                ]
            },
            {
                x: 580, y: 220,
                patrolPoints: [{ x: 580, y: 120 }, { x: 580, y: 420 }],
                dialogue: [
                    { speaker: "SHADOW SOUL", text: "You don't remember, do you? The explosion didn't destroy you..." },
                    { speaker: "SHADOW SOUL", text: "...It CREATED you. You're the surge itself!" }
                ]
            }
        ],

        npcs: [
            {
                x: 180, y: 450,
                name: "Survivor",
                role: "Trapped Citizen",
                dialogue: {
                    lines: [
                        { speaker: "SURVIVOR", text: "Use your flare [SPACE] to freeze the shadows! But look closely at them..." },
                        { speaker: "SURVIVOR", text: "They have silhouettes of human hands shielding their faces. What really happened here?!" }
                    ]
                }
            }
        ],

        hiddenGlyphs: [
            {
                x: 780, y: 160,
                normalText: "CITY WARNING: BEWARE THE MONSTERS",
                secretText: "FACT: THEY ARE NOT MONSTERS. THEY ARE VICTIMS."
            }
        ],

        isObjectiveComplete(state) {
            // Need to ignite the 3 lamps to disperse the shadow fog
            return state.lamps.every(l => l.active);
        },

        objectiveDescription: "Freeze the shadows with [SPACE], kindle all 3 sanctuary lamps, and reach the Substation."
    },

    // ==========================================
    // AREA 4: THE FINAL PAGE (THE REVELATION & THE CHOICE)
    // ==========================================
    {
        id: 4,
        title: "Page 4: The Final Page",
        chapter: "Chapter IV: The Unwritten Epilogue",
        ambientTheme: 4,
        playerStart: { x: 120, y: 320 },
        exitTrigger: null, // End of the game
        narrationStart: "PANEL 10: The Central Generator. The panels are bending. The ink cannot hold the story anymore.",

        panels: [
            { id: 10, title: "Panel 1 • The Memory Core", x: 20, y: 40, w: 290, h: 560 },
            { id: 11, title: "Panel 2 • The Broken Reactor", x: 320, y: 40, w: 320, h: 560 },
            { id: 12, title: "Panel 3 • The Final Choice", x: 650, y: 40, w: 290, h: 560 }
        ],

        walls: [
            // Outer borders
            { x: 10, y: 30, w: 940, h: 10 },
            { x: 10, y: 600, w: 940, h: 10 },
            { x: 10, y: 30, w: 10, h: 580 },
            { x: 940, y: 30, w: 10, h: 580 },

            // Fractured Comic Gutters
            { x: 310, y: 40, w: 10, h: 220 },
            { x: 310, y: 400, w: 10, h: 200 },
            { x: 640, y: 40, w: 10, h: 220 },
            { x: 640, y: 400, w: 10, h: 200 },

            // Central core housing
            { x: 440, y: 240, w: 80, h: 80 }
        ],

        lamps: [
            { x: 160, y: 160, id: 'core_lamp_1', initiallyActive: true }
        ],

        emitters: [
            { x: 160, y: 160, angle: 0, length: 900, active: true } // Beams into mirror maze
        ],

        mirrors: [
            { x: 480, y: 160, angleDeg: 135 }, // deflect down
            { x: 480, y: 480, angleDeg: 45 },  // deflect right
            { x: 790, y: 480, angleDeg: 315 }  // deflect up to Master Core Receptor
        ],

        receptors: [
            { x: 790, y: 220, id: 'master_core_receptor', label: 'SINGULARITY CORE' }
        ],

        shadows: [],

        npcs: [
            {
                x: 480, y: 360,
                name: "THE ARCHIVIST",
                role: "The Final Comic Voice",
                dialogue: {
                    lines: [
                        { speaker: "THE ARCHIVIST", text: "Look around you, Lumi. Look at the comic panels." },
                        { speaker: "THE ARCHIVIST", text: "The gutters are cracked. You didn't come to fix the blackout.", isGlitch: true },
                        { speaker: "THE ARCHIVIST", text: "You WERE the blackout. A catastrophic overload that took sentient form." },
                        { speaker: "THE ARCHIVIST", text: "Connect the final circuit beam [CLICK/E on mirrors] to decide how the last panel ends." }
                    ]
                }
            }
        ],

        hiddenGlyphs: [
            {
                x: 790, y: 120,
                normalText: "CITY SYSTEM: REBOOT PENDING",
                secretText: "THE FINAL TWIST: LUMI WAS THE SOURCE OF THE DARKNESS ALL ALONG."
            }
        ],

        isObjectiveComplete(state) {
            return state.receptors.some(r => r.id === 'master_core_receptor' && r.activated);
        },

        objectiveDescription: "Route the light beam to the Singularity Core to trigger the Comic Climax & Endings."
    }
];

window.LEVELS = LEVELS;
