import { Vector } from './Vector.js';

export function getAABoundingBox(body) {
  let minX = Infinity;
  let minY = Infinity;

  let maxX = -Infinity;
  let maxY = -Infinity;

  if (body.shape === 'rectangle') {
    for (const vertex of body.vertices) {
      if (vertex.x < minX) minX = vertex.x;
      if (vertex.y < minY) minY = vertex.y;

      if (vertex.x > maxX) maxX = vertex.x;
      if (vertex.y > maxY) maxY = vertex.y;
    }
  } else if (body.shape === 'circle') {
    minX = body.position.x - body.radius;
    minY = body.position.y - body.radius;

    maxX = body.position.x + body.radius;
    maxY = body.position.y + body.radius;
  }

  return { minX, minY, maxX, maxY };
}

export function detect(bodyA, bodyB) {
  const boundA = getAABoundingBox(bodyA);
  const boundB = getAABoundingBox(bodyB);

  if (
    !(
      boundA.maxX > boundB.minX &&
      boundA.maxY > boundB.minY &&
      boundA.minX < boundB.maxX &&
      boundA.minY < boundB.maxY
    )
  ) {
    return {
      detection: false,
      normal: new Vector(),
      depth: Number.MAX_VALUE
    };
  }

  const normal = new Vector();
  let depth = Infinity;
  const depthX = Math.min(boundB.maxX - boundA.minX, boundA.maxX - boundB.minX);
  const depthY = Math.min(boundB.maxY - boundA.minY, boundA.maxY - boundB.minY);

  if (depthX < depth) {
    depth = depthX;
    normal.set(1, 0); // x-axis
  }

  if (depthY < depth) {
    depth = depthY;
    normal.set(0, 1); // y-axis
  }

  const centerA = bodyA.getCentroid();
  const centerB = bodyB.getCentroid();
  const direction = Vector.subtract(centerB, centerA);

  if (direction.dot(normal) < 0) normal.negate();

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
    bodyA.vertices.forEach(vertex => {
      vertex.add(normal, -depth);
    });
  } else if (!bodyA.isStatic && !bodyB.isStatic) {
    bodyA.vertices.forEach(vertex => {
      vertex.add(normal, -depth / 2);
    });
    bodyB.vertices.forEach(vertex => {
      vertex.add(normal, depth / 2);
    });
  }
}
