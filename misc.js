module.exports = {
    estimateTime: function(pages, members) {
        var seconds = (pages + (pages * 0.100));
        if (seconds > 59.9) {
            var minutes = (seconds/60).toFixed(0);
            var leftover = (seconds%60).toFixed(0);
            if (leftover > 0) {
                return `${minutes}m ${leftover}s`;
            }
            return `${minutes.toFixed(0)}m`;
        }
        return `${seconds}s`;
    }
}