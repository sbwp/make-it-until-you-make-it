"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPartialObserver = exports.isObserver = void 0;
// Note that type parameter is not actually type checked by function. This is only for casting purposes.
function isObserver(candidate) {
    if (typeof candidate !== 'object') {
        return false;
    }
    return (candidate.next === undefined || typeof candidate.next === 'function') &&
        (candidate.error === undefined || typeof candidate.error === 'function') &&
        (candidate.complete === undefined || typeof candidate.complete === 'function');
}
exports.isObserver = isObserver;
function isPartialObserver(candidate) {
    return typeof candidate !== 'function';
}
exports.isPartialObserver = isPartialObserver;
