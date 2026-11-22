/* =========================================================================
   LESSON SCRIPT — single source of truth for every spoken line.
   ---------------------------------------------------------------------------
   • UI components DISPLAY these exact strings.
   • src/utils/narration.js wraps them in styled segments for playback.
   • scripts/generate_audio.js reads ALL_PHRASES to pre-generate the MP3s.
   Because all three read the same strings, on-screen text and audio can
   never drift apart (1:1 parity).

   CONTENT POLICY: only paragraphs and questions are narrated.
   Titles, headings and labels live in the components and are NEVER spoken.
   Plain ESM (no Vite-only APIs) so Node scripts can import it too.
   ========================================================================= */

export const WONDER = {
  paragraph:
    "Captain Ava's treasure map says the gold is buried at negative 3, 4. Her crew dug at 4, negative 3 instead, and found nothing but sand! The same two numbers led them to a completely different place.",
  question:
    "How can just two numbers tell us exactly where a point is, and why does their order matter?"
};

export const STORY = [
  {
    body: "Mathematicians locate points with two number lines that cross at right angles. The horizontal line is the x-axis, the vertical line is the y-axis, and they meet at the origin, which is the point 0, 0.",
    style: 'statement'
  },
  {
    body: "Every point has an ordered pair, x comma y. The x-coordinate tells you how far to move left or right from the origin. The y-coordinate tells you how far to move up or down. Along the corridor first, then up the stairs!",
    style: 'emphasis'
  },
  {
    body: "The axes split the plane into four quadrants, numbered anticlockwise. In quadrant one both coordinates are positive. In quadrant two x is negative. In quadrant three both are negative. In quadrant four y is negative.",
    style: 'emphasis'
  },
  {
    body: "Some points sit right on an axis. Any point on the x-axis has a y-coordinate of 0, like 5, 0. Any point on the y-axis has an x-coordinate of 0, like 0, negative 2. These points are not in any quadrant.",
    style: 'thinking'
  },
  {
    body: "When two points share the same y-coordinate, they lie on a horizontal line. Their distance is the difference of the x-coordinates. From negative 2, 3 to 5, 3 is 5 minus negative 2, which is 7 units.",
    style: 'statement'
  },
  {
    body: "We can draw shapes by joining points. A rectangle with corners at negative 3, 2, and 3, 2, and 3, negative 2, and negative 3, negative 2 is 6 units long and 4 units wide, so its area is 24 square units.",
    style: 'statement'
  },
  {
    body: "Ava's map said negative 3, 4: go 3 left, then 4 up, into quadrant two. Her crew swapped the numbers and went 4 right and 3 down into quadrant four. Order matters: x always comes first!",
    style: 'encouragement'
  },
  {
    body: "Brilliant! You can now plot points, name quadrants, find distances and draw shapes on the Cartesian plane. Step into the lab to plot maps, find hidden corners and navigate to treasure!",
    style: 'celebration'
  }
];

export const SIMULATE = {
  1: "Click on the grid to plot each place on the map. Remember: x first, then y! Then name the quadrant of each point.",
  2: "Plot the missing corner of the shape. Then use the coordinates to find its side lengths and area!",
  3: "Follow the navigation clues step by step. Work out each new coordinate and distance to reach the target!"
};

/* Story slide mascot bubble lines (displayed in speech bubbles beside the lion mascot) */
export const STORY_BUBBLES = [
  "This grid is called the Cartesian plane!",
  "Along the corridor, then up the stairs!",
  "Quadrants are numbered anticlockwise!",
  "Axis points belong to no quadrant!",
  "Same y? Subtract the x-coordinates!",
  "Count the units between the corners!",
  "Swap the numbers, lose the treasure!",
  "Click below to enter the interactive lab!"
];

/* Story slide pull-quote key facts (displayed in sparkle pills) */
export const STORY_QUOTES = [
  "x-axis goes left and right, y-axis goes up and down, and they meet at the origin, 0, 0.",
  "4, 3 means 4 right, then 3 up.",
  "Quadrant one is positive positive. Quadrant two is negative positive. Quadrant three is negative negative. Quadrant four is positive negative.",
  "On the x-axis, y equals 0. On the y-axis, x equals 0.",
  "From negative 2, 3 to 5, 3: 5 minus negative 2 equals 7 units.",
  "6 times 4 equals 24 square units.",
  "Negative 3, 4 is not the same as 4, negative 3!",
  "Ready to become a coordinate navigator?"
];

