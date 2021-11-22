# Make It Until You Make It: RxJS
A fun exercise to try to understand a concept better is to try to implement it yourself. As an insight into this process, this article will follow my process of doing this for RxJS. Now, I have no intention for any of the code I'm writing for this to be used for any other purposes, so I will take shortcuts and cut corners where convenient and aim only to implement the broad concepts.

Since the purpose is to understand the goals of RxJS, we will avoid looking at the source code of RxJS and focus instead on the interface of the library, reverse engineering it based on knowledge about it from usage.

Also, as a quick aside, I may be a bit inconsistent with my use of the `public` visibility specifier in this. Part of this is because I am human and did not bother setting up a linter for this project, but I've also chosen to purposely omit it in some cases to keep lines shorter. 
### Observer
To start with, let's create the most basic interface of RxJS: the Observer

export type NextFunction<T> = (value: T) => void;
export type ErrorFunction = (error?: any) => void;
export type CompleteFunction = () => void;

export interface Observer<T> {
    next: NextFunction<T>;
    error: ErrorFunction;
    complete: CompleteFunction;
}

Since an `Observer` observes on a particular type, it takes a type parameter `T`.  We define 3 function properties on Observer, `next`, `error`, and `complete`. The `next` function is called when it observes an emitted value, so it takes a single value of type `T`. RxJS does not strongly type error types, so our `error` function takes `any`. Since a completion does not have an associated value, the `complete` handler takes no parameter. We've extracted the function types as `type`s so we can reuse them later. 

### Observable
Now that we have something that can observe, we need something for it to observe. We know that `Observable` in RxJS has static properties and functions, so we will use a `class` instead of an `interface`. To start with, we know we will need a `subscribe` function that takes an `Observer` and subscribes to it:
export class Observable<T> {
    subscribe(observer: Observer<T>): Subscription {
        // TODO: Subscribe
        return new Subscription();
    }
}
We've marked the return type as `Subscription`. We'll implement this class later, so for now, we will assume it is an empty class with a default constructor.

The next question is, _how do we subscribe?_ Furthermore, what _is_ subscribing? In this case, we can get a hint from the constructor. It takes a function, which takes an observer as a parameter, performs some actions using the observer, and then returns void. Let's add that constructor, and we'll just hold on to the function as a class property. We'll also extract the type of the function in case we need to reuse it later:

type ObservableBehavior<T> = (observer: Observer<T>) => void;

export class Observable<T> {
    constructor(protected behavior: ObservableBehavior<T>) {}

    subscribe(observer: Observer<T>): Subscription {
        // TODO: Subscribe
        return new Subscription();
    }
}

So how do we use this function to subscribe? Let's consider an example usage:
const x$ = new Observable<number>(obs => {
    let i = 0;
    setTimeout(_ => obs.next(i++), 500);
    setTimeout(_ => obs.next(i++), 1000);
    setTimeout(_ => obs.next(i++), 1500);
    setTimeout(_ => obs.complete(), 2000);
});

setTimeout(() => {
	x$.subscribe({
	    next: x => console.log('received', x),
	    error: e => console.error('oh no:', e),
	    complete: () => console.info('completed')
	});
}, 2000);


We expect this wait for 2 seconds, and then print the following, each line half a second after the last:
received 0
received 1
received 2
completed

This means that we need the behavior function to run, with the subscribing observer as input, as soon as we call `subscribe`. Translating this to code, we get:
type ObservableBehavior<T> = (observer: Observer<T>) => void;

export class Observable<T> {
    constructor(protected behavior: ObservableBehavior<T>) {}

    subscribe(observer: Observer<T>): Subscription {
        this.behavior(observer);

        // TODO: Manage the subscription
        return new Subscription();
    }
}

### Subscription - Simple Edition
Now let's manage that subscription. There is probably a much more elegant way to do this that is actually used in RxJS, especially since this method does not actually free up resources, but just to get the basic concept of being able to cancel a subscription, we will just focus on making the behavior stop. 

To do this, we will give the `Subscription` an `unsubscribe` function, which simply calls a `teardown` function we provide at construction time:
export class Subscription {
    private closed: boolean = false;

    constructor(private teardown: Function) { }

    public unsubscribe() {
        if (!this.closed) {
            this.closed = true;
            this.teardown();
        }
    }
}

Also, while we're here, RxJS subscriptions can be "added" to each other with the `add` function, so that when one subscription is unsubscribed, others added to it are as well. There is also a `remove` function to undo the adding.  We will implement this now since it is fairly simple. We just need to add a collection of child subscriptions which we will loop through and call `unsubscribe` on when unsubscribing:

export class Subscription {
    public id: symbol = Symbol();
    public children = new Map<symbol, Subscription>();
    private closed: boolean = false;

    constructor(private teardown: Function) { }

    public add(subscription: Subscription) {
        this.children.set(subscription.id, subscription);
    }

    public remove(subscription: Subscription) {
        this.children.delete(subscription.id);
    }

    public unsubscribe() {
        if (!this.closed) {
            this.closed = true;
            this.teardown();
        }

        for (const child of this.children.values()) {
            child.unsubscribe();
        }
    }
}

Notice that we added an `id` to each Subscription to use for lookup in `remove`.

