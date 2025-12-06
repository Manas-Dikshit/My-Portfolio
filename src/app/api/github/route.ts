import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { maxBy, sumBy } from 'lodash';

import type { Week, Language, GitHubStatsResponse, Trend } from '@/types/github';
import env from '@/config/env';
import axios from 'axios';


export const revalidate = 604800


class GitHubStatsCalculator {

  static isWithinDays(dateString: string, days: number): boolean {
    return dayjs(dateString).isAfter(dayjs().subtract(days, 'day'));
  }


  // Streak Calculation 
  static calculateStreaks(weeks: Week[]): { current: number; longest: number } {
    const allDays = weeks.flatMap(w => w.contributionDays);
    const today = dayjs().startOf('day');

    let current = 0;
    let longest = 0;
    let temp = 0;

    // current streak
    for (let i = allDays.length - 1; i >= 0; i--) {
      const d = dayjs(allDays[i].date).startOf('day');
      if (d.isAfter(today)) continue;
      if (allDays[i].contributionCount > 0) {
        current++;
      } else if (current > 0) break;
    }

    // longest streak
    for (const day of allDays) {
      if (day.contributionCount > 0) {
        temp++;
        longest = Math.max(longest, temp);
      } else {
        temp = 0;
      }
    }

    return { current, longest };
  }

