// My Offers Dashboard - Shows user's completed offers
class MyOffersDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.createDashboard();
        this.updateDashboard();
        // Update every 5 seconds
        setInterval(() => this.updateDashboard(), 5000);
    }

    createDashboard() {
        const existing = document.getElementById('myOffersDashboard');
        if (existing) return;

        const dashboard = document.createElement('div');
        dashboard.id = 'myOffersDashboard';
        dashboard.innerHTML = `
            <div style="background: #1a1f2e; border: 1px solid #3a4451; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #ffd700; margin-bottom: 20px;">📊 My Offers Dashboard</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: #2a3441; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #4ade80;" id="totalEarned">$0.00</div>
                        <div style="color: #b0b0b0; font-size: 14px;">Total Earned</div>
                    </div>
                    <div style="background: #2a3441; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #fbbf24;" id="pendingEarnings">$0.00</div>
                        <div style="color: #b0b0b0; font-size: 14px;">Pending Payment</div>
                    </div>
                    <div style="background: #2a3441; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #4a90e2;" id="totalCompleted">0</div>
                        <div style="color: #b0b0b0; font-size: 14px;">Offers Completed</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h3 style="color: #fbbf24; margin-bottom: 15px;">⏳ Pending Offers</h3>
                        <div id="pendingOffersList" style="max-height: 300px; overflow-y: auto;"></div>
                    </div>
                    <div>
                        <h3 style="color: #4ade80; margin-bottom: 15px;">✅ Paid Offers</h3>
                        <div id="paidOffersList" style="max-height: 300px; overflow-y: auto;"></div>
                    </div>
                </div>
            </div>
        `;

        const container = document.querySelector('.container') || document.body;
        container.insertBefore(dashboard, container.firstChild);
    }

    updateDashboard() {
        const totalEarned = window.offerTracker.getTotalEarnings();
        const pendingEarnings = window.offerTracker.getPendingEarnings();
        const pending = window.offerTracker.getPendingOffers();
        const paid = window.offerTracker.getPaidOffers();

        document.getElementById('totalEarned').textContent = `$${totalEarned.toFixed(2)}`;
        document.getElementById('pendingEarnings').textContent = `$${pendingEarnings.toFixed(2)}`;
        document.getElementById('totalCompleted').textContent = pending.length + paid.length;

        this.renderOfferList('pendingOffersList', pending, 'pending');
        this.renderOfferList('paidOffersList', paid, 'paid');
    }

    renderOfferList(containerId, offers, status) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (offers.length === 0) {
            container.innerHTML = `<div style="color: #b0b0b0; text-align: center; padding: 20px;">No ${status} offers</div>`;
            return;
        }

        container.innerHTML = offers.map(offer => {
            const date = new Date(offer.completedDate).toLocaleDateString();
            const daysSince = status === 'paid' && offer.paidDate ? 
                window.offerTracker.getDaysSincePaid(offer.paidDate) : null;
            const daysRemaining = daysSince !== null ? 30 - daysSince : null;

            return `
                <div style="background: #2a3441; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid ${status === 'paid' ? '#4ade80' : '#fbbf24'};">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #e6e6e6; margin-bottom: 4px;">${offer.title}</div>
                            <div style="font-size: 12px; color: #b0b0b0;">Completed: ${date}</div>
                            ${daysRemaining !== null ? `<div style="font-size: 12px; color: #b0b0b0;">Deletes in: ${daysRemaining} days</div>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: bold; color: ${status === 'paid' ? '#4ade80' : '#fbbf24'};">$${offer.payout.toFixed(2)}</div>
                            ${status === 'pending' ? `<button onclick="myOffers.markPaid('${offer.offerId}')" style="margin-top: 5px; padding: 4px 8px; background: #4ade80; border: none; border-radius: 4px; color: #000; font-size: 11px; cursor: pointer;">Mark Paid</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    markPaid(offerId) {
        window.offerTracker.markAsPaid(offerId);
        this.updateDashboard();
        alert('Offer marked as paid! Will be archived after 30 days.');
    }
}

let myOffers;
document.addEventListener('DOMContentLoaded', () => {
    myOffers = new MyOffersDashboard();
});
