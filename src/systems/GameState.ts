import { LEVELS, PARROT_ITEMS, SHARED_LIVES } from '../config/constants';
import type { LevelKey, ParrotItem } from '../config/constants';

class GameState {
  lives = SHARED_LIVES;
  playerMode: 1 | 2 = 1;
  currentLevelIndex = 0;
  unlockedLevels = new Set<LevelKey>(['CityStreets']);
  parrotItemIndex = 0;
  score = 0;
  levelStars: Partial<Record<LevelKey, 1 | 2 | 3>> = {};

  get currentLevel(): LevelKey {
    return LEVELS[this.currentLevelIndex];
  }

  get nextParrotItem(): ParrotItem {
    return PARROT_ITEMS[this.parrotItemIndex % PARROT_ITEMS.length];
  }

  advanceParrotItem() {
    this.parrotItemIndex++;
  }

  completeLevel(level: LevelKey, stars: 1 | 2 | 3) {
    this.levelStars[level] = stars;
    const idx = LEVELS.indexOf(level);
    const next = LEVELS[idx + 1];
    if (next) this.unlockedLevels.add(next);
    this.currentLevelIndex = idx + 1;
    this.save();
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
  }

  reset() {
    this.lives = SHARED_LIVES;
    this.currentLevelIndex = 0;
    // playerMode is intentionally not reset — persists across play sessions
    this.unlockedLevels = new Set(['CityStreets']);
    this.parrotItemIndex = 0;
    this.score = 0;
    this.levelStars = {};
    localStorage.removeItem('hotodog_save');
  }

  save() {
    localStorage.setItem('hotodog_save', JSON.stringify({
      lives: this.lives,
      currentLevelIndex: this.currentLevelIndex,
      unlockedLevels: [...this.unlockedLevels],
      parrotItemIndex: this.parrotItemIndex,
      score: this.score,
      levelStars: this.levelStars,
    }));
  }

  load() {
    const raw = localStorage.getItem('hotodog_save');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      this.lives = data.lives ?? SHARED_LIVES;
      this.currentLevelIndex = data.currentLevelIndex ?? 0;
      this.unlockedLevels = new Set(data.unlockedLevels ?? ['CityStreets']);
      this.parrotItemIndex = data.parrotItemIndex ?? 0;
      this.score = data.score ?? 0;
      this.levelStars = data.levelStars ?? {};
    } catch {
      // corrupt save — ignore
    }
  }
}

export const gameState = new GameState();