  //  Highest Commit Day
  static calculateHighestCommitDay(weeks: Week[]): { date: string; count: number } {
    const allDays = weeks.flatMap(w => w.contributionDays);
    const highest = maxBy(allDays, 'contributionCount');

    return {
      date: highest ? dayjs(highest.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      count: highest?.contributionCount || 0,
    };
  }

  //  Top Languages 
  static calculateTopLanguages(
    repositories: Array<{ isFork: boolean; primaryLanguage?: { name: string; color: string } }>
  ): Language[] {
    const langMap = new Map<string, { count: number; color: string }>();

    repositories
      .filter(r => !r.isFork)
      .forEach(repo => {
        if (repo.primaryLanguage) {
          const { name, color } = repo.primaryLanguage;
          const current = langMap.get(name) || { count: 0, color };
          langMap.set(name, { count: current.count + 1, color });
        }
      });

    const total = Array.from(langMap.values()).reduce((sum, l) => sum + l.count, 0);

    return Array.from(langMap.entries())
      .map(([name, data]) => ({
        name,
        color: data.color || '#000000',
        percentage: Math.round((data.count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }

  //  Totals 
  static calculateTotalStars(repositories: Array<{ stargazerCount: number }>): number {
    return sumBy(repositories, 'stargazerCount');
  }

  static countRepositoryTypes(
    repositories: Array<{ isFork: boolean }>
  ): { original: number; forked: number } {
    return repositories.reduce(
      (acc, r) => {
        if (r.isFork) acc.forked++;
        else acc.original++;
        return acc;
      },
      { original: 0, forked: 0 }
    );
  }

  static countPullRequestStates(
    pullRequests: Array<{ state: string }>
  ): { open: number; closed: number; merged: number } {
    return pullRequests.reduce(
      (acc, pr) => {
        const s = pr.state.toUpperCase();
        if (s === 'OPEN') acc.open++;
        else if (s === 'MERGED') acc.merged++;
        else if (s === 'CLOSED') acc.closed++;
        return acc;
      },
      { open: 0, closed: 0, merged: 0 }
    );
  }

  static countIssueStates(issues: Array<{ state: string }>): { open: number; closed: number } {
    return issues.reduce(
      (acc, i) => {
        const s = i.state.toUpperCase();
        if (s === 'OPEN') acc.open++;
        else if (s === 'CLOSED') acc.closed++;
        return acc;
      },
      { open: 0, closed: 0 }
    );
  }

  //  Weekly Metrics 
  static calculateWeeklyContributions(weeks: Week[]): number {
    const allDays = weeks.flatMap(w => w.contributionDays);
    return allDays
      .filter(d =>
        dayjs(d.date).isAfter(dayjs().subtract(7, 'day')) &&
        dayjs(d.date).isBefore(dayjs())
      )
      .reduce((sum, d) => sum + d.contributionCount, 0);
  }

  static calculateWeeklyRepositories(repositories: Array<{ createdAt: string }>): number {
    return repositories.filter(r => this.isWithinDays(r.createdAt, 7)).length;
  }

  static calculateWeeklyPullRequests(pullRequests: Array<{ createdAt: string }>): number {
    return pullRequests.filter(pr => this.isWithinDays(pr.createdAt, 7)).length;
  }

  static estimateWeeklyStars(
    repositories: Array<{ createdAt: string; stargazerCount: number }>
  ): number {
    return repositories
      .filter(r => this.isWithinDays(r.createdAt, 7))
      .reduce((sum, r) => sum + r.stargazerCount, 0);
  }

  //  Trend Calculation 
  static calculateTrend(weekly: number, total: number): Trend {
    return {
      value: weekly,
      percentage: total > 0 ? Math.round((weekly / total) * 100) : 0,
      isPositive: weekly > 0,
    };
  }

  static calculateWeeklyTrends(
    repositories: Array<{ createdAt: string; stargazerCount: number }>,
    pullRequests: Array<{ createdAt: string }>,
    weeks: Week[],
    totalRepositories: number,
    totalStars: number,
    totalContributions: number,
    totalPullRequests: number
  ) {
    const weeklyRepos = this.calculateWeeklyRepositories(repositories);
    const weeklyStars = this.estimateWeeklyStars(repositories);
    const weeklyContrib = this.calculateWeeklyContributions(weeks);
    const weeklyPRs = this.calculateWeeklyPullRequests(pullRequests);

    return {
      repositories: this.calculateTrend(weeklyRepos, totalRepositories),
      stars: this.calculateTrend(weeklyStars, totalStars),
      contributions: this.calculateTrend(weeklyContrib, totalContributions),
      pullRequests: this.calculateTrend(weeklyPRs, totalPullRequests),
    };
  }
}


// ----- Public fallback (no token required) -----
async function fetchPublicUser(username: string) {
  const headers = { Accept: 'application/vnd.github+json' };
  const { data } = await axios.get(`https://api.github.com/users/${username}`, { headers });
  return data as {
    public_repos: number;
    followers: number;
  };
}

async function fetchPublicRepos(username: string) {
  const headers = { Accept: 'application/vnd.github+json' };
  const { data } = await axios.get(
    `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=created&direction=desc`,
    { headers },
  );
  return data as Array<{
    fork: boolean;
    stargazers_count: number;
    created_at: string;
    language: string | null;
  }>;
}

async function fetchPublicFollowers(username: string) {
  const headers = { Accept: 'application/vnd.github+json' };
  const { data } = await axios.get(
    `https://api.github.com/users/${username}/followers?per_page=10`,
    { headers },
  );
  return (data as Array<{ login: string; avatar_url: string; html_url: string }>).map((f) => ({
    login: f.login,
    avatarUrl: f.avatar_url,
    url: f.html_url,
  }));
}

async function searchCount(q: string) {
  const headers = { Accept: 'application/vnd.github+json' };
  const { data } = await axios.get(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}`, { headers });
  return (data?.total_count as number) || 0;
}

async function fetchPublicPRAndIssueStats(username: string) {
  // Pull requests
  const prTotal = await searchCount(`type:pr author:${username}`);
  const prMerged = await searchCount(`is:pr is:merged author:${username}`);
  const prOpen = await searchCount(`is:pr is:open author:${username}`);
  const prClosedAll = await searchCount(`is:pr is:closed author:${username}`);
  const prClosed = Math.max(prClosedAll - prMerged, 0);

  // Issues
  const issuesTotal = await searchCount(`is:issue author:${username}`);
  const issuesOpen = await searchCount(`is:issue is:open author:${username}`);
  const issuesClosed = await searchCount(`is:issue is:closed author:${username}`);

  return {
    pr: { total: prTotal, open: prOpen, closed: prClosed, merged: prMerged },
    issues: { total: issuesTotal, open: issuesOpen, closed: issuesClosed },
  };
}

async function fetchPublicEvents(username: string) {
  const headers = { Accept: 'application/vnd.github+json' };
  const { data } = await axios.get(
    `https://api.github.com/users/${username}/events/public?per_page=100`,
    { headers },
  );
  return data as Array<{ type: string; created_at: string; payload?: { size?: number } }>;
}

async function fetchContributionDays(username: string) {
  const year = dayjs().year();
  const url = `https://github.com/users/${username}/contributions?from=${year}-01-01&to=${year}-12-31`;
  const { data: html } = await axios.get(url, { headers: { Accept: 'text/html' } });
  const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"/g;
  const days: Array<{ date: string; contributionCount: number; color: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    const date = match[1];
    const count = parseInt(match[2], 10) || 0;
    days.push({ date, contributionCount: count, color: '#9be9a8' });
  }
  // Group into weeks by week start (Sunday)
  const weeksMap = new Map<string, { firstDay: string; contributionDays: { date: string; color: string; contributionCount: number }[] }>();
  for (const d of days) {
    const first = dayjs(d.date).startOf('week').format('YYYY-MM-DD');
    const arr = weeksMap.get(first) || { firstDay: first, contributionDays: [] };
    arr.contributionDays.push({ date: d.date, color: d.color, contributionCount: d.contributionCount });
    weeksMap.set(first, arr);
  }
  const weeks = Array.from(weeksMap.values())
    .sort((a, b) => (a.firstDay < b.firstDay ? -1 : 1))
    .map((w) => ({
      firstDay: w.firstDay,
      contributionDays: w.contributionDays.sort((a, b) => (a.date < b.date ? -1 : 1)),
    }));

  return {
    colors: [],
    totalContributions: days.reduce((s, d) => s + d.contributionCount, 0),
    months: [],
    weeks,
  };
}

async function buildPublicStats(username: string): Promise<GitHubStatsResponse> {
  const [user, repos, followers, prIssue, events] = await Promise.all([
    fetchPublicUser(username),
    fetchPublicRepos(username),
    fetchPublicFollowers(username),
    fetchPublicPRAndIssueStats(username),
    fetchPublicEvents(username),
  ]);

  // languages
  const langMap = new Map<string, { count: number }>();
  for (const r of repos) {
    if (r.language) {
      const o = langMap.get(r.language) || { count: 0 };
      o.count += 1;
      langMap.set(r.language, o);
    }
  }
  const totalLang = Array.from(langMap.values()).reduce((s, v) => s + v.count, 0) || 1;
  const topLanguages: Language[] = Array.from(langMap.entries())
    .map(([name, v]) => ({ name, color: '#3b82f6', percentage: Math.round((v.count / totalLang) * 100) }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const repoTypes = repos.reduce(
    (acc, r) => {
      if (r.fork) acc.forked += 1; else acc.original += 1; return acc;
    },
    { original: 0, forked: 0 },
  );

  // Weekly trends (approx):
  const sevenDaysAgo = dayjs().subtract(7, 'day');
  const weeklyRepos = repos.filter((r) => dayjs(r.created_at).isAfter(sevenDaysAgo)).length;
  // Contributions from events (PushEvent count size)
  const weeklyContrib = events
    .filter((e) => dayjs(e.created_at).isAfter(sevenDaysAgo) && e.type === 'PushEvent')
    .reduce((sum, e) => sum + (e.payload?.size || 0), 0);
  const weeklyPRs = await searchCount(`type:pr author:${username} created:>=${sevenDaysAgo.format('YYYY-MM-DD')}`);

  const contributionsCalendar = await fetchContributionDays(username);

  const streaks = GitHubStatsCalculator.calculateStreaks(contributionsCalendar.weeks as Week[]);
  const highest = GitHubStatsCalculator.calculateHighestCommitDay(contributionsCalendar.weeks as Week[]);

  return {
    contributionsCollection: { contributionCalendar: contributionsCalendar },
    totalRepositories: user.public_repos,
    totalStars,
    followers: { totalCount: followers.length, nodes: followers },
    topLanguages,
      // Total contributions (numeric) from the contribution calendar
      contributions: contributionsCalendar.totalContributions,
    pullRequests: {
      total: prIssue.pr.total,
      open: prIssue.pr.open,
      closed: prIssue.pr.closed,
      merged: prIssue.pr.merged,
    },
    issues: {
      total: prIssue.issues.total,
      open: prIssue.issues.open,
      closed: prIssue.issues.closed,
    },
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    highestCommitDay: highest,
    repositories: {
      total: user.public_repos,
      original: repoTypes.original,
      forked: repoTypes.forked,
    },
    weeklyTrends: {
      repositories: GitHubStatsCalculator.calculateTrend(weeklyRepos, user.public_repos),
      stars: { value: 0, percentage: 0, isPositive: false }, // not available without many requests
      contributions: GitHubStatsCalculator.calculateTrend(weeklyContrib, contributionsCalendar.totalContributions),
      pullRequests: GitHubStatsCalculator.calculateTrend(weeklyPRs, prIssue.pr.total),
    },
  };
}


const GITHUB_GRAPHQL_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          colors
          totalContributions
          months {
            firstDay
            name
            totalWeeks
          }
          weeks {
            contributionDays {
              color
              contributionCount
              date
            }
            firstDay
          }
        }
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          isFork
          stargazerCount
          createdAt
          primaryLanguage {
            name
            color
          }
        }
      }
      followers(first: 10) {
        totalCount
        nodes {
          login
          avatarUrl
          url
        }
      }
      pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          state
          createdAt
        }
      }
      issues(first: 100) {
        totalCount
        nodes {
          state
        }
      }
    }
  }