/* Simulate activity descriptions — one per activity, indexed [station][actIdx] */
export const SIMULATE_DESCS = {
  1: [
    "Plot the four landmarks on Captain Ava's island map. Click the grid where each point belongs, then name the quadrant of every landmark.",
    "Plot these places on the city map. Watch out — some of them sit right on an axis! Then name the quadrant of each one.",
    "An astronomer marks four stars. Plot each star, including the one at the origin, then name every star's quadrant."
  ],
  2: [
    "A rectangular park has corners at A negative 4, 3, B 2, 3 and C 2, negative 1. Plot the fourth corner D, then find the park's length, width and area.",
    "A square pool has corners at P negative 1, 4, Q 3, 4 and R 3, 0. Plot the fourth corner S, then find the side length, perimeter and area.",
    "A sail is a right triangle with base J negative 3, negative 2 to K 3, negative 2. The top corner L is directly above J and 6 units up. Plot L, then find the base, height and area."
  ],
  3: [
    "Ava starts at negative 4, negative 2. Clue 1: walk 6 units right. Clue 2: walk 5 units up. Where is the treasure, and how far did she walk?",
    "A boat at negative 5, 3 sails straight to a lighthouse at 4, 3. A helicopter then flies from the lighthouse straight down to 4, negative 3. How long is each leg of the trip?",
    "A swan is at M 3, negative 2. The x-axis is the edge of a mirror-still lake. Find the swan's reflection in the x-axis, then its reflection in the y-axis."
  ]
};

/* Simulate activity hints */
export const SIMULATE_HINTS = {
  1: [
    "Start at the origin. Move along the x-axis first, right if positive, left if negative, then up or down for y.",
    "A 0 means don't move in that direction. 0, 3 sits on the y-axis; negative 5, 0 sits on the x-axis.",
    "The origin 0, 0 is where the axes cross. Points on an axis are not in any quadrant."
  ],
  2: [
    "D lines up under A, same x as A, and across from C, same y as C.",
    "S has the same x as P and the same y as R. It sits on the x-axis!",
    "Directly above J means the same x-coordinate, negative 3. Count 6 up from y equals negative 2."
  ],
  3: [
    "Moving right adds to x. Moving up adds to y.",
    "On a horizontal line, subtract the x-coordinates. On a vertical line, subtract the y-coordinates.",
    "Reflecting in the x-axis changes the sign of y. Reflecting in the y-axis changes the sign of x."
  ]
};

export const REFLECT = {
  question:
    "How do you plot a point like negative 3, 4 on the Cartesian plane? Explain it to Robo and say which quadrant it is in!"
};

export const PRACTICE = {
  intro:
    "Choose a world and test your coordinate skills. Score four out of ten or more to earn stars and unlock the next world. Collect all thirty stars to finish the quest!"
};

export const FEEDBACK = {
  splitDone: "Awesome! Every point is in the right place!",
  buildDone: "Great job! You found the hidden corner and the area!",
  reverseDone: "Brilliant navigation!",
  tryAgain: "Not quite. Try again!",
  practiceCorrect: "Correct! Excellent coordinate work!",
  practiceWrong: "Not quite!",
  lessonDone: "Outstanding reflection! Lesson complete!"
};

/** Every phrase that should exist as a pre-generated MP3, with its voice style. */
export const ALL_PHRASES = [
  { text: WONDER.paragraph, style: 'statement' },
  { text: WONDER.question, style: 'question' },
  ...STORY.map(s => ({ text: s.body, style: s.style })),
  // Story mascot bubble lines
  ...STORY_BUBBLES.map(b => ({ text: b, style: 'encouragement' })),
  // Story pull-quote key facts
  ...STORY_QUOTES.map(q => ({ text: q, style: 'emphasis' })),
  // Simulate station intros
  { text: SIMULATE[1], style: 'instruction' },
  { text: SIMULATE[2], style: 'instruction' },
  { text: SIMULATE[3], style: 'question' },
  // Simulate activity descriptions
  ...Object.values(SIMULATE_DESCS).flat().map(d => ({ text: d, style: 'instruction' })),
  // Simulate activity hints
  ...Object.values(SIMULATE_HINTS).flat().map(h => ({ text: h, style: 'thinking' })),
  // Practice worlds intro
  { text: PRACTICE.intro, style: 'instruction' },
  // Reflect & Feedback
  { text: REFLECT.question, style: 'thinking' },
  { text: FEEDBACK.splitDone, style: 'celebration' },
  { text: FEEDBACK.buildDone, style: 'celebration' },
  { text: FEEDBACK.reverseDone, style: 'celebration' },
  { text: FEEDBACK.tryAgain, style: 'encouragement' },
  { text: FEEDBACK.practiceCorrect, style: 'celebration' },
  { text: FEEDBACK.practiceWrong, style: 'encouragement' },
  { text: FEEDBACK.lessonDone, style: 'celebration' }
];
