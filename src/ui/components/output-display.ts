import { t } from '@/i18n';

export class OutputDisplay {
  private readonly el: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className =
      'prose prose-sm dark:prose-invert max-w-none rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800';
    this.el.innerHTML = `<p class="text-gray-400">${t('output.empty')}</p>`;
    container.appendChild(this.el);
  }

  setContent(html: string): void {
    this.el.innerHTML = html;
  }

  setLoading(): void {
    this.el.innerHTML = `<p class="animate-pulse text-gray-400">${t('output.loading')}</p>`;
  }

  setError(message: string): void {
    this.el.innerHTML = `<p class="text-red-500">${message}</p>`;
  }

  clear(): void {
    this.el.innerHTML = `<p class="text-gray-400">${t('output.empty')}</p>`;
  }
}