`;


export async function GET() {
  try {
    // If no token configured, build stats from public GitHub endpoints (no secrets required)
    if (!env.GITHUB_TOKEN) {
      if (!env.NEXT_PUBLIC_GITHUB_USERNAME) {
        return NextResponse.json({ success: false, message: 'NEXT_PUBLIC_GITHUB_USERNAME is not set' }, { status: 400 });
      }
      const stats = await buildPublicStats(env.NEXT_PUBLIC_GITHUB_USERNAME);
      return NextResponse.json({ success: true, data: stats, message: 'Fetched public GitHub stats' });
    }

    const response = await axios.post('https://api.github.com/graphql', {
      query: GITHUB_GRAPHQL_QUERY,
      variables: { username: env.NEXT_PUBLIC_GITHUB_USERNAME },
    }, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });



    const { data, errors } = response.data;

    if (errors) {
      console.error('GraphQL query failed:', errors);
      return NextResponse.json({ success: false, message: 'GraphQL query failed' }, { status: 500 });
    }

    if (!data?.user) {
      return NextResponse.json({ success: false, message: `User '${env.NEXT_PUBLIC_GITHUB_USERNAME}' not found` }, { status: 404 });
    }

    const user = data.user;

    // Raw data
    const repositories = user.repositories.nodes || [];
    const pullRequests = user.pullRequests.nodes || [];
    const issues = user.issues.nodes || [];
    const contributionCalendar = user.contributionsCollection.contributionCalendar;
    const weeks = contributionCalendar.weeks || [];

    // Derived stats
    const repoTypes = GitHubStatsCalculator.countRepositoryTypes(repositories);
    const prStates = GitHubStatsCalculator.countPullRequestStates(pullRequests);
    const issueStates = GitHubStatsCalculator.countIssueStates(issues);
    const streaks = GitHubStatsCalculator.calculateStreaks(weeks);
    const highestDay = GitHubStatsCalculator.calculateHighestCommitDay(weeks);
    const topLanguages = GitHubStatsCalculator.calculateTopLanguages(repositories);
    const totalStars = GitHubStatsCalculator.calculateTotalStars(repositories);
    const totalRepos = user.repositories.totalCount;
    const totalContrib = contributionCalendar.totalContributions;
    const totalPRs = user.pullRequests.totalCount;

    // Weekly trends
    const weeklyTrends = GitHubStatsCalculator.calculateWeeklyTrends(
      repositories,
      pullRequests,
      weeks,
      totalRepos,
      totalStars,
      totalContrib,
      totalPRs
    );


    const stats: GitHubStatsResponse = {
      contributionsCollection: {
        contributionCalendar: {
          colors: contributionCalendar.colors,
          totalContributions: contributionCalendar.totalContributions,
          months: contributionCalendar.months,
          weeks: contributionCalendar.weeks,
        },
      },
      totalRepositories: totalRepos,
      totalStars,
      followers: {
        totalCount: user.followers.totalCount,
        nodes: user.followers.nodes.map((f: any) => ({
          login: f.login,
          avatarUrl: f.avatarUrl,
          url: f.url,
        })),
      },
      topLanguages,
    contributions: totalContrib,
      pullRequests: {
        total: totalPRs,
        open: prStates.open,
        closed: prStates.closed,
        merged: prStates.merged,
      },
      issues: {
        total: user.issues.totalCount,
        open: issueStates.open,
        closed: issueStates.closed,
      },
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      highestCommitDay: highestDay,
      repositories: {
        total: totalRepos,
        original: repoTypes.original,
        forked: repoTypes.forked,
      },
      weeklyTrends,
    };

    return NextResponse.json({ success: true, data: stats, message: "Successfully fetched GitHub statistics" });
  } catch (err) {
    console.error('Failed to fetch GitHub statistics:', (err as Error).message)
    // Try public fallback if username exists
    try {
      if (env.NEXT_PUBLIC_GITHUB_USERNAME) {
        const stats = await buildPublicStats(env.NEXT_PUBLIC_GITHUB_USERNAME);
        return NextResponse.json({ success: true, data: stats, message: 'Fetched public GitHub stats (fallback)' });
      }
    } catch (e) {
      console.error('Public fallback failed:', (e as Error).message)
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch GitHub statistics' }, { status: 500 });
  }
}
