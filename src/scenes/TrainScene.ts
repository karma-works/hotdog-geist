import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

const CARRIAGES: { x: number; w: number }[] = [
  { x: 100,  w: 180 },
  { x: 320,  w: 180 },
  { x: 540,  w: 180 },
  { x: 740,  w: 160 },
  { x: 920,  w: 160 },
];

// Window geometry within each carriage
const WIN_MARGIN = 22; // px on each side (= pillar width)
const WIN_TOP    = GAME_HEIGHT - 148; // top edge of window strip
const WIN_H      = 52;               // window height

const CARRIAGE_COLOR = 0x334466;

export class TrainScene extends BaseGameScene {
  protected levelKey    = 'Train' as const;
  protected enemyCount  = 7;
  protected worldWidth  = GAME_WIDTH;
  protected worldHeight = GAME_HEIGHT + 300;
  protected hasFallDeath = true;
  protected respawnX    = CARRIAGES[0].x;
  protected respawnY    = GAME_HEIGHT - 80;

  private windowSprites: Phaser.GameObjects.TileSprite[] = [];

  constructor() { super('TrainScene'); }

  protected createWorld() {
    // Static dark sky background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x111122);

    // Rail track
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 4, GAME_WIDTH, 8, 0x444444);

    this.groundGroup = this.physics.add.staticGroup();

    for (const c of CARRIAGES) {
      this.makeTile(c.x, GAME_HEIGHT - 32, c.w, 32);

      const ww = c.w - WIN_MARGIN * 2;

      // 1. Solid carriage body first (lower z) — covers the full carriage area
      const bodyH  = GAME_HEIGHT - 32 - (GAME_HEIGHT - 192); // 160 px
      this.add.rectangle(c.x, GAME_HEIGHT - 112, c.w, bodyH, CARRIAGE_COLOR);

      // 2. Scrolling TileSprite second (higher z) — sits on top, exactly at window size
      //    so it is visible only in the window opening
      const win = this.add.tileSprite(c.x, WIN_TOP + WIN_H / 2, ww, WIN_H, 'bg_city');
      this.windowSprites.push(win);

      // 3. Window frame stroke on top
      this.add.rectangle(c.x, WIN_TOP + WIN_H / 2, ww + 4, WIN_H + 4, 0x000000, 0)
        .setStrokeStyle(2, 0x6677aa);
    }

    // Gap danger indicators
    [{ x: 210, w: 20 }, { x: 430, w: 20 }, { x: 650, w: 20 }, { x: 840, w: 20 }]
      .forEach(g => this.add.rectangle(g.x, GAME_HEIGHT - 16, g.w, 32, 0xff2200, 0.6));
  }

  protected spawnEnemies() {
    // One enemy per carriage, patrol bounds locked to that carriage so they can't fall into gaps
    for (const c of CARRIAGES) {
      const e = new Enemy(this, c.x, GAME_HEIGHT - 80, 'monster');
      e.patrolLeft  = c.x - c.w / 2 + 16;
      e.patrolRight = c.x + c.w / 2 - 16;
      this.enemies.add(e);
    }
    // Two extra enemies on the larger middle carriages
    for (const c of [CARRIAGES[1], CARRIAGES[2]]) {
      const e = new Enemy(this, c.x + 40, GAME_HEIGHT - 80, 'monster');
      e.patrolLeft  = c.x - c.w / 2 + 16;
      e.patrolRight = c.x + c.w / 2 - 16;
      this.enemies.add(e);
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    for (const win of this.windowSprites) win.tilePositionX += 2;
  }
}
