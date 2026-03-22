import Phaser from 'phaser';
import { gameState } from '../systems/GameState';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    gameState.load();
    this.scene.start('PreloadScene');
  }
}
