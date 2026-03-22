import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

const WAKE_RANGE = 140;
const SHRINK_DURATION = 60000; // platforms fully gone after 60 s

type ShrinkEntry = { sprite: Phaser.Physics.Arcade.Sprite; initialW: number };

export class GhostCastleScene extends BaseGameScene {
  protected levelKey   = 'GhostCastle' as const;
  protected enemyCount = 8;
  protected worldWidth = GAME_WIDTH;

  private sleepingEnemies  = new Set<Enemy>();
  private sleepLabels      = new Map<Enemy, Phaser.GameObjects.Text>();
  private shrinkPlatforms: ShrinkEntry[] = [];
  private shrinkElapsed    = 0; // accumulated ms via delta — avoids clock mismatch

  constructor() { super('GhostCastleScene'); }

  create() {
    super.create();
    this.shrinkElapsed = 0;
    this.time.delayedCall(30000, this.dropAllGhosts, [], this);
  }

  private dropAllGhosts() {
    // Wake any still-sleeping ghosts
    for (const ghost of [...this.sleepingEnemies]) {
      this.wakeGhost(ghost);
    }
    // Give every active ghost a strong downward velocity — physics + ground collision lands them
    this.enemies.getChildren().forEach(e => {
      const enemy = e as Enemy;
      if (enemy.active && !enemy.isArrested && !enemy.isStunned) {
        enemy.setVelocityY(700);
      }
    });
    // Brief on-screen warning
    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '👻 Ghosts descend!', {
      fontFamily: 'monospace', fontSize: '20px', color: '#cc88ff',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: label, alpha: 0, y: label.y - 40, duration: 1800,
      onComplete: () => label.destroy() });
  }

  protected createWorld() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_castle');

    [240, 480, 720].forEach(x => {
      const candle = this.add.circle(x, GAME_HEIGHT - 40, 60, 0xff8800, 0.08);
      this.tweens.add({ targets: candle, alpha: 0.04, duration: 800, yoyo: true, repeat: -1 });
    });

    this.groundGroup = this.physics.add.staticGroup();

    // Floor 1 — ground
    this.makeTile(GAME_WIDTH / 2, GAME_HEIGHT - 8, GAME_WIDTH, 32);
    // Floor 3 — dormitory level: full-width open platform, no ceiling over staircase.
    // Floor 2 staircase steps — all registered for the 60-second shrink mechanic.
    const addShrink = (x: number, y: number, w: number) => {
      const s = this.makeTile(x, y, w, 16, 'platform');
      this.shrinkPlatforms.push({ sprite: s, initialW: w });
    };

    addShrink(480, 220, 920);   // dormitory — x=20–940 (nearly full width)
    addShrink(120, 452, 180);   // step 1 — x=30–210
    addShrink( 50, 380, 100);   // step 2 — x=0–100  (zigzag left)
    addShrink(180, 308, 160);   // step 3 — x=100–260 (zigzag right, ends before drop zone)

    // Ghost beds (decorative)
    [400, 600, 800].forEach(x =>
      this.add.rectangle(x, 204, 40, 16, 0x4444aa).setOrigin(0.5, 1),
    );
    this.add.text(GAME_WIDTH / 2, 184, '💤 Ghost Dormitory', {
      fontFamily: 'monospace', fontSize: '12px', color: '#8888cc',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1);
  }

  protected spawnEnemies() {
    // Floor 1 — 5 ghosts spread across ground (floor-2 enemies folded in here)
    [120, 300, 500, 680, 860].forEach(x =>
      this.enemies.add(new Enemy(this, x, GAME_HEIGHT - 80, 'ghost')),
    );
    // Dormitory — sleeping until player approaches (x=20–940)
    [400, 620, 840].forEach(x => {
      const ghost = new Enemy(this, x, 192, 'ghost');
      ghost.setTint(0x8888cc);
      this.enemies.add(ghost);
      this.sleepingEnemies.add(ghost);
      const zzz = this.add.text(x, 176, '💤', { fontSize: '10px' }).setOrigin(0.5);
      this.sleepLabels.set(ghost, zzz);
    });
  }

  private wakeGhost(ghost: Enemy) {
    this.sleepingEnemies.delete(ghost);
    ghost.clearTint();
    const label = this.sleepLabels.get(ghost);
    if (label) {
      this.sleepLabels.delete(ghost);
      this.tweens.add({ targets: label, y: label.y - 20, alpha: 0, duration: 600,
        onComplete: () => label.destroy() });
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    // Shrink all non-ground platforms to nothing over 60 seconds
    this.shrinkElapsed += delta;
    const progress = Math.min(this.shrinkElapsed / SHRINK_DURATION, 1);
    for (let i = this.shrinkPlatforms.length - 1; i >= 0; i--) {
      const p = this.shrinkPlatforms[i];
      if (!p.sprite.active) { this.shrinkPlatforms.splice(i, 1); continue; }
      const newW = Math.round(p.initialW * (1 - progress));
      if (newW <= 0) {
        p.sprite.destroy();
        this.shrinkPlatforms.splice(i, 1);
      } else {
        p.sprite.setDisplaySize(newW, 16);
        (p.sprite.body as Phaser.Physics.Arcade.StaticBody).setSize(newW, 16);
        p.sprite.refreshBody();
      }
    }

    for (const ghost of [...this.sleepingEnemies]) {
      if (!ghost.active) { this.sleepingEnemies.delete(ghost); continue; }
      const d1 = Phaser.Math.Distance.Between(this.player1.x, this.player1.y, ghost.x, ghost.y);
      const d2 = Phaser.Math.Distance.Between(this.player2.x, this.player2.y, ghost.x, ghost.y);
      if (d1 < WAKE_RANGE || d2 < WAKE_RANGE) {
        this.wakeGhost(ghost);
      } else {
        ghost.setVelocityX(0);
      }
      const label = this.sleepLabels.get(ghost);
      if (label) { label.x = ghost.x; label.y = ghost.y - 16; }
    }
  }
}
