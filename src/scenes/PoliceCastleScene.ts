import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

const GATE_X = GAME_WIDTH / 2;
const GATE_RANGE = 64;

export class PoliceCastleScene extends BaseGameScene {
  protected levelKey    = 'PoliceCastle' as const;
  protected enemyCount  = 10;
  protected worldWidth  = GAME_WIDTH;
  private spawnedTotal  = 0;
  private wavesDone     = 0;
  private readonly TOTAL_WAVES = 2;

  private gateHp = 3;
  private gateHpText!: Phaser.GameObjects.Text;

  protected get allEnemiesSpawned(): boolean { return this.spawnedTotal >= this.enemyCount; }

  constructor() { super('PoliceCastleScene'); }

  protected createWorld() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_castle');

    this.groundGroup = this.physics.add.staticGroup();
    this.makeTile(GAME_WIDTH / 2, GAME_HEIGHT - 8, GAME_WIDTH, 32);

    // Flanking towers
    this.makeTile(40,  GAME_HEIGHT - 80, 32, 160);
    this.makeTile(920, GAME_HEIGHT - 80, 32, 160);

    // Castle gate
    this.add.rectangle(GATE_X, GAME_HEIGHT - 48, 48, 64, 0x886644);
    this.add.text(GATE_X, GAME_HEIGHT - 100, '🏰', { fontSize: '28px' }).setOrigin(0.5);

    this.gateHpText = this.add.text(GATE_X, GAME_HEIGHT - 130, '❤❤❤', {
      fontFamily: 'monospace', fontSize: '20px',
      color: '#ff4444', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => this.spawnWave());
  }

  protected spawnEnemies() { /* handled by waves */ }

  private spawnWave() {
    if (this.spawnedTotal >= this.enemyCount) return;
    const count = Math.min(5, this.enemyCount - this.spawnedTotal);
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      const g = new Enemy(this, fromLeft ? 16 : GAME_WIDTH - 16, GAME_HEIGHT - 80, 'ghost');
      g.setVelocityX(fromLeft ? 70 : -70);
      this.enemies.add(g);
      this.spawnedTotal++;
    }
    this.wavesDone++;
    if (this.wavesDone < this.TOTAL_WAVES)
      this.time.delayedCall(9000, () => this.spawnWave());
  }

  private damageGate(ghost: Enemy) {
    ghost.setActive(false).setVisible(false);
    ghost.destroy();
    this.gateHp--;
    const filled = '❤'.repeat(Math.max(0, this.gateHp));
    const empty  = '🖤'.repeat(3 - Math.max(0, this.gateHp));
    this.gateHpText.setText(filled + empty);
    this.cameras.main.shake(300, 0.008);
    if (this.gateHp <= 0) { this.levelFail(); return; }

    // Update HUD so the displayed count stays in sync with reality
    this.events.emit('enemy-arrested', this.enemies.countActive(true));

    // If all waves are done and no enemies remain, the level is won
    if (this.spawnedTotal >= this.enemyCount && this.enemies.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.enemies.getChildren().forEach(child => {
      const ghost = child as Enemy;
      if (!ghost.active || ghost.isArrested || ghost.isStunned) return;
      if (Math.abs(ghost.x - GATE_X) < GATE_RANGE && ghost.y > GAME_HEIGHT - 120) {
        this.damageGate(ghost);
      }
    });
  }
}
