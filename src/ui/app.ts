import { getConfig } from '@/core/config';
import type { AIMessage, ImagePart } from '@/core/types';
import { createAIProvider } from '@/adapters';
import { AIService } from '@/services/ai-service';
import { t } from '@/i18n';
import { PromptForm } from './components/prompt-form';
import { OutputDisplay } from './components/output-display';

export class App {
  private readonly aiService: AIService;
  private form!: PromptForm;
  private output!: OutputDisplay;

  constructor() {
    const config = getConfig();
    const provider = createAIProvider(config.provider, config.ai);
    this.aiService = new AIService(provider);
  }

  mount(root: HTMLElement): void {
    root.className = 'mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6';

    const header = document.createElement('h1');
    header.textContent = t('app.title');
    header.className = 'text-2xl font-bold text-gray-900 dark:text-white';

    const outputContainer = document.createElement('div');
    outputContainer.className = 'flex-1';

    const formContainer = document.createElement('div');

    root.append(header, outputContainer, formContainer);

    this.output = new OutputDisplay(outputContainer);
    this.form = new PromptForm(formContainer, {
      onSubmit: (text, image) => this.handleSubmit(text, image),
    });
  }

  private async handleSubmit(text: string, image?: ImagePart): Promise<void> {
    this.form.setLoading(true);
    this.output.setLoading();

    const message: AIMessage = {
      role: 'user',
      parts: [
        ...(image ? [image] : []),
        { type: 'text' as const, text },
      ],
    };

    try {
      for await (const html of this.aiService.streamMarkdown([message])) {
        this.output.setContent(html);
      }
    } catch {
      this.output.setError(t('error.generation'));
    } finally {
      this.form.setLoading(false);
    }
  }
}
