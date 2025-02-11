import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from 'dayjs/plugin/duration';

export default function() {
    dayjs.locale('en-us');
    dayjs.extend(relativeTime);
    dayjs.extend(duration);
    const dur = dayjs.duration(dayjs().diff(dayjs('2019-08-17'), 'day'))

    return dur + ' days';
}