const getTimeRange = (period: string | null) => {
    const today = new Date();
    switch (period) {
        case 'morning':
            return {
                minTime: new Date(today.setHours(24, 0)),
                maxTime: new Date(today.setHours(11, 59))
            };
        case 'afternoon':
            return {
                minTime: new Date(today.setHours(12, 0)),
                maxTime: new Date(today.setHours(18, 0))
            };
        case 'evening':
            return {
                minTime: new Date(today.setHours(18, 0)),
                maxTime: new Date(today.setHours(23, 59))
            };
        default:
            // Default: no range
            return {
                minTime: undefined,
                maxTime: undefined
            };
    }
};
export default getTimeRange