import Phaser from 'phaser';
import { PLAYER_SPEED, BULLET_SPEED } from '../config/constants';
import type { PlayerInput } from '../systems/InputManager';
import { Bullet } from './Bullet';

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly playerId: 1 | 2;
  private bullets: Phaser.Physics.Arcade.Group;
  private shootCooldown = 0;
  private readonly SHOOT_COOLDOWN_MS = 400;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: 1 | 2,
    bullets: Phaser.Physics.Arcade.Group,
  ) {
    super(scene, x, y, playerId === 1 ? 'player1' : 'player2');
    this.playerId = playerId;
    this.bullets = bullets;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  update(input: PlayerInput, delta: number) {
    this.shootCooldown -= delta;

    const vx = input.left ? -PLAYER_SPEED : input.right ? PLAYER_SPEED : 0;
    this.setVelocityX(vx);

    if (input.up && this.body!.blocked.down) {
      this.setVelocityY(-380);
    }

    // Flip sprite to face movement direction
    if (vx < 0) this.setFlipX(true);
    else if (vx > 0) this.setFlipX(false);

    if (vx !== 0) {
      this.anims.play(`cop_walk_p${this.playerId}`, true);
    } else {
      this.anims.play(`cop_idle_p${this.playerId}`, true);
    }

    if (input.shoot && this.shootCooldown <= 0) {
      this.fireBullet();
      this.shootCooldown = this.SHOOT_COOLDOWN_MS;
    }
  }

  private fireBullet() {
    const dir = this.flipX ? -1 : 1;
    const b = this.bullets.get(this.x, this.y) as Bullet | null;
    if (b) {
      b.fire(this.x, this.y, dir * BULLET_SPEED, 0, this.playerId);
    }
  }
}
