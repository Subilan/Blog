import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn'

export default function(targetDate, omit = false) {
    dayjs.extend(relativeTime)
    dayjs.locale('zh-cn');
    return dayjs(targetDate).fromNow(omit);
}