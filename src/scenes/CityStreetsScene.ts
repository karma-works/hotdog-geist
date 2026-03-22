import { BaseGameScene } from './BaseGameScene';
import { Enemy } from '../entities/Enemy';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class CityStreetsScene extends BaseGameScene {
  protected levelKey    = 'CityStreets' as const;
  protected enemyCount  = 8;
  protected worldWidth  = GAME_WIDTH; // single screen — all enemies always visible

  constructor() { super('CityStreetsScene'); }

  protected createWorld() {
    const W = this.worldWidth;
    this.add.image(W / 2, GAME_HEIGHT / 2, 'bg_city');

    this.groundGroup = this.physics.add.staticGroup();
    this.makeTile(W / 2, GAME_HEIGHT - 8, W, 32);

    // Platforms spread across the single screen
    this.makeTile(140, 420, 160, 16, 'platform');
    this.makeTile(320, 375, 160, 16, 'platform');
    this.makeTile(500, 420, 160, 16, 'platform');
    this.makeTile(680, 370, 160, 16, 'platform');
    this.makeTile(860, 415, 160, 16, 'platform');
  }

  protected spawnEnemies() {
    // All enemies spread across the 960px screen so none wander off-camera
    [80, 200, 340, 460, 560, 660, 780, 900].forEach(x =>
      this.enemies.add(new Enemy(this, x, GAME_HEIGHT - 80, 'monster')),
    );
  }
}
