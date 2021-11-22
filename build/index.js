"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("./observable");
var Bar = Foo.Bar;
const bar = new Bar();
console.log(bar.x);
const x$ = new observable_1.Observable(obs => {
    let i = 0;
    setTimeout(_ => obs.next(i++), 500);
    setTimeout(_ => obs.next(i++), 1000);
    setTimeout(_ => obs.next(i++), 1500);
    setTimeout(_ => obs.next(i++), 2000);
    setTimeout(_ => obs.next(i++), 2500);
    setTimeout(_ => obs.next(i++), 3000);
    setTimeout(_ => obs.next(i++), 3500);
    setTimeout(_ => obs.next(i++), 4000);
    setTimeout(_ => obs.next(i++), 4500);
    setTimeout(_ => obs.next(i++), 5000);
    // setTimeout(_ => console.log('not outputting, just logging', i), 5500);
    setTimeout(_ => obs.complete(), 5000);
});
const subs = x$.subscribe({
    next: x => console.log('received', x),
    error: e => console.error('oh no:', e),
    complete: () => console.info('completed')
});
setTimeout(_ => subs.unsubscribe(), 3000);
// const subject = new Subject<number>();
//
// x$.subscribe(subject);
//
// const subs1 = subject.subscribe({
//     next: x => console.log('immediate subscription next:', x),
//     error: e => console.error('immediate subscription error:', e),
//     complete: () => console.info('immediate subscription complete')
// });
//
// setTimeout(() => {
//     const subs2 = subject.asObservable().subscribe({
//         next: x => console.log('delayed subscription next:', x),
//         error: e => console.error('delayed subscription error:', e),
//         complete: () => console.info('delayed subscription complete')
//     });
// }, 3000);
//
// setTimeout(() => {
//     const subs3 = subject.subscribe({
//         next: x => console.log('later delayed subscription next:', x),
//         error: e => console.error('later delayed subscription error:', e),
//         complete: () => console.info('later delayed subscription complete')
//     });
// }, 6000);
//
// const bSubject = new BehaviorSubject(7);
//
// x$.subscribe(bSubject);
//
// bSubject.subscribe({
//     next: x => console.log('received', x),
//     error: e => console.error('oh no:', e),
//     complete: () => console.info('completed')
// });
