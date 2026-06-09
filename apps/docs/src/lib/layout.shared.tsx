import { i18n } from '@/lib/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add('ui', {
    en: {
      displayName: 'English',
    },
    cn: {
      displayName: '简体中文',
      search: '搜索文档',
    },
  });

export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    nav: {
      title: "Better Captcha",
    },
    i18n: true,
  };
}