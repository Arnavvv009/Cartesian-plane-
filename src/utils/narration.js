/* =========================================================================
   NARRATION SCRIPTS — maps each lesson phase to its spoken segments.
   Only paragraph text and questions are narrated — NEVER titles.
   Every string comes from lessonScript.js, the same source the UI displays.
   ========================================================================= */
import { say, ask, think, instruct, cheer, encourage, emphasize } from './audio.js';
import { WONDER, STORY, STORY_BUBBLES, STORY_QUOTES, SIMULATE, SIMULATE_DESCS, SIMULATE_HINTS, REFLECT, PRACTICE, FEEDBACK } from './lessonScript.js';

export function wonderNarration() {
  return [say(WONDER.paragraph), ask(WONDER.question)];
}

export function getStoryNarration(slideIndex) {
  const slide = STORY[slideIndex];
  if (!slide) return [];
  const segments = [{ text: slide.body, style: slide.style }];
  // Narrate the pull-quote key fact
  if (STORY_QUOTES[slideIndex]) {
    segments.push(emphasize(STORY_QUOTES[slideIndex]));
  }
  // Narrate the mascot bubble line
  if (STORY_BUBBLES[slideIndex]) {
    segments.push(encourage(STORY_BUBBLES[slideIndex]));
  }
  return segments;
}

export function simulateStationIntro(station) {
  if (station === 3) return [ask(SIMULATE[3])];
  return [instruct(SIMULATE[station])];
}

/** Narrate the activity description when a new activity starts */
export function simulateActivityNarration(station, actIdx) {
  const desc = SIMULATE_DESCS[station] && SIMULATE_DESCS[station][actIdx];
  return desc ? [instruct(desc)] : [];
}

/** Narrate the hint when the hint button is pressed */
export function simulateHintNarration(station, actIdx) {
  const hint = SIMULATE_HINTS[station] && SIMULATE_HINTS[station][actIdx];
  return hint ? [think(hint)] : [];
}

export function reflectQuestionNarration() {
  return [think(REFLECT.question)];
}

export function practiceWorldsNarration() {
  return [instruct(PRACTICE.intro)];
}

export const feedbackNarration = {
  splitDone: () => [cheer(FEEDBACK.splitDone)],
  buildDone: () => [cheer(FEEDBACK.buildDone)],
  reverseDone: () => [cheer(FEEDBACK.reverseDone)],
  tryAgain: () => [encourage(FEEDBACK.tryAgain)],
  practiceCorrect: () => [cheer(FEEDBACK.practiceCorrect)],
  practiceWrong: () => [encourage(FEEDBACK.practiceWrong)],
  lessonDone: () => [cheer(FEEDBACK.lessonDone)]
};
