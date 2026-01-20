import { describe, it, expect, beforeEach } from 'vitest';
import State from '../../src/core/State.js';
import Bus from '../../src/core/Bus.js';

describe('Core State', () => {
    
    it('should initialize with default values', () => {
        expect(State.resources.nakasthu).toBe(50);
        expect(State.portal.stability).toBe(100);
        expect(State.game.day).toBe(1);
        
        // Telemetry check
        expect(State.telemetry).toBeDefined();
        expect(State.telemetry.history).toEqual([]);
        expect(State.telemetry.stats.totalProcessed).toBe(0);
    });

    it('should emit STATE_UPDATED when modified', () => {
        let eventFired = false;
        const handler = () => { eventFired = true; };
        
        Bus.on('STATE_UPDATED', handler);
        
        // Update top-level property to trigger Proxy setter
        State.resources = { ...State.resources, nakasthu: 55 };
        
        expect(State.resources.nakasthu).toBe(55);
        expect(eventFired).toBe(true);
        
        Bus.off('STATE_UPDATED', handler);
    });
});
