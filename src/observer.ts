// TODO: consider what implementing error typing like in Combine would look like
export type NextFunction<T> = (value: T) => void;
export type ErrorFunction = (error?: any) => void;
export type CompleteFunction = () => void;
export type PartialObserver<T> = Partial<Observer<T>>;

export interface Observer<T> {
    next: NextFunction<T>;
    error: ErrorFunction;
    complete: CompleteFunction;
}

// Note that type parameter is not actually type checked by function. This is only for casting purposes.
export function isObserver<T = any>(candidate: any): candidate is Observer<T> {
    if (typeof candidate !== 'object') {
        return false;
    }

    return (candidate.next === undefined || typeof candidate.next === 'function') &&
        (candidate.error === undefined || typeof candidate.error === 'function') &&
        (candidate.complete === undefined || typeof candidate.complete === 'function');
}

export function isPartialObserver<T>(candidate: PartialObserver<T> | NextFunction<T>): candidate is PartialObserver<T> {
    return typeof candidate !== 'function'
}
