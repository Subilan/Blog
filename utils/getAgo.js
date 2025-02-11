import dayjsinstance from '@/dayjsinstance'
import 'dayjs/locale/zh-cn'

export default function(targetDate, omit = false) {
    dayjsinstance.locale('zh-cn');
    return dayjsinstance(targetDate).fromNow(omit);
}