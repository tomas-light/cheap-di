import cheapDi from 'cheap-di';
import { LocaleApi } from './LocaleApi';

const localeApi = cheapDi.container.resolve(LocaleApi);

if (!localeApi) {
  console.log('no locale api class');
} else {
  localeApi.log();
}
