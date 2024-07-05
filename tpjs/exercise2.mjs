"use strict";


export function wcount(str) {
    const words = str.split(" ");
    const wordCount = {};
  
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
  
      if (wordCount[word]) {
        wordCount[word]++;
      } else {
        wordCount[word] = 1;
      }
    }
  
    return wordCount;
  }

  

  export class WList {
    constructor(str) {
      this.words = str.split(" ").sort();
      this.uniqueWords = new Set(this.words);
      this.wordCount = {};
  
      for (let i = 0; i < this.words.length; i++) {
        const word = this.words[i];
  
        if (this.wordCount[word]) {
          this.wordCount[word]++;
        } else {
          this.wordCount[word] = 1;
        }
      }
    }
  
    getWords() {
      return Array.from(this.uniqueWords.values());
    }
  
    maxCountWord() {
      let maxCount = 0;
      let maxWord = "";
      let list_values=Array.from(this.uniqueWords.values())
      for (let i = 0; i < list_values.length; i++) {
        const word = list_values[i];
        const count = this.wordCount[word];
  
        if (count > maxCount) {
          maxCount = count;
          maxWord = word;
        }
      }
  
      return maxWord;
    }
  
    minCountWord() {
      let minCount = Infinity;
      let minWord = "";
      let list_values=Array.from(this.uniqueWords.values())
  
      for (let i = 0; i < list_values.length; i++) {
        const word = list_values[i];
        const count = this.wordCount[word];
  
        if (count < minCount) {
          minCount = count;
          minWord = word;
        }
      }
  
      return minWord;
    }
  
    getCount(word) {
      return this.wordCount[word] || 0;
    }
    applyWordFunc(f) {
        return Array.from(this.uniqueWords.values()).map(x=>f(x));
    }
  }
  
    