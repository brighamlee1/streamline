import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(duration);

// ==================== Format Datetime ====================
export const niceDatetime = (dateString, dateOnly = false) => {
    if (typeof dateString !== 'string') return '-';

    if (dateOnly) {
        return dayjs(dateString).format('MMM DD, YYYY');
    } else {
        return dayjs(dateString).format('MMM DD, YYYY h:mm A');
    }
};

// ==================== Format Currency ====================
export const formatCurrency = (number) => {
    if (typeof number === 'string') number = parseFloat(number);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(number);
};

// ==================== Show Relative Time ====================
export const useRelativeDatetime = (dateString) => {
    if (typeof dateString !== 'string') return '-';

    const date = dayjs(dateString);
    const now = dayjs();

    if (date.isBefore(now)) {
        return date.from(now);
    } else {
        return now.to(date);
    }
};
