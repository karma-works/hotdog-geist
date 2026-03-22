import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { gameState } from '../systems/GameState';
import { t } from '../i18n/i18n';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x110011, 0.9);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, t('game_over'), {
      fontFamily: 'monospace', fontSize: '48px',
      color: '#ff4444', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);

    const retry = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, t('press_start'), {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard!.on('keydown-ENTER', () => {
      gameState.reset();
      this.scene.start('TitleScene');
    });
  }
}
