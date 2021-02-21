import { DependencyRegistrator } from './DependencyRegistrator';
import { DependencyResolver } from './DependencyResolver';

export type Container = DependencyRegistrator & DependencyResolver;
