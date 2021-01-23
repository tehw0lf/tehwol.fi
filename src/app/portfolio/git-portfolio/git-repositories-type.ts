import { GitRepository } from './git-repository-type';

export enum GitProviders {
  github = 'GitHub',
  gitlab = 'GitLab'
}

export interface GitRepositories {
  github?: { own: GitRepository[]; forked: GitRepository[] };
  gitlab?: { own: GitRepository[]; forked: GitRepository[] };
}
