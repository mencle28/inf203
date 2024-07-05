import {Stud, ForStudent} from "./exercise3.mjs";

import fs from 'fs';

export class Prmtn {
  constructor() {
    this.students = [];
  }

  add(student) {
    this.students.push(student);
  }

  size() {
    return this.students.length;
  }

  get(i) {
    return this.students[i];
  }

  print() {
    let output = '';
    for (const student of this.students) {
      output += student.toString() + '\n';
    }
    return output;
  }

  write() {
    const serializedPromotion = JSON.stringify(this.students);
    return serializedPromotion;
  }

  read(str) {
    const parsedPromotion = JSON.parse(str);
    this.students = parsedPromotion;
  }

  saveF(fileName) {
    const serializedPromotion = this.write();
    fs.writeFileSync(fileName, serializedPromotion);
  }

  readFile(fileName) {
    const fileContents = fs.readFileSync(fileName, 'utf-8');
    this.read(fileContents);
  }
}

