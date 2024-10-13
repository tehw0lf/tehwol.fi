import { GitRepository } from './git-repository-type';

export interface GitRepositories {
  [key: string]: { [key: string]: GitRepository[] } | undefined;
  github?: { own: GitRepository[]; forked: GitRepository[] };
  gitlab?: { own: GitRepository[]; forked: GitRepository[] };
}
