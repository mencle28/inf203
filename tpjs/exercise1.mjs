"use strict";

// programming with a loop
export function fibonaIt(n) {
    var fib=1;
    var prefib=0;
    if (n==0) {
        return 0;
    }
    for (let index = 0; index < n; index++) {
        const new_fib=fib + prefib;
        prefib=fib;
        fib=new_fib
    }
    return prefib;
}

// recursive version
export function fibo_rec(n) {
    if(n==0){
        return 0;
    }
    if (n==1) {
        return 1;
    } else {
        return fibo_rec(n-1) + fibo_rec(n-2);
    }
}

// process array, no map
export function fibArr(t) {
    for (let index = 0; index < t.length; index++) {
        const fib = fibo_rec(t[index]);
        t[index]=fib;
    }
    return t;
}

// with map
export function fibMap(t) {
    return t.map(x => fibo_rec(x));
}