Now, we can return to `Observable.subscribe`, where we need to create a `Subscription` and provide it with a teardown function that will stop the behavior of the subscription. One way to do this is the following:
subscribe(observer: Observer<T>): Subscription {
    const subscriptionObserver = {
        next: observer.next,
        error: observer.next,
        complete: observer.complete
    }

    const subscription = new Subscription(() => {
        subscriptionObserver.next = noOp;
        subscriptionObserver.error = noOp;
        subscriptionObserver.complete = noOp;
    });

    this.behavior(subscriptionObserver);
    return subscription;
}

where `noOp` is defined as follows:
export const noOp = () => {};


### Subscribing with Flexibility
But of course `Observable.subscribe` is more robust than simply taking an `Observer` with all 3 functions supplied, so let's implement some of the other options. First of all, we would like to support the following use cases:
something$.subscribe({
	next: x => console.log(x)
});
something$.subscribe({
	error: e => console.error(e)
});
something$.subscribe({
	next: x => console.log(x),
    complete: () => doSomething()
});
something$.subscribe({
	error: e => console.error(e),
    complete: () => console.log('it is done')
});

To do this, we need to allow a partial observer to be passed in. We could write `Partial<Observer<T>>` every time we use this, but I'm not a big fan of reading nested generics, so let's create a type `PartialObserver<T>`:
export type PartialObserver<T> = Partial<Observer<T>>;

With this, we can make use of the `noOp` from earlier to default the functions when subscribing:
subscribe(observer: PartialObserver<T>): Subscription {
    const subscriptionObserver = {
        next: observer.next ?? noOp,
        error: observer.next ?? noOp,
        complete: observer.complete ?? noOp
    }

    const subscription = new Subscription(() => {
        subscriptionObserver.next = noOp;
        subscriptionObserver.error = noOp;
        subscriptionObserver.complete = noOp;
    });

    this.behavior(subscriptionObserver);
    return subscription;
}

Note that we could alternatively make the `ObservableBehavior` type take a `PartialObserver`, but this would require nullish-checking inside of the behavior function whenever one of the observer's functions is called, and this is not required by RxJS, so we will instead provide default empty functions to the behavior function.

The other extremely common way to use `Observable.subscribe` is to pass in loose functions as separate parameters to `subscribe`:
something$.subscribe(console.log)
something$.subscribe(console.log, console.error)
something$.subscribe(
	x => console.log('received:', x),
	e => console.error('error:', e),
	() => console.log('completed')
)

To support this we need to add overloads for `subscribe`. However, JavaScript does not have overloading, so TypeScript requires us to check which type we have ourselves. To help with this, let's add an `isPartialObserver`  function:
export function isPartialObserver<T>(candidate: PartialObserver<T> | NextFunction<T>): candidate is PartialObserver<T> {
    return typeof candidate !== 'function'
}
Here we take as a parameter a candidate, which is either a `PartialObserver` or a `NextFunction`.  We can distinguish between the two based on the fact that one has type function and the other has type object.

Now, we need to implement this in `Observable`. To keep things simple, we'll extract our current `subscribe` behavior into a private function and call it (creatively) `_subscribe`:
subscribe(observer: PartialObserver<T>): Subscription {
	return this._subscribe(observer);
}

private _subscribe(observer: PartialObserver<T>): Subscription {
    const subscriptionObserver = {
        next: observer.next ?? noOp,
        error: observer.next ?? noOp,
        complete: observer.complete ?? noOp
    }

    const subscription = new Subscription(() => {
        subscriptionObserver.next = noOp;
        subscriptionObserver.error = noOp;
        subscriptionObserver.complete = noOp;
    });

    this.behavior(subscriptionObserver);
    return subscription;
}

Our method signature needs to allow the first parameter to be either a `PartialObserver` or a `NextFunction`, and then have two optional parameters  for the `ErrorFunction` and `CompleteFunction`:
subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction)

The actual implementation is fairly simple with our handy `isPartialObserver` function. All we need to do is call the `_subscribe` function, and either pass in the observer from the first parameter, or create an observer from the 3 function parameters and call `_subscribe` with that:
subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription {
    return this._subscribe(isPartialObserver<T>(observerOrNext) ? observerOrNext : { next: observerOrNext, error: error, complete: complete });
}

To help with type-checking, we can provide type signatures for the two options for calling this function:
subscribe(observer: PartialObserver<T>): Subscription;
subscribe(next: NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription;

Our `Observable` class has evolved a lot so far, so let's recap by showing the whole class:
export class Observable<T> {
    constructor(protected behavior: ObservableBehavior<T>) {}

    subscribe(observer: PartialObserver<T>): Subscription;
    subscribe(next: NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription;
    subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription {
        return this._subscribe(isPartialObserver<T>(observerOrNext) ? observerOrNext : { next: observerOrNext, error: error, complete: complete });
    }

    private _subscribe(observer: PartialObserver<T>): Subscription {
        const subscriptionObserver = {
            next: observer.next ?? noOp,
            error: observer.next ?? noOp,
            complete: observer.complete ?? noOp
        }

        const subscription = new Subscription(() => {
            subscriptionObserver.next = noOp;
            subscriptionObserver.error = noOp;
            subscriptionObserver.complete = noOp;
        });

        this.behavior(subscriptionObserver);
        return subscription;
    }
}

### Converting values to observables
// TODO: Write up my implementation of `of` and `from`

### Changing the Subject
// TODO: Write up my implementation of `Subject`

### Let's Talk about Your Behavior
// TODO: Write up my implementation of `BehaviorSubject`