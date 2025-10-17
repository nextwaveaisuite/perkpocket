// Offer Tracking System - Manages completed offers lifecycle
class OfferTracker {
    constructor() {
        this.storageKey = 'perkpocket_offer_tracker';
        this.ARCHIVE_DAYS = 30; // Days before paid offers are deleted
        this.init();
    }

    init() {
        this.cleanupOldOffers();
    }

    getTrackerData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : { completed: [] };
    }

    saveTrackerData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    completeOffer(offer) {
        const data = this.getTrackerData();
        const completion = {
            offerId: offer.id,
            title: offer.title,
            payout: offer.payout,
            completedDate: new Date().toISOString(),
            status: 'pending', // pending, paid
            paidDate: null
        };
        data.completed.push(completion);
        this.saveTrackerData(data);
        return completion;
    }

    markAsPaid(offerId) {
        const data = this.getTrackerData();
        const offer = data.completed.find(o => o.offerId === offerId);
        if (offer) {
            offer.status = 'paid';
            offer.paidDate = new Date().toISOString();
            this.saveTrackerData(data);
        }
    }

    getPendingOffers() {
        const data = this.getTrackerData();
        return data.completed.filter(o => o.status === 'pending');
    }

    getPaidOffers() {
        const data = this.getTrackerData();
        return data.completed.filter(o => o.status === 'paid');
    }

    getTotalEarnings() {
        const data = this.getTrackerData();
        return data.completed
            .filter(o => o.status === 'paid')
            .reduce((sum, o) => sum + o.payout, 0);
    }

    getPendingEarnings() {
        const data = this.getTrackerData();
        return data.completed
            .filter(o => o.status === 'pending')
            .reduce((sum, o => sum + o.payout, 0);
    }

    cleanupOldOffers() {
        const data = this.getTrackerData();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.ARCHIVE_DAYS);

        const before = data.completed.length;
        data.completed = data.completed.filter(offer => {
            if (offer.status === 'paid' && offer.paidDate) {
                const paidDate = new Date(offer.paidDate);
                return paidDate > cutoffDate; // Keep if within archive period
            }
            return true; // Keep all pending offers
        });

        const removed = before - data.completed.length;
        if (removed > 0) {
            this.saveTrackerData(data);
            console.log(`Cleaned up ${removed} old paid offers`);
        }
    }

    getDaysSincePaid(paidDate) {
        const paid = new Date(paidDate);
        const now = new Date();
        const diff = now - paid;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    getCompletedOfferIds() {
        const data = this.getTrackerData();
        return data.completed.map(o => o.offerId);
    }
}

window.offerTracker = new OfferTracker();
