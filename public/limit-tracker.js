// Daily Limit Tracker for PerkPocket
class LimitTracker {
    constructor() {
        this.DAILY_LIMIT = 10; // Maximum offers per day
        this.storageKey = 'perkpocket_daily_tracker';
        this.init();
    }

    init() {
        this.checkAndResetIfNeeded();
    }

    getTrackerData() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) {
            return this.createNewTracker();
        }
        return JSON.parse(stored);
    }

    createNewTracker() {
        return {
            date: new Date().toDateString(),
            completed: [],
            count: 0
        };
    }

    checkAndResetIfNeeded() {
        const data = this.getTrackerData();
        const today = new Date().toDateString();
        
        if (data.date !== today) {
            // New day - reset
            const newData = this.createNewTracker();
            localStorage.setItem(this.storageKey, JSON.stringify(newData));
            return newData;
        }
        return data;
    }

    canComplete() {
        const data = this.checkAndResetIfNeeded();
        return data.count < this.DAILY_LIMIT;
    }

    getRemainingOffers() {
        const data = this.checkAndResetIfNeeded();
        return Math.max(0, this.DAILY_LIMIT - data.count);
    }

    getCompletedCount() {
        const data = this.checkAndResetIfNeeded();
        return data.count;
    }

    markCompleted(offerId) {
        const data = this.checkAndResetIfNeeded();
        
        if (data.completed.includes(offerId)) {
            return { success: false, message: 'Already completed today' };
        }

        if (data.count >= this.DAILY_LIMIT) {
            return { success: false, message: 'Daily limit reached' };
        }

        data.completed.push(offerId);
        data.count++;
        localStorage.setItem(this.storageKey, JSON.stringify(data));

        return { 
            success: true, 
            remaining: this.DAILY_LIMIT - data.count,
            message: `Offer completed! ${this.DAILY_LIMIT - data.count} remaining today`
        };
    }

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    isCompleted(offerId) {
        const data = this.checkAndResetIfNeeded();
        return data.completed.includes(offerId);
    }
}

// Initialize global tracker
window.limitTracker = new LimitTracker();
