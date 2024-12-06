import { Vector } from './Vector.js';

export function detect(bodyA, bodyB) {
  const direction = Vector.subtract(bodyB.position, bodyA.position);
  const distance = direction.magnitude();
  const radii = bodyA.radius + bodyB.radius;

  if (distance > radii || distance === 0) {
    return {
      detection: false,
      normal: new Vector(),
      depth: Number.MAX_VALUE
    };
  }

  const normal = direction.scale(1 / distance);
  const depth = (radii - distance) / 2;

  return {
    detection: true,
    normal,
    depth
  };
}

export function separate(bodyA, bodyB, normal, depth) {
  if (bodyA.isStatic && !bodyB.isStatic) {
    bodyB.position.add(normal, depth);
  } else if (!bodyA.isStatic && bodyB.isStatic) {
    bodyA.position.add(normal, -depth);
  } else if (!bodyA.isStatic && !bodyB.isStatic) {
    bodyA.position.add(normal, -depth / 2);
    bodyB.position.add(normal, depth / 2);
  }
}
