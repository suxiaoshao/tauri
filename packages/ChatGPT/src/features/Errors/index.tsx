import { useTranslation } from 'react-i18next';

export default function Error() {
  const { t } = useTranslation();
  return (
    <div className="size-full bg-card">
      <div className="p-4 px-8 flex flex-col justify-center items-center">
        <p className="text-2xl">{t('error')}</p>
        <p className="text-sm">{t('error_page_message')}</p>
      </div>
    </div>
  );
}
