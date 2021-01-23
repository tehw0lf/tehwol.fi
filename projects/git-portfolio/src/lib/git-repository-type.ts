export class GitRepository {
  id: number;
  clone_url?: string;
  http_url_to_repo?: string;
  created_at: string;
  description: string;
  fork?: boolean;
  forks_count: number;
  html_url?: string;
  web_url?: string;
  language?: string;
  license?: {
    key: string;
    name: string;
    node_id: string;
    spdx_id: string;
    url: string;
  };
  name: string;
  open_issues_count?: number;
  owner?: {
    avatar_url: string;
  };
  namespace?: {
    avatar_url: string;
  };
  pushed_at?: string;
  last_activity_at?: string;
  stargazers_count?: number;
  star_count?: number;
}
