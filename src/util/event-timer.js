export default class EventTimer {

    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    start(startTime, tickTimeout, tickEventKey, stopTimeout, stopEventKey) {
        let stopTime = startTime.getTime() + stopTimeout;

        this.intervalId = window.setInterval(() => {
            let currentTime = new Date().getTime();
            if (currentTime > stopTime) {
                this.clear();
                this.eventAggregator.publish(stopEventKey);
            } else {
                this.eventAggregator.publish(tickEventKey);
            }
        }, tickTimeout);
    }

    clear() {
        window.clearInterval(this.intervalId);
    }
}
