import Phaser from 'phaser';
import type { PlayerInput } from '../systems/InputManager';
import type { Player } from './Player';
import type { Enemy } from './Enemy';

const FOLLOW_DIST = 56;   // px gap to keep from player1
const SHOOT_RANGE = 220;  // px — auto-shoot enemies within this range
const SHOOT_INTERVAL = 700; // ms between AI shots

export class CompanionAI {
  private shootCooldown = 0;

  generate(
    companion: Player,
    target: Player,
    enemies: Phaser.Physics.Arcade.Group,
    delta: number,
  ): PlayerInput {
    this.shootCooldown -= delta;

    const dx = target.x - companion.x;

    // Horizontal follow: stay within FOLLOW_DIST of player1
    const left  = dx < -FOLLOW_DIST;
    const right = dx > FOLLOW_DIST;

    // Jump when player1 is clearly above and companion is grounded
    const body = companion.body as Phaser.Physics.Arcade.Body;
    const up = target.y < companion.y - 20 && body.blocked.down;

    // Find nearest live enemy
    let nearestEnemy: Enemy | null = null;
    let nearestDist = SHOOT_RANGE;
    for (const child of enemies.getChildren()) {
      const e = child as Enemy;
      if (e.isArrested || !e.active) continue;
      const d = Phaser.Math.Distance.Between(companion.x, companion.y, e.x, e.y);
      if (d < nearestDist) { nearestDist = d; nearestEnemy = e; }
    }

    // Orient toward enemy before shooting
    let shoot = false;
    if (nearestEnemy && this.shootCooldown <= 0) {
      // Face toward enemy: override left/right temporarily via flipX
      // Player.update handles flipping from input, so we just set the direction here
      const facingRight = nearestEnemy.x >= companion.x;
      companion.setFlipX(!facingRight);
      shoot = true;
      this.shootCooldown = SHOOT_INTERVAL;
    }

    return { left, right, up, down: false, shoot, interact: false };
  }
}
