import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from 'dayjs/plugin/duration';

export default function() {
    dayjs.locale('en-us');
    dayjs.extend(relativeTime);
    dayjs.extend(duration);
    const dur = dayjs.duration(dayjs().diff(dayjs('2019-08-17')))

    return dur.format('Y[y]H[h]m[m]s[s]')
}