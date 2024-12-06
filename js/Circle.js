import { Vector } from './Vector.js';

export class Circle {
  constructor(x, y, radius, option = {}) {
    this.position = new Vector(x, y);
    this.radius = radius / 2;
    this.area = (this.radius * this.radius) * Math.PI;
    
    this.material = 'Aluminum';
    this.friction = { static: 0.08, dynamic: 0.06 };
    this.restitution = option.restitution || 0.9;
    this.density = 2700; 
    this.thickness = 0.005;
    this.mass = this.density * this.area * this.thickness;
    this.inverseMass = 1 / this.mass;
    
    this.force = new Vector();
    this.acceleration = new Vector();
    this.velocity = option.velocity || new Vector();
    this.angularVelocity = 0;
    
    this.shape = 'circle';
    this.isStatic = option.isStatic || false;
    this.colors = [
      '#fc39ed',
      '#39fc4c',
      '#3963fc',
      '#fc6d39',
      '#fc396a',
      '#fcea39',
      '#fc3939',
      '#39fce6',
      '#255df4'
    ];
    this.color =
      option.color ||
      this.colors[Math.floor(Math.random() * this.colors.length)];

    if (this.isStatic) {
      this.inverseMass = 0;
      this.restitution = 1;
      this.color = '#8d8d8d';
    }
  }
}