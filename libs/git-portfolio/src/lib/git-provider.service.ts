import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  defer,
  expand,
  Observable,
  of,
  reduce,
  throwError,
  zip
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  share,
  takeWhile,
  tap
} from 'rxjs/operators';

import { GitProviderConfig } from './types/git-provider-config-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

interface CacheEntry {
  data: GitRepositories;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export class GitProviderService {
  private http = inject(HttpClient);
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 50;

  private loadingStateSubject = new BehaviorSubject<boolean>(true);
  private repositorySubject = new BehaviorSubject<GitRepositories>({});
  private repositoryCache = new Map<string, CacheEntry>();

  /**
   * Keyed by cache key, but each entry carries its own token. A settling
   * request may only write the cache or clean up while it still *owns* the
   * entry — clearCache() drops ownership, and a newer request for the same key
   * takes it over. Without that, a response already on the wire would
   * repopulate the cache it was just told to forget, and a late straggler
   * would delete the tracking entry belonging to the request that replaced it.
   */
  private inFlightRequests = new Map<
    string,
    { token: symbol; request: Observable<GitRepositories> }
  >();

  /**
   * Bumped by clearCache(). The shared state needs its own generation rather
   * than the ownership token above, because a request releases that token as
   * its value lands — before withLoadingState() sees the same value — so by
   * then ownership can no longer tell a current load from an invalidated one.
   */
  private stateGeneration = 0;

  get loading(): Observable<boolean> {
    return this.loadingStateSubject.asObservable();
  }

  /**
   * A failed fetch must not settle in the cache, so a single dropped
   * connection cannot keep the portfolio broken long after the network
   * returned. Only a successful response is stored.
   */
  private evictCacheEntry(cacheKey: string): void {
    this.repositoryCache.delete(cacheKey);
  }

  /**
   * The cache holds the settled response, not the observable that produced it.
   *
   * It used to hold the in-flight stream, kept alive by a non-ref-counted
   * shareReplay(1), and that is irreconcilable with cancelling an abandoned
   * load: the operator must outlive its subscribers for a later hit to replay,
   * which is exactly what stops it from dying when the caller walks away. A
   * superseded load therefore kept paging against a rate-limited API and still
   * ran its side effects, clearing the spinner out from under the load that
   * replaced it. refCount only trades the bug for a worse one — a consumer
   * that takes a single value leaves before the stream completes, so the next
   * hit refetches instead of replaying.
   *
   * Caching the value settles it. A hit is `of(value)`, which needs nothing
   * kept alive; a miss is an ordinary cancellable request.
   */
  getRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    const cacheKey = this.createCacheKey(gitProviderUserNames);
    const cachedEntry = this.repositoryCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return this.withLoadingState(of(cachedEntry.data));
    }

