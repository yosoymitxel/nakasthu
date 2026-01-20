import { describe, it, expect, vi } from 'vitest';
import Bus from '../../src/core/Bus.js';

describe('Event Bus System', () => {
    it('should register and emit events correctly', () => {
        const callback = vi.fn();
        const testData = { id: 'TEST_01', val: 100 };

        Bus.on('TEST_EVENT', callback);
        Bus.emit('TEST_EVENT', testData);

        expect(callback).toHaveBeenCalledWith(testData);
        
        Bus.off('TEST_EVENT', callback);
    });

    it('should allow multiple listeners for the same event', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();

        Bus.on('MULTI_EVENT', cb1);
        Bus.on('MULTI_EVENT', cb2);
        Bus.emit('MULTI_EVENT');

        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();

        Bus.off('MULTI_EVENT', cb1);
        Bus.off('MULTI_EVENT', cb2);
    });

    it('should correctly remove listeners with off()', () => {
        const callback = vi.fn();

        Bus.on('OFF_EVENT', callback);
        Bus.off('OFF_EVENT', callback);
        Bus.emit('OFF_EVENT');

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle one() for single-execution events', () => {
        const callback = vi.fn();

        Bus.one('ONE_TIME', callback);
        Bus.emit('ONE_TIME');
        Bus.emit('ONE_TIME');

        expect(callback).toHaveBeenCalledTimes(1);
    });
});
