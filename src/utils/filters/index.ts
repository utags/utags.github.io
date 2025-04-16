import { defaultFilterRegistry } from '../filter-registry';
import { timeFilter } from './time-filter';
import { noteFilter } from './note-filter';

// 注册默认过滤器
defaultFilterRegistry
  .register(timeFilter)
  .register(noteFilter);
