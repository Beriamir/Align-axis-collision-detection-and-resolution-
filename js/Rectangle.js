import { Vector } from './Vector.js';

export class Rectangle {
  constructor(x, y, width, height, option = {}) {
    this.width = width / 2;
    this.height = height / 2;
    this.area = this.width * this.height * 4;
    
    this.vertices = [
      new Vector(x - this.width, y - this.height),
      new Vector(x + this.width, y - this.height),
      new Vector(x + this.width, y + this.height),
      new Vector(x - this.width, y + this.height)
    ];
    
    this.material = 'Aluminum';
    this.friction = { static: 0.08, dynamic: 0.06 };
    this.restitution = option.restitution || 0.6;
    this.density = 2700; 
    this.thickness = 0.005;
    this.mass = this.density * this.area * this.thickness;
    this.inverseMass = 1 / this.mass;
    
    this.force = new Vector();
    this.acceleration = null;
    this.velocity = option.velocity || new Vector();
    this.angularVelocity = 0;
    
    this.shape = 'rectangle';
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
  
  getCentroid() {
    const sumX = this.vertices.reduce((sum, v) => sum += v.x, 0);
    const sumY = this.vertices.reduce((sum, v) => sum += v.y, 0);
    const count = this.vertices.length;
    
    return new Vector(sumX / count, sumY / count);
  }
}