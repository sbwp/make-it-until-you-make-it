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
