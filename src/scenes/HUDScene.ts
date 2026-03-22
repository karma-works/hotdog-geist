import Phaser from 'phaser';
import { gameState } from '../systems/GameState';
import type { LevelKey } from '../config/constants';
import { GAME_WIDTH } from '../config/constants';
import { t } from '../i18n/i18n';

export class HUDScene extends Phaser.Scene {
  private livesText!: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;
  private levelKey!: LevelKey;

  constructor() { super({ key: 'HUDScene', active: false }); }

  init(data: { levelKey: LevelKey }) { this.levelKey = data.levelKey; }

  create() {
    const style = {
      fontFamily: 'monospace', fontSize: '16px',
      color: '#ffffff', stroke: '#000', strokeThickness: 3,
    };

    this.livesText = this.add.text(16, 12, '', style);

    this.enemiesText = this.add.text(GAME_WIDTH - 16, 12, '', style).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2, 12, t(`levels.${this.levelKey}`), {
      ...style, color: '#ffdd44',
    }).setOrigin(0.5, 0);

    const gameScene = this.scene.get(`${this.levelKey}Scene`);
    gameScene.events.on('enemy-arrested', (remaining: number) => {
      this.enemiesText.setText(t('ghosts_remaining', { count: remaining }));
    });

    this.update();
  }

  update() {
    this.livesText.setText(`❤ ${gameState.lives}`);
  }
}
