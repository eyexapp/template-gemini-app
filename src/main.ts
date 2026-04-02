import './index.css';
import { App } from './ui/app';

const root = document.getElementById('app');
if (root) {
  const app = new App();
  app.mount(root);
}
