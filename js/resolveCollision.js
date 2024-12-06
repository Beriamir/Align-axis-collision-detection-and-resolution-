import { Vector } from './Vector.js';

export function resolveCollision(bodyA, bodyB, normal) {
  if (bodyA.isStatic && bodyB.isStatic) return;

  // Compute Impulse
  const relativeVelocity = Vector.subtract(bodyB.velocity, bodyA.velocity);
  const velocityAlongNormal = relativeVelocity.dot(normal);

  if (velocityAlongNormal >= 0) return;

  const restitution = Math.min(bodyA.restitution, bodyB.restitution);
  const impulse =
    (-(1 + restitution) * velocityAlongNormal) /
    (bodyA.inverseMass + bodyB.inverseMass);

  bodyA.velocity.add(normal, -impulse * bodyA.inverseMass);
  bodyB.velocity.add(normal, impulse * bodyB.inverseMass);

  // Compute Friction impulse
  const tangent = Vector.subtract(
    relativeVelocity,
    Vector.scale(normal, velocityAlongNormal)
  );

  if (tangent.nearlyEqual(new Vector())) return;

  tangent.normalize();

  const friction = {
    static: (bodyA.friction.static + bodyB.friction.dynamic) * 0.5,
    dynamic: (bodyA.friction.static + bodyB.friction.dynamic) * 0.5
  };
  let frictionImpulse =
    -relativeVelocity.dot(tangent) / (bodyA.inverseMass + bodyB.inverseMass);

  if (Math.abs(frictionImpulse) >= impulse * friction.static) {
    frictionImpulse = -impulse * friction.dynamic;
  }

  bodyA.velocity.add(tangent, -frictionImpulse * bodyA.inverseMass);
  bodyB.velocity.add(tangent, frictionImpulse * bodyB.inverseMass);
}
