import { WorkoutDay, TechniqueDrill } from "./types";

export const WEEKLY_PLAN: WorkoutDay[] = [
  {
    id: "day-1",
    number: 1,
    name: "SHOULDERS",
    category: "V-TAPER PRIME",
    badge: "V-TAPER PRIME",
    badgeType: "fire",
    exercises: [
      { name: "Wall Handstand Push-ups", sets: "5 × MAX", setsCount: 5, repsText: "MAX", video_url: "https://example.com/video/wall_handstand_push_ups" },
      { name: "Pike Push-ups", sets: "5 × 15", setsCount: 5, repsText: "15", video_url: "https://example.com/video/pike_push_ups" },
      { name: "Wide Push-ups", sets: "4 × 20", setsCount: 4, repsText: "20", video_url: "https://example.com/video/wide_push_ups" },
      { name: "Archer Push-ups", sets: "4 × 8 ea", setsCount: 4, repsText: "8 ea", video_url: "https://example.com/video/archer_push_ups" },
      { name: "Decline Push-ups", sets: "4 × 15", setsCount: 4, repsText: "15", video_url: "https://example.com/video/decline_push_ups" },
      { name: "Shoulder Taps (plank)", sets: "4 × 20 ea", setsCount: 4, repsText: "20 ea", video_url: "https://example.com/video/shoulder_taps_plank" }
    ],
    core: [
      { name: "Dragon Flags", sets: "4 × 6", setsCount: 4, repsText: "6", video_url: "https://example.com/video/dragon_flags" }
    ],
    finisher: {
      label: "Finisher",
      text: "75 Pike Push-ups — for time",
      type: "time"
    }
  },
  {
    id: "day-2",
    number: 2,
    name: "POSTERIOR",
    category: "BACK SIMULATION",
    badge: "BACK SIM",
    badgeType: "blue",
    exercises: [
      { name: "Superman Hold", sets: "5 × 45s", setsCount: 5, repsText: "45s", video_url: "https://example.com/video/superman_hold" },
      { name: "Superman Pulses", sets: "4 × 25", setsCount: 4, repsText: "25", video_url: "https://example.com/video/superman_pulses" },
      { name: "Reverse Snow Angels", sets: "4 × 20", setsCount: 4, repsText: "20", video_url: "https://example.com/video/reverse_snow_angels" },
      { name: "Floor YTW (each pos)", sets: "4 × 12", setsCount: 4, repsText: "12", video_url: "https://example.com/video/floor_ytw_each_pos" },
      { name: "Back Extensions", sets: "4 × 20", setsCount: 4, repsText: "20", video_url: "https://example.com/video/back_extensions" },
      { name: "Prone Cobra Hold", sets: "3 × 40s", setsCount: 3, repsText: "40s", video_url: "https://example.com/video/prone_cobra_hold" }
    ],
    core: [
      { name: "Hollow Body Hold", sets: "4 × 35s", setsCount: 4, repsText: "35s", video_url: "https://example.com/video/hollow_body_hold" }
    ],
    finisher: {
      label: "Finisher",
      text: "5 min AMRAP — 30s Superman + 15 Back Extensions",
      type: "amrap",
      durationSeconds: 300
    }
  },
  {
    id: "day-3",
    number: 3,
    name: "LEGS",
    category: "EXPLOSIVE POWER",
    badge: "EXPLOSIVE",
    badgeType: "fire",
    exercises: [
      { name: "Pistol Squat Progression", sets: "5 × MAX ea", setsCount: 5, repsText: "MAX ea", video_url: "https://example.com/video/pistol_squat_progression" },
      { name: "Jump Squats", sets: "5 × 20", setsCount: 5, repsText: "20", video_url: "https://example.com/video/jump_squats" },
      { name: "Lunge Jumps", sets: "4 × 12 ea", setsCount: 4, repsText: "12 ea", video_url: "https://example.com/video/lunge_jumps" },
      { name: "Single Leg Glute Bridge", sets: "4 × 20 ea", setsCount: 4, repsText: "20 ea", video_url: "https://example.com/video/single_leg_glute_bridge" },
      { name: "Wall Sit", sets: "3 × 90s", setsCount: 3, repsText: "90s", video_url: "https://example.com/video/wall_sit" },
      { name: "Single Leg Calf Raises", sets: "5 × 30 ea", setsCount: 5, repsText: "30 ea", video_url: "https://example.com/video/single_leg_calf_raises" }
    ],
    core: [
      { name: "L-Sit Hold (floor)", sets: "4 × 20s", setsCount: 4, repsText: "20s", video_url: "https://example.com/video/l_sit_hold_floor" }
    ],
    finisher: {
      label: "Finisher",
      text: "150 Squats — nonstop, as fast as possible",
      type: "time"
    }
  },
  {
    id: "day-4",
    number: 4,
    name: "CHEST & TRIS",
    category: "EXPLOSIVE CALISTHENICS",
    badge: "EXPLOSIVE",
    badgeType: "gold",
    exercises: [
      { name: "Clap Push-ups", sets: "5 × 10", setsCount: 5, repsText: "10", video_url: "https://example.com/video/clap_push_ups" },
      { name: "Pseudo Planche Push-ups", sets: "5 × 8", setsCount: 5, repsText: "8", video_url: "https://example.com/video/pseudo_planche_push_ups" },
      { name: "Diamond Push-ups", sets: "4 × 15", setsCount: 4, repsText: "15", video_url: "https://example.com/video/diamond_push_ups" },
      { name: "Decline Clap Push-ups", sets: "4 × 8", setsCount: 4, repsText: "8", video_url: "https://example.com/video/decline_clap_push_ups" },
      { name: "Tricep Push-ups", sets: "4 × 15", setsCount: 4, repsText: "15", video_url: "https://example.com/video/tricep_push_ups" },
      { name: "Push-up Bottom Hold", sets: "3 × 30s", setsCount: 3, repsText: "30s", video_url: "https://example.com/video/push_up_bottom_hold" }
    ],
    core: [
      { name: "Dragon Flag Negatives", sets: "4 × 6", setsCount: 4, repsText: "6 Negatives", video_url: "https://example.com/video/dragon_flag_negatives" }
    ],
    finisher: {
      label: "Burnout",
      text: "Slow Push-ups (5s down, explode up) — 3 × MAX reps",
      type: "reps"
    }
  },
  {
    id: "day-5",
    number: 5,
    name: "POSTERIOR+",
    category: "IRON CORE BASE",
    badge: "IRON CORE",
    badgeType: "blue",
    exercises: [
      { name: "Superman Circuit", sets: "5 × (20 reps + 30s hold)", setsCount: 5, repsText: "20r + 30s", video_url: "https://example.com/video/superman_circuit" },
      { name: "Floor YTW Series", sets: "4 × 15 ea", setsCount: 4, repsText: "15 ea", video_url: "https://example.com/video/floor_ytw_series" },
      { name: "Reverse Snow Angels", sets: "4 × 20", setsCount: 4, repsText: "20", video_url: "https://example.com/video/reverse_snow_angels" },
      { name: "Single Leg Hip Thrust", sets: "4 × 15 ea", setsCount: 4, repsText: "15 ea", video_url: "https://example.com/video/single_leg_hip_thrust" },
      { name: "Prone Cobra to Superman", sets: "4 × 12", setsCount: 4, repsText: "12", video_url: "https://example.com/video/prone_cobra_to_superman" }
    ],
    core: [
      { name: "Dragon Flags", sets: "4 × 8", setsCount: 4, repsText: "8", video_url: "https://example.com/video/dragon_flags" },
      { name: "L-Sit Hold (floor)", sets: "4 × 25s", setsCount: 4, repsText: "25s", video_url: "https://example.com/video/l_sit_hold_floor" }
    ],
    finisher: {
      label: "Finisher",
      text: "Hollow Body + Superman superset — 5 × 30s each on and off",
      type: "duration",
      durationSeconds: 300
    }
  },
  {
    id: "day-6",
    number: 6,
    name: "FULL BODY",
    category: "BRUTAL CIRCUIT",
    badge: "BRUTAL",
    badgeType: "fire",
    circuitRounds: "8 Rounds · 45–60 sec rest only",
    exercises: [
      { name: "Wall Handstand Push-ups", sets: "8 × 10 (1/round)", setsCount: 8, repsText: "10", video_url: "https://example.com/video/wall_handstand_push_ups" },
      { name: "Jump Squats", sets: "8 × 20 (1/round)", setsCount: 8, repsText: "20", video_url: "https://example.com/video/jump_squats" },
      { name: "Clap Push-ups", sets: "8 × 10 (1/round)", setsCount: 8, repsText: "10", video_url: "https://example.com/video/clap_push_ups" },
      { name: "Superman Pulses", sets: "8 × 20 (1/round)", setsCount: 8, repsText: "20", video_url: "https://example.com/video/superman_pulses" },
      { name: "Lunge Jumps", sets: "8 × 12 ea (1/round)", setsCount: 8, repsText: "12 ea", video_url: "https://example.com/video/lunge_jumps" },
      { name: "Diamond Push-ups", sets: "8 × 15 (1/round)", setsCount: 8, repsText: "15", video_url: "https://example.com/video/diamond_push_ups" },
      { name: "Floor L-Sit Hold", sets: "8 × 15s (1/round)", setsCount: 8, repsText: "15s", video_url: "https://example.com/video/floor_l_sit_hold" },
      { name: "Bicycle Crunches", sets: "8 × 30 (1/round)", setsCount: 8, repsText: "30", video_url: "https://example.com/video/bicycle_crunches" }
    ],
    finisher: {
      label: "Final Spark",
      text: "100 Burpees — For time (break as needed)",
      type: "time"
    }
  },
  {
    id: "day-7",
    number: 7,
    name: "REST & RECOVER",
    category: "ACTIVE YOGA & RECOVERY",
    badge: "RECOVERY",
    badgeType: "rest",
    exercises: [
      { name: "Foam Rolling & Full Body Stretching", sets: "1 × 15 mins", setsCount: 1, repsText: "15m", video_url: "https://example.com/video/foam_rolling_full_body_stretching" },
      { name: "Deep Squat Hold (cumulative)", sets: "1 × 5 mins", setsCount: 1, repsText: "5m", video_url: "https://example.com/video/deep_squat_hold_cumulative" },
      { name: "Cobra Stretch & Child's Pose", sets: "3 × 60s holding", setsCount: 3, repsText: "60s", video_url: "https://example.com/video/cobra_stretch_child_s_pose" },
      { name: "Mobility Flow (hip circles, shoulder flossing)", sets: "1 × 10 mins", setsCount: 1, repsText: "10m", video_url: "https://example.com/video/mobility_flow_hip_circles_shoulder_flossing" }
    ],
    core: [
      { name: "Standard Plank Hold", sets: "3 × 60s Work", setsCount: 3, repsText: "60s", video_url: "https://example.com/video/standard_plank_hold" }
    ],
    finisher: {
      label: "Active Walk",
      text: "5KM recovery walk at easy, conversational pace",
      type: "none"
    }
  }
];