    // An identical request already on the wire: share that one rather than
    // opening a second. This stream is only ever the in-flight request, so it
    // is dropped as soon as it settles and never becomes a stale cache.
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      return this.withLoadingState(inFlight.request);
    }

    // Clean up expired entries and manage cache size
    this.cleanupCache();

    // This request's claim on the key. Every write below is guarded by it, so
    // a request that has been superseded or cleared touches nothing.
    const token = Symbol(cacheKey);
    const owns = () => this.inFlightRequests.get(cacheKey)?.token === token;
    const release = () => {
      if (owns()) this.inFlightRequests.delete(cacheKey);
    };

    const request$ = this.fetchRepositories(gitProviderUserNames).pipe(
      tap((repositories: GitRepositories) => {
        // Only the owner may fill the cache: otherwise a response already on
        // the wire when clearCache() ran would put back what was just dropped.
        if (!owns()) return;
        this.repositoryCache.set(cacheKey, {
          data: repositories,
          timestamp: Date.now(),
          ttl: this.CACHE_TTL
        });
        // Released as the value lands, not in finalize: a subscriber that
        // calls back into getRepositories from its own next handler must see
        // the settled cache, not a request that is technically still open.
        release();
      }),
      catchError((error: unknown) => {
        if (owns()) {
          this.evictCacheEntry(cacheKey);
          release();
        }
        return throwError(() => error);
      }),
      // Covers the paths the two handlers above do not: an unsubscribe before
      // the response, which would otherwise strand the entry forever.
      finalize(release),
      share()
    );

    this.inFlightRequests.set(cacheKey, { token, request: request$ });

    return this.withLoadingState(request$);
  }

  /**
   * The shared-state writes, wrapped around the stream rather than baked into
   * it, so they belong to one subscription and die with it. An abandoned load
   * therefore stops touching `loading`, while a cache hit still reports the
   * state its own subscriber expects.
   *
   * Loading ends on both paths, otherwise the spinner outlives the request.
   */
  private withLoadingState(
    repositories$: Observable<GitRepositories>
  ): Observable<GitRepositories> {
    // defer so the generation is read per subscription, at the moment this
    // load actually starts, rather than once when the observable is built.
    return defer(() => {
      const generation = this.stateGeneration;
      const current = () => generation === this.stateGeneration;

      return repositories$.pipe(
        tap((repositories: GitRepositories) => {
          // A load invalidated by clearCache() must not report itself done:
          // its replacement may still be in flight, and clearing the spinner
          // on its behalf would show an empty portfolio as a finished one.
          if (!current()) return;
          this.repositorySubject.next(repositories);
          this.loadingStateSubject.next(false);
        }),
        catchError((error: unknown) => {
          if (current()) this.loadingStateSubject.next(false);
          return throwError(() => error);
        })
      );
    });
  }

  private createCacheKey(config?: GitProviderConfig): string {
    if (!config) return 'default';
    const parts: string[] = [];
    if (config.github) parts.push(`gh:${config.github}`);
    if (config.gitlab) parts.push(`gl:${config.gitlab}`);
    return parts.join('|') || 'default';
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) < entry.ttl;
  }

  private cleanupCache(): void {
    // Remove expired entries
    for (const [key, entry] of this.repositoryCache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.repositoryCache.delete(key);
      }
    }
    
    // If cache is still too large, remove oldest entries
    if (this.repositoryCache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.repositoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE + 1);
      toRemove.forEach(([key]) => this.repositoryCache.delete(key));
    }
  }

  fetchRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    return zip(
      this.fetchGithubRepositories(gitProviderUserNames?.github ?? ''),
      this.fetchGitlabRepositories(gitProviderUserNames?.gitlab ?? '')
    ).pipe(
      map((gitRepositoryMap: GitRepository[][]) => {
        const repositories: GitRepositories = {
          github: this.filterAndSortGitRepositories(gitRepositoryMap[0]),
          gitlab: this.filterAndSortGitRepositories(gitRepositoryMap[1])
        };
        return repositories;
      })
    );
  }

  private filterAndSortGitRepositories(gitRepositoryArray: GitRepository[]): {
    own: GitRepository[];
    forked: GitRepository[];
  } {
    return {
      own: gitRepositoryArray
        .filter((gitRepository: GitRepository) => !gitRepository.fork)
        .sort(
          (repoA: GitRepository, repoB: GitRepository) =>
            (repoB.stargazers_count ?? 0) - (repoA.stargazers_count ?? 0)
        ),
      forked: gitRepositoryArray
        .filter((gitRepository: GitRepository) => gitRepository.fork)
        .sort(
          (repoA: GitRepository, repoB: GitRepository) =>
            (repoB.stargazers_count ?? 0) - (repoA.stargazers_count ?? 0)
        )
    };
  }

  /**
   * Every page must arrive before the result counts. A page that fails midway
   * would otherwise reduce to whatever was collected so far, and since the
   * providers sort by name rather than by fork flag, a truncated list renders
   * as a real but incomplete portfolio — "no forked repositories" instead of an
   * error. Failing the whole fetch keeps a partial answer from posing as a
   * complete one.
   *
   * Deliberately not shared. Each call feeds exactly one zip() in
   * fetchRepositories, so shareReplay bought no sharing here — but because it
   * is not ref-counted it held the subscription open, and unsubscribing
   * upstream then never tore the chain down. A caller that abandons a load
   * (the component's switchMap, on a config change) would keep this paging
   * through every remaining page against a rate-limited API. The result is
   * shared once, at the level that caches it: getRepositories.
   */
  private fetchAllPages<T>(firstUrl: string): Observable<T[]> {
    return this.http.get<T[]>(firstUrl, { observe: 'response' }).pipe(
      expand((response) => {
        const next = this.parseLinkHeader(response.headers.get('Link'));
        return next
          ? this.http.get<T[]>(next, { observe: 'response' })
          : of(null);
      }),
      takeWhile((response): response is HttpResponse<T[]> => response !== null),
      reduce(
        (acc: T[], response) => acc.concat(response.body ?? []),
        []
      )
    );
  }

  private parseLinkHeader(header: string | null): string | null {
    if (!header) return null;
    const match = header.match(/<([^>]+)>;\s*rel="next"/);
    return match ? match[1] : null;
  }

  private fetchGithubRepositories(
    githubUser: string
  ): Observable<GitRepository[]> {
    if (githubUser !== '') {
      return this.fetchAllPages<GitRepository>(
        `https://api.github.com/users/${githubUser}/repos?per_page=100`
      );
    }
    return of([]);
  }

  private fetchGitlabRepositories(
    gitlabUser: string
  ): Observable<GitRepository[]> {
    if (gitlabUser !== '') {
      return this.fetchAllPages<GitRepository>(
        `https://gitlab.com/api/v4/users/${gitlabUser}/projects?per_page=100`
      );
    }
    return of([]);
  }

  clearCache(): void {
    // Invalidates both halves: the cache ownership above, and the shared
    // state, so a request already on the wire can neither refill the cache
    // nor report itself finished once its result is no longer wanted.
    this.stateGeneration++;
    this.repositoryCache.clear();
    // Otherwise a request already on the wire would still populate the cache
    // it was just asked to forget.
    this.inFlightRequests.clear();
    this.loadingStateSubject.next(true);
    this.repositorySubject.next({});
  }
}
