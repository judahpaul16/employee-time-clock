export class Employee {
    id: string;
 
    constructor(id: string) {
      this.id = id;
    }
 
    clockIn() {
      console.log(`Employee ${this.id} clocked in.`);
    }
 
    clockOut() {
      console.log(`Employee ${this.id} clocked out.`);
    }
  }