/* eslint-disable @typescript-eslint/naming-convention */
export class GitRepository {
  id: number | undefined;
  clone_url?: string;
  http_url_to_repo?: string;
  created_at: string | undefined;
  description: string | undefined;
  fork?: boolean;
  forks_count: number | undefined;
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
  name: string | undefined;
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
