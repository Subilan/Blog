import dayjsinstance from '~/dayjsinstance';

export default function() {
    dayjsinstance.locale('en-us');
    const dur = dayjsinstance.duration(dayjsinstance().diff(dayjsinstance('2019-08-17')))

    return dur.format('Y[y]H[h]m[m]s[s]')
}