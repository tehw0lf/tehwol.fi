import { GitRepository } from './git-repository-type';

export interface GitRepositories {
  github?: { own: GitRepository[]; forked: GitRepository[] };
  gitlab?: { own: GitRepository[]; forked: GitRepository[] };
}
