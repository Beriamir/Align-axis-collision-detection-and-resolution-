import { Vector } from './Vector.js';

export function detect(bodyA, bodyB) {
  const normal = new Vector();
  let depth = Infinity;

  const closestVertexIndex = (center, vertices) => {
    let result = -1;
    let minDistanceSq = Infinity;

    for (let i = 0; i < vertices.length; i++) {
      const distanceSq = Vector.distanceSq(vertices[i], center);

      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        result = i;
      }
    }

    return result;
  };

  const projectCircle = (center, radius, axis) => {
    const projection = center.dot(axis);

    return {
      min: projection - radius,
      max: projection + radius
    };
  };

  const projectPolygon = (vertices, axis) => {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < vertices.length; i++) {
      const projection = vertices[i].dot(axis);

      if (projection < min) min = projection;
      if (projection > max) max = projection;
    }

    return {
      min,
      max
    };
  };

  const closestVertex =
    bodyB.vertices[closestVertexIndex(bodyA.position, bodyB.vertices)];
  const axisA = Vector.subtract(closestVertex, bodyA.position);
  const axesB = [new Vector(1, 0), new Vector(0, 1)];

  for (let axis of [axisA.normalize(), ...axesB]) {
    const projA = projectCircle(bodyA.position, bodyA.radius, axis);
    const projB = projectPolygon(bodyB.vertices, axis);

    if (projA.min > projB.max || projB.min > projA.max) {
      return {
        detection: false,
        normal: new Vector(),
        depth: Number.MAX_VALUE
      };
    }

    const axisDepth = Math.min(projA.max - projB.min, projB.max - projA.min);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal.copy(axis);
    }

    const centerB = bodyB.getCentroid();
    const direction = Vector.subtract(centerB, bodyA.position);

    if (direction.dot(normal) < 0) normal.negate();
  }

  return {
    detection: true,
    normal,
    depth
  };
}

export function separate(bodyA, bodyB, normal, depth) {
  if (bodyA.isStatic && !bodyB.isStatic) {
    bodyB.vertices.forEach(vertex => {
      vertex.add(normal, depth);
    });
  } else if (!bodyA.isStatic && bodyB.isStatic) {
    bodyA.position.add(normal, -depth);
  } else if (!bodyA.isStatic && !bodyB.isStatic) {
    bodyA.position.add(normal, -depth / 2);
    bodyB.vertices.forEach(vertex => {
      vertex.add(normal, depth / 2);
    });
  }
}
