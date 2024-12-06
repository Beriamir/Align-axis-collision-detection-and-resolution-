import { Vector } from './Vector.js';
import { Circle } from './Circle.js';
import { Rectangle } from './Rectangle.js';
import * as CircleCollision from './CircleCollision.js';
import * as RectangleCollision from './RectangleCollision.js';
import * as CircleRectangleCollision from './CircleRectangleCollision.js';
import { resolveCollision } from './resolveCollision.js';

function main() {
  const framesPerSecond = 60;
  const timeInterval = 1000 / framesPerSecond;
  let timeAccumulator = timeInterval;
  let previousTime = 0;

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const width = innerWidth;
  const height = innerHeight;
  const pixelDense = Math.round(devicePixelRatio);

  const subSteps = 8;
  const pointer = new Vector(width / 2, height / 2);
  const gravity = new Vector(0, 9.81);

  const bodies = [];
  const maxSize = 40;
  const minSize = 20;

  function initialize() {
    canvas.width = width * pixelDense;
    canvas.height = height * pixelDense;
    ctx.scale(pixelDense, pixelDense);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    createGround();
    // createCircles(20);
    // createRectangles(20);
  }

  function createCircles(amount) {
    for (let i = 0; i < amount; i++) {
      const radius = Math.random() * maxSize + minSize;
      const x = Math.random() * (width - radius * 2) + radius;
      const y = Math.random() * (height - radius * 2) + radius;
      const option = {
        velocity: new Vector().random().scale(0.1)
      };

      const circle = new Circle(x, y, radius, option);
      bodies.push(circle);
    }
  }

  function createRectangles(amount) {
    for (let i = 0; i < amount; i++) {
      const rectWidth = Math.random() * maxSize + minSize;
      const rectHeight = Math.random() * maxSize + minSize;
      const x = Math.random() * (width - rectWidth * 2) + rectWidth;
      const y = Math.random() * (height - rectHeight * 2) + rectHeight;
      const option = {
        velocity: new Vector().random().scale(0.1)
      };

      const rect = new Rectangle(x, y, rectWidth, rectHeight, option);
      bodies.push(rect);
    }
  }

  function createGround() {
    const groundWidth = width * 0.8;
    const groundHeight = 40;
    const x = width / 2;
    const y = height * 0.8;
    const option = {
      isStatic: true
    };

    const ground = new Rectangle(x, y, groundWidth, groundHeight, option);
    bodies.push(ground);
  }

  function throttle(callback, delay) {
    let lastTime = 0;
    return function (...args) {
      const now = performance.now();
      if (now - lastTime > delay) {
        lastTime = now;
        return callback(...args);
      }
    };
  }

  window.addEventListener('pointerdown', event => {
    pointer.set(event.offsetX, event.offsetY);
    const circleRadius = Math.random() * maxSize + minSize;
    const rectWidth = Math.random() * maxSize + minSize;
    const rectHeight = Math.random() * maxSize + minSize;
    let x = null,
      y = null;
    const option = {};

    if (Math.random() - 0.5 > 0) {
      x = Math.random() * (width - circleRadius * 2) + circleRadius;
      y = Math.random() * (height - circleRadius * 2) + circleRadius;

      bodies.push(new Circle(pointer.x, pointer.y, circleRadius, option));
    } else {
      x = Math.random() * (width - rectWidth * 2) + rectWidth;
      y = Math.random() * (height - rectHeight * 2) + rectHeight;

      bodies.push(
        new Rectangle(pointer.x, pointer.y, rectWidth, rectHeight, option)
      );
    }
  });

  window.addEventListener(
    'pointermove',
    throttle(event => {
      pointer.set(event.offsetX, event.offsetY);
      const circleRadius = Math.random() * maxSize + minSize;
      const rectWidth = Math.random() * maxSize + minSize;
      const rectHeight = Math.random() * maxSize + minSize;
      let x = null,
        y = null;
      const option = {
        velocity: new Vector().random().scale(0.5)
      };

      if (Math.random() - 0.5 > 0) {
        x = Math.random() * (width - circleRadius * 2) + circleRadius;
        y = Math.random() * (height - circleRadius * 2) + circleRadius;

        bodies.push(new Circle(pointer.x, pointer.y, circleRadius, option));
      } else {
        x = Math.random() * (width - rectWidth * 2) + rectWidth;
        y = Math.random() * (height - rectHeight * 2) + rectHeight;

        bodies.push(
          new Rectangle(pointer.x, pointer.y, rectWidth, rectHeight, option)
        );
      }
    }, 50)
  );

  function step(currentTime) {
    const deltaTime = currentTime - previousTime;
    timeAccumulator += deltaTime;
    previousTime = currentTime;

    if (timeAccumulator > timeInterval) {
      for (let subStep = 0; subStep < subSteps; subStep++) {
        // Simulate
        for (let i = 0; i < bodies.length; i++) {
          const body = bodies[i];

          body.force.add(gravity);
          body.acceleration = Vector.scale(body.force, body.inverseMass);
          body.velocity.add(body.acceleration, deltaTime / subSteps);

          if (body.shape === 'circle') {
            body.position.add(body.velocity, deltaTime / subSteps);
          } else if (body.shape === 'rectangle') {
            body.vertices.forEach(vertex => {
              vertex.add(body.velocity, deltaTime / subSteps);
            });
          }

          body.force.zero();
        }

        // Collision
        for (let i = 0; i < bodies.length; i++) {
          const bodyA = bodies[i];
          for (let j = i + 1; j < bodies.length; j++) {
            const bodyB = bodies[j];
            
            if (bodyA === bodyB) continue;

            const boundA = RectangleCollision.getAABoundingBox(bodyA);
            const boundB = RectangleCollision.getAABoundingBox(bodyB);
            
            if (
              !(
                boundA.maxX > boundB.minX &&
                boundA.maxY > boundB.minY &&
                boundA.minX < boundB.maxX &&
                boundA.minY < boundB.maxY
              )
            ) {
              continue;
            }
            
            if (bodyA.shape === 'rectangle' && bodyB.shape === 'rectangle') {
              const { detection, normal, depth } = RectangleCollision.detect(
                bodyA,
                bodyB
              );

              if (detection) {
                RectangleCollision.separate(bodyA, bodyB, normal, depth);
                resolveCollision(bodyA, bodyB, normal);
              }
            } else if (bodyA.shape === 'circle' && bodyB.shape === 'circle') {
              const { detection, normal, depth } = CircleCollision.detect(
                bodyA,
                bodyB
              );

              if (detection) {
                CircleCollision.separate(bodyA, bodyB, normal, depth);
                resolveCollision(bodyA, bodyB, normal);
              }
            }

            if (bodyA.shape === 'circle') {
              if (bodyB.shape === 'rectangle') {
                const { detection, normal, depth } =
                  CircleRectangleCollision.detect(bodyA, bodyB);

                if (detection) {
                  CircleRectangleCollision.separate(
                    bodyA,
                    bodyB,
                    normal,
                    depth
                  );
                  resolveCollision(bodyA, bodyB, normal);
                }
              }
            } else if (bodyA.shape === 'rectangle') {
              if (bodyB.shape === 'circle') {
                const { detection, normal, depth } =
                  CircleRectangleCollision.detect(bodyB, bodyA);

                if (detection) {
                  CircleRectangleCollision.separate(
                    bodyB,
                    bodyA,
                    normal,
                    depth
                  );
                  resolveCollision(bodyB, bodyA, normal);
                }
              }
            }
          }
        }
      }

      // Render
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];

        if (body.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(
            body.position.x,
            body.position.y,
            body.radius,
            0,
            Math.PI * 2
          );
          ctx.closePath();
        } else if (body.shape === 'rectangle') {
          ctx.beginPath();
          ctx.moveTo(body.vertices[0].x, body.vertices[0].y);
          ctx.lineTo(body.vertices[1].x, body.vertices[1].y);
          ctx.lineTo(body.vertices[2].x, body.vertices[2].y);
          ctx.lineTo(body.vertices[3].x, body.vertices[3].y);
          ctx.closePath();
        }
        
        ctx.fillStyle = body.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
      }

      // Remove offscreen bodies
      for (let i = 0; i < bodies.length; i++) {
        const bound = RectangleCollision.getAABoundingBox(bodies[i]);

        if (bound.maxX < 0) {
          bodies.splice(i, 1);
        } else if (bound.minX > width) {
          bodies.splice(i, 1);
        }

        if (bound.maxY < 0) {
          bodies.splice(i, 1);
        } else if (bound.minY > height) {
          bodies.splice(i, 1);
        }
      }

      // Write total body counts and other settings
      const fontSize = 16;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'start';
      ctx.fillStyle = 'white';
      ctx.fillText(
        `Bodies: ${bodies.length.toString()}`,
        fontSize,
        fontSize * 1
      );
      ctx.fillText(
        `Time: ${deltaTime.toFixed(2).toString()}ms`,
        fontSize,
        fontSize * 2
      );

      timeAccumulator = 0;
    }

    requestAnimationFrame(step);
  }

  initialize();

  step(performance.now());
}

main();