export const WARRIOR_RULES = [
  { title: "No Equipment Mandate", desc: "This plan relies purely on gravity and leverage. Use wall supports or sturdy tables for progressive holds, but avoid specialized gym gear to develop true relative bodyweight power." },
  { title: "Strict Range of Motion", desc: "Never cheat. Lock out elbows at the top of pushups. Tap shoulders to the ground for hands-free postures. Half-reps do not count in areana of calisthenics warriors." },
  { title: "Hydration Protocol", desc: "Keep water intake above 4 Liters. High tension calisthenics exerts extraordinary pressure on tendons which require complete hydration to adapt and prevent strain." },
  { title: "Deficit or Surplus Strategy", desc: "Shred targets 500 kcal deficit to maximize power-to-weight ratio. Lean Bulk targets 300 kcal surplus to stimulate myofibrillar shoulder and core hypertrophy." },
  { title: "Non-Negotiable Warm-up", desc: "The static 3KM pre-workout run is mandatory for heat distribution, joint oiling, and cardiovascular fatigue resilience before heavy bodyweight lifts." }
];

export const TECHNIQUE_DRILLS: TechniqueDrill[] = [
  {
    id: "df",
    name: "Dragon Flag",
    difficulty: "Advanced",
    targetMuscle: "Deep core, Lats, Hip flexors",
    description: "A legendary core posture made popular by Bruce Lee. The body is in a straight line, supported only by the shoulders and upper back on the floor while gripping a solid anchor behind the head.",
    regressionSteps: [
      "Hollow Body Hold (60s goal)",
      "Dragon Flag Leg Raises (hips off bench)",
      "Tucked Dragon Flag Holds (legs bent to chest)",
      "Single-leg Dragon Flag Negatives (slow lowering)"
    ],
    keyCues: [
      "Rigid core: Squeeze your glutes and quads fully.",
      "Anchor grip: Engage your lats by pulling down on the frame.",
      "Never bend at the waist - pivot strictly from the shoulders."
    ],
    tips: "Keep your neck relaxed. All the leverage is distributed between your upper shoulders, lats, and deep abdominal wall."
  },
  {
    id: "ps",
    name: "Pistol Squat",
    difficulty: "Intermediate",
    targetMuscle: "Quads, Glutes, Ankle mobility",
    description: "A full search single leg squat that tests both explosive strength, balance, and advanced ankle dorsiflexion.",
    regressionSteps: [
      "Deep bilateral squats (butt-to-heels)",
      "Pistol squats sitting down to a bench/box",
      "Counterweight pistols (holding light object)",
      "Assisted Pistol Squats (holding a pole or wall)"
    ],
    keyCues: [
      "Active front leg: Keep the elevated leg straight and knee locked.",
      "Heel drive: Never let your heel rise from the floor.",
      "Core braced: Lean forward slightly to maintain your center of gravity."
    ],
    tips: "Lack of ankle mobility is usually the bottleneck, not quad strength. Do daily ankle stretching!"
  },
  {
    id: "hspu",
    name: "Wall Handstand Push-Up",
    difficulty: "Advanced",
    targetMuscle: "Anterior Deltoids, Triceps, Trapezius",
    description: "The ultimate raw shoulder-pressing strength movement. Bypasses weight stacks entirely to press your complete biological bodyweight vertically.",
    regressionSteps: [
      "Pike Pushups from floor (heels up)",
      "Elevated Pike Pushups (feet on box)",
      "Wall Handstand Hold (Goal is clean 60s hold)",
      "Tuck Handstand Negatives against wall"
    ],
    keyCues: [
      "Tripod alignment: Head must land forward of hands at the bottom, creating a triangle shape.",
      "Elbows tucked: Keep elbows at a 45-degree angle. Never flare them outwards.",
      "Shrug at lockout: Push the floor away actively at completion of the rep."
    ],
    tips: "Focus on pushing with maximum initial velocity off the bottom. Wear flat shoes or train barefoot for maximum stability."
  },
  {
    id: "ls",
    name: "Floor L-Sit",
    difficulty: "Intermediate",
    targetMuscle: "Abdominals, Hip Flexors, Triceps, Quads",
    description: "An isometric hold where you press your hips off the floor using straight arm shoulder depression and lift your straight legs parallel to the solid floor.",
    regressionSteps: [
      "Plank Tucks on parallel boards",
      "Floor L-Sit with heels resting on ground",
      "One-leg lifted Floor L-Sit",
      "Tucked Floor L-Sit (knees in, hips high)"
    ],
    keyCues: [
      "Depress shoulders: Push the floor actively down to lock out should joints.",
      "Squeeze quads: Flex thighs hard to keep legs dead straight.",
      "Lean forward: Keep hands beside mid-thigh, not behind hips, to engage abs fully."
    ],
    tips: "If your hips are low, focus on pushing the floor down harder. Scapular depression strength is key!"
  },
  {
    id: "shoulder-dislocates",
    name: "Band Shoulder Dislocates",
    difficulty: "Beginner",
    targetMuscle: "Shoulders, Neck",
    description: "Crucial mobility drill for healthy, bulletproof shoulders and avoiding impingement. Opens up the chest and stretches the anterior deltoids.",
    regressionSteps: [
      "Use a lighter band",
      "Use a wider grip",
      "Broomstick pass-throughs"
    ],
    keyCues: [
      "Keep arms completely straight.",
      "Maintain tension on the band.",
      "Do not overarch the lower back."
    ],
    tips: "Essential recovery drill if you flagged Shoulders or Neck injuries."
  },
  {
    id: "wrist-extensions",
    name: "Knuckle-to-Palm Wrist Extensions",
    difficulty: "Beginner",
    targetMuscle: "Wrists, Elbows",
    description: "Essential for building robust wrist joints and forearms that can handle heavy calisthenics loads like handstands and planches.",
    regressionSteps: [
      "Perform standing against a wall",
      "Perform on knees with less weight leaning forward"
    ],
    keyCues: [
      "Keep elbows locked out.",
      "Slow and controlled motion.",
      "Spread fingers wide."
    ],
    tips: "Highly recommended for active Wrist or Elbow injuries/sensitivity."
  },
  {
    id: "jefferson-curl",
    name: "Light Jefferson Curls",
    difficulty: "Intermediate",
    targetMuscle: "Lower Back, Hips",
    description: "A spinal articulation drill that builds strength and mobility through the entire posterior chain.",
    regressionSteps: [
      "Unweighted spinal waves",
      "Cat-Cow stretches",
      "BCA (Basic Core Activation)"
    ],
    keyCues: [
      "Tuck chin to chest first.",
      "Roll down one vertebra at a time.",
      "Keep knees locked."
    ],
    tips: "Perfect rehab for Lower Back or Hips tightness, provided acute pain has subsided."
  },
  {
    id: "atg-split-squat",
    name: "ATG Split Squat",
    difficulty: "Intermediate",
    targetMuscle: "Knees, Ankles",
    description: "Builds bulletproof knees by taking the joint through a full range of motion under load, strengthening the VMO and connective tissue.",
    regressionSteps: [
      "Front foot elevated on a high box",
      "Assisted with rings/TRX",
      "Reduced range of motion"
    ],
    keyCues: [
      "Hamstring must completely cover the calf.",
      "Keep back leg as straight as possible.",
      "Maintain upright torso."
    ],
    tips: "The ultimate recovery tool for Knee or Ankle issues. Start assisted if currently flagged."
  }
];
