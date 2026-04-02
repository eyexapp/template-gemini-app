import { t } from '@/i18n';
import type { ImagePart } from '@/core/types';
import { fileToImagePart } from '@/services/image-service';

export interface PromptFormEvents {
  onSubmit: (text: string, image?: ImagePart) => void;
}

export class PromptForm {
  private readonly el: HTMLFormElement;
  private readonly input: HTMLTextAreaElement;
  private readonly fileInput: HTMLInputElement;
  private readonly submitBtn: HTMLButtonElement;
  private readonly uploadBtn: HTMLButtonElement;
  private readonly preview: HTMLDivElement;
  private currentImage?: ImagePart;

  constructor(
    container: HTMLElement,
    private readonly events: PromptFormEvents,
  ) {
    this.el = document.createElement('form');
    this.el.className = 'flex flex-col gap-3';

    this.preview = document.createElement('div');
    this.preview.className = 'hidden';

    this.input = document.createElement('textarea');
    this.input.placeholder = t('prompt.placeholder');
    this.input.rows = 3;
    this.input.className =
      'w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.className = 'hidden';

    this.uploadBtn = document.createElement('button');
    this.uploadBtn.type = 'button';
    this.uploadBtn.textContent = t('prompt.imageUpload');
    this.uploadBtn.className =
      'rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700';

    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'submit';
    this.submitBtn.textContent = t('prompt.submit');
    this.submitBtn.className =
      'rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-2 justify-end';
    actions.append(this.uploadBtn, this.submitBtn);

    this.el.append(this.preview, this.input, this.fileInput, actions);
    container.appendChild(this.el);

    this.bind();
  }

  private bind(): void {
    this.uploadBtn.addEventListener('click', () => this.fileInput.click());

    this.fileInput.addEventListener('change', async () => {
      const file = this.fileInput.files?.[0];
      if (!file) return;
      this.currentImage = await fileToImagePart(file);
      this.preview.className = 'mb-2';
      this.preview.innerHTML = `<img src="data:${this.currentImage.mimeType};base64,${this.currentImage.data}" class="h-20 rounded-lg" alt="preview" />`;
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input.value.trim();
      if (!text) return;
      this.events.onSubmit(text, this.currentImage);
      this.input.value = '';
      this.currentImage = undefined;
      this.preview.className = 'hidden';
      this.preview.innerHTML = '';
      this.fileInput.value = '';
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.el.requestSubmit();
      }
    });
  }

  setLoading(loading: boolean): void {
    this.submitBtn.disabled = loading;
    this.input.disabled = loading;
  }
}
