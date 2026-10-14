import { createApp, version } from 'vue';
import Starter from './examples/Starter.vue';
import WeatherComputed from './examples/WeatherComputed.vue';
import WeatherWatch from './examples/WeatherWatch.vue';
import DeepWatch from './examples/DeepWatch.vue';
import ListRendering from './examples/ListRendering.vue';
import './style.css';

const examples = {
  starter: Starter,
  weather: WeatherComputed,
  watch: WeatherWatch,
  'deep-watch': DeepWatch,
  lists: ListRendering,
};

createApp(examples[document.body.dataset.example]).mount('#root');
document.querySelector('#root').dataset.vueVersion = version;